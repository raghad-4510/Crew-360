<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}
header('Content-Type: application/json');

session_start();

include "../config/database.php";

// Temporary for development
if (!isset($_SESSION['employee_id'])) {
    $_SESSION['employee_id'] = 2;
}

$employeeId = $_SESSION['employee_id'];

$sql = "
SELECT
     sa.id AS assignment_id,
    s.*,
    sh.shift_name,
    sh.start_time,
    sh.end_time,
    sh.preparation_minutes,

    a.id AS attendance_id,
    a.status AS attendance_status,
    a.justification_status,
    a.replacement_status,
    a.replacement_employee_id

FROM shift_assignments sa

JOIN stations s
    ON sa.station_id = s.id

JOIN shifts sh
    ON sa.shift_id = sh.id

LEFT JOIN attendance a
    ON a.assignment_id = sa.id
    AND a.attendance_date = CURDATE()

WHERE sa.employee_id = $employeeId
AND sa.assignment_status = 'Active'

LIMIT 1
";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode([
        "error" => mysqli_error($conn)
    ]);
    exit;
}

if (mysqli_num_rows($result) == 0) {

    echo json_encode([
        "error" => "No active assignment found"
    ]);

    exit;
}

$row = mysqli_fetch_assoc($result);

$assignmentId = $row["assignment_id"];

$today = date("Y-m-d");

$attendanceQuery = mysqli_query(
    $conn,
    "
    SELECT *
FROM attendance
WHERE assignment_id = $assignmentId
AND attendance_date = '$today'
ORDER BY id DESC
LIMIT 1
    "
);

$attendance = mysqli_fetch_assoc($attendanceQuery);

if (!$attendance) {

    $shiftStart = new DateTime(
        $today . " " . $row["start_time"]
    );

    $prepDeadline = clone $shiftStart;
    $prepDeadline->modify(
        "-" . intval($row["preparation_minutes"]) . " minutes"
    );

    $now = new DateTime();

    if ($now >= $prepDeadline) {

        $stmt = $conn->prepare("
            INSERT INTO attendance
            (
                assignment_id,
                attendance_date,
                status,
                replacement_status,
                justification_status
            )
            VALUES
            (
                ?, ?, 'Absent', 'Assigned', 'Required'
            )
        ");

        $stmt->bind_param(
            "is",
            $assignmentId,
            $today
        );

        $stmt->execute();

        $attendanceId = $conn->insert_id;

        $attendance = [
            "id" => $attendanceId,
            "status" => "Absent",
            "replacement_status" => "Assigned",
            "justification_status" => "Required"
        ];
    }
}
$row["attendance"] = $attendance;

$row["attendance_id"] =
    $attendance["id"] ?? null;

$row["attendance_status"] =
    $attendance["status"] ?? null;

$row["check_in_time"] =
    $attendance["check_in"] ?? null;
 $row["checked_in"] =
    !empty($attendance["check_in"]);

$row["replacement_status"] =
    $attendance["replacement_status"] ?? null;

$row["justification_status"] =
    $attendance["justification_status"] ?? null;

echo json_encode($row);