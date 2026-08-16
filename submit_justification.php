<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    exit;
}

require_once("../config/database.php");

$employeeId = intval($_POST["employee_id"] ?? 0);

$attendanceId = intval($_POST["attendance_id"] ?? 0);

$reason = trim($_POST["reason"] ?? "");

$description = trim($_POST["description"] ?? "");

if ($employeeId == 0 || $attendanceId == 0 || $reason == "") {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}$stmt = $conn->prepare("
INSERT INTO attendance_justifications
(
    attendance_id,
    employee_id,
    reason
)
VALUES
(
    ?,
    ?,
    ?
)
");

$stmt->bind_param(
    "iis",
    $attendanceId,
    $employeeId,
    $reason
);

if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);

    exit;
}
$update = $conn->prepare("
UPDATE attendance
SET
    justification = ?,
    justification_status = 'Submitted',
    justification_submitted_at = NOW()
WHERE id = ?
");

$update->bind_param(
    "si",
    $description,
    $attendanceId
);
$update->execute();
/*
|--------------------------------------------------------------------------
| Get Assignment ID
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
SELECT assignment_id
FROM attendance
WHERE id = ?
");

$stmt->bind_param("i", $attendanceId);
$stmt->execute();

$result = $stmt->get_result()->fetch_assoc();

$assignmentId = (int)$result["assignment_id"];
/*
|--------------------------------------------------------------------------
| Complete Current Assignment
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
UPDATE shift_assignments
SET assignment_status = 'Completed'
WHERE id = ?
");

$stmt->bind_param("i", $assignmentId);
$stmt->execute();
/*
|--------------------------------------------------------------------------
| Activate Next Pending Assignment
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
UPDATE shift_assignments
SET assignment_status = 'Active'
WHERE id = (
    SELECT id
    FROM (
        SELECT id
        FROM shift_assignments
        WHERE employee_id = ?
        AND assignment_status = 'Pending'
        ORDER BY assignment_start ASC
        LIMIT 1
    ) next_assignment
)
");

$stmt->bind_param("i", $employeeId);
$stmt->execute();
echo json_encode([
    "success" => true,
    "message" => "Justification submitted successfully."
]);