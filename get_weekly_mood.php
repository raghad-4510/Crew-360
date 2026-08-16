<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Content-Type: application/json");

session_start();

include "../config/database.php";

// Temporary until login is implemented
if (!isset($_SESSION["employee_id"])) {
    $_SESSION["employee_id"] = 2;
}

$employeeId = $_SESSION["employee_id"];

$sql = "
SELECT
    mood_score,
    DATE(created_at) AS mood_date
FROM employee_moods
WHERE employee_id = $employeeId
ORDER BY created_at DESC
LIMIT 7
";

$result = mysqli_query($conn, $sql);

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode(array_reverse($data));