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
    $_SESSION['employee_id'] = 1;
}

$employeeId = $_SESSION['employee_id'];


$sql = "SELECT COALESCE(SUM(points),0) AS total_points
        FROM rewards
        WHERE employee_id = $employeeId";

$result = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($result);

$totalPoints = $row['total_points'];


if ($totalPoints >= 3000) {

    $level = "🥇 Gold";
    $nextLevel = 0;
    $progress = 100;

}
elseif ($totalPoints >= 2000) {

    $level = "🥈 Silver";
    $nextLevel = 3000 - $totalPoints;
    $progress = ($totalPoints / 3000) * 100;

}
else {

    $level = "🥉 Bronze";
    $nextLevel = 2000 - $totalPoints;
    $progress = ($totalPoints / 2000) * 100;

}

echo json_encode([
    "points"=>$totalPoints,
    "level"=>$level,
    "remaining"=>$nextLevel,
    "progress"=>round($progress)
]);