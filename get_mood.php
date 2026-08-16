<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

session_start();

include "../config/database.php";

if (!isset($_SESSION["employee_id"])) {
    $_SESSION["employee_id"] = 2;
}

$employeeId = $_SESSION["employee_id"];
$today = date("Y-m-d");

$result = mysqli_query($conn,"
SELECT mood_score,mood_label,comment
FROM employee_moods
WHERE employee_id=$employeeId
AND mood_date='$today'
LIMIT 1
");

if(mysqli_num_rows($result)==0){

    echo json_encode([
        "submitted"=>false
    ]);

    exit;
}

$row=mysqli_fetch_assoc($result);

echo json_encode([
    "submitted"=>true,
    "score"=>$row["mood_score"],
    "label"=>$row["mood_label"],
    "comment"=>$row["comment"]
]);