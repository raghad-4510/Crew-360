<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}



session_start();

include "../config/database.php";

// Temporary for development
if (!isset($_SESSION['employee_id'])) {
    $_SESSION['employee_id'] = 2;
}

$employeeId = $_SESSION['employee_id'];

$sql = "
SELECT
    a.id,
    a.attendance_date,
    a.check_in,
    a.check_out,
    a.status,
    a.replacement_status,
    a.justification_status,
    a.justification,

    s.station_name,

    j.reason,
a.justification

FROM attendance a

JOIN shift_assignments sa
    ON a.assignment_id = sa.id

JOIN stations s
    ON sa.station_id = s.id

LEFT JOIN attendance_justifications j
    ON j.attendance_id = a.id

WHERE sa.employee_id = $employeeId

ORDER BY
    a.attendance_date DESC,
    a.id DESC

";

$result = mysqli_query($conn, $sql);

if (!$result) {

    echo json_encode([
        "error" => mysqli_error($conn)
    ]);
    exit;

}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {

    $data[] = $row;

}

echo json_encode($data);