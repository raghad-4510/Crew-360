<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

session_start();

include "../config/database.php";

// Temporary for development
if (!isset($_SESSION["employee_id"])) {
    $_SESSION["employee_id"] = 2;
}

$employeeId = (int) $_SESSION["employee_id"];
$today = date("Y-m-d");
$now = new DateTime();

$sql = "
    SELECT
        e.id,
        e.employee_number,
        e.first_name,
        e.last_name,
        e.position,

        sa.id AS assignment_id,
        sa.assignment_status,

        s.station_name,

        sh.shift_name,
        sh.start_time,
        sh.end_time,
        sh.preparation_minutes

    FROM employees e

    JOIN shift_assignments sa
        ON sa.employee_id = e.id

    JOIN stations s
        ON sa.station_id = s.id

    JOIN shifts sh
        ON sa.shift_id = sh.id

    WHERE
        e.id = ?
        AND sa.assignment_status IN ('Active', 'Pending')

    ORDER BY sh.start_time ASC
";

$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "error" => "Unable to prepare shifts query"
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "i", $employeeId);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode([]);
    exit;
}

$attendanceSql = "
    SELECT
        id,
        status,
        check_in,
        justification_status,
        replacement_status,
        replacement_employee_id
    FROM attendance
    WHERE assignment_id = ?
        AND attendance_date = ?
    ORDER BY id DESC
    LIMIT 1
";

$attendanceStmt = mysqli_prepare($conn, $attendanceSql);

$insertAbsentSql = "
    INSERT INTO attendance (
        assignment_id,
        attendance_date,
        status,
        replacement_status,
        justification_status
    )
    VALUES (?, ?, 'Absent', 'Assigned', 'Required')
";

$insertAbsentStmt = mysqli_prepare($conn, $insertAbsentSql);

$shifts = [];

while ($row = mysqli_fetch_assoc($result)) {
    $assignmentId = (int) $row["assignment_id"];

    $shiftStart = new DateTime(
        $today . " " . $row["start_time"]
    );

    $prepDeadline = clone $shiftStart;
    $prepDeadline->modify(
        "-" . (int) $row["preparation_minutes"] . " minutes"
    );

    
    $row["prep_deadline"] = $prepDeadline->format("H:i");

    mysqli_stmt_bind_param(
        $attendanceStmt,
        "is",
        $assignmentId,
        $today
    );

    mysqli_stmt_execute($attendanceStmt);

    $attendanceResult = mysqli_stmt_get_result($attendanceStmt);
    $attendance = mysqli_fetch_assoc($attendanceResult);

    
    if (!$attendance && $now >= $prepDeadline) {
        mysqli_stmt_bind_param(
            $insertAbsentStmt,
            "is",
            $assignmentId,
            $today
        );

        mysqli_stmt_execute($insertAbsentStmt);

        $attendance = [
            "id" => mysqli_insert_id($conn),
            "status" => "Absent",
            "check_in" => null,
            "justification_status" => "Required",
            "replacement_status" => "Assigned",
            "replacement_employee_id" => null
        ];
    }

    $row["attendance_id"] = $attendance["id"] ?? null;
    $row["attendance_status"] = $attendance["status"] ?? "";
    $row["check_in_time"] = $attendance["check_in"] ?? null;
    $row["checked_in"] = !empty($attendance["check_in"]);
    $row["justification_status"] =
        $attendance["justification_status"] ?? "Not Required";
    $row["replacement_status"] =
        $attendance["replacement_status"] ?? "None";
    $row["replacement_employee_id"] =
        $attendance["replacement_employee_id"] ?? null;

    $shifts[] = $row;
}

echo json_encode($shifts);