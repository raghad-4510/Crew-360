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

/*
|--------------------------------------------------------------------------
| Temporary Login 
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["employee_id"])) {
    $_SESSION["employee_id"] = 2;
}

$employeeId = $_SESSION["employee_id"];

/*
|--------------------------------------------------------------------------
| Get Employee Information
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
SELECT
    id,
    first_name,
    last_name,
    reward_points,
    HomeStation
FROM employees
WHERE id = ?
LIMIT 1
");

$stmt->bind_param("i", $employeeId);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Employee not found"
    ]);

    exit;
}

$employee = $result->fetch_assoc();

$currentPoints = (int)$employee["reward_points"];
$homeStation   = $employee["HomeStation"];

/*
|--------------------------------------------------------------------------
| Weekly Points
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
SELECT
    COALESCE(SUM(points),0) AS total
FROM reward_actions
WHERE employee_id = ?
AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
");

$stmt->bind_param("i", $employeeId);
$stmt->execute();

$weeklyResult = $stmt->get_result()->fetch_assoc();

$weekly = (int)$weeklyResult["total"];

/*
|--------------------------------------------------------------------------
| Monthly Points
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
SELECT
    COALESCE(SUM(points),0) AS total
FROM reward_actions
WHERE employee_id = ?
AND MONTH(created_at)=MONTH(CURDATE())
AND YEAR(created_at)=YEAR(CURDATE())
");

$stmt->bind_param("i", $employeeId);
$stmt->execute();

$monthlyResult = $stmt->get_result()->fetch_assoc();

$monthly = (int)$monthlyResult["total"];

/*
|--------------------------------------------------------------------------
| Station Rank
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
SELECT
    id,
    reward_points
FROM employees
WHERE HomeStation = ?
ORDER BY reward_points DESC, id ASC
");

$stmt->bind_param("s", $homeStation);

$stmt->execute();

$result = $stmt->get_result();

$currentRank = 0;
$previousPoints = null;
$position = 0;

while ($row = $result->fetch_assoc()) {

    $position++;

    if ($previousPoints === null || $row["reward_points"] != $previousPoints) {
        $currentRank = $position;
    }

    if ($row["id"] == $employeeId) {
        $rank = $currentRank;
        break;
    }

    $previousPoints = $row["reward_points"];
}

/*
|--------------------------------------------------------------------------
| Reward Levels
|--------------------------------------------------------------------------
*/

$levels = [

    [
        "name" => "Bronze",
        "min"  => 0,
        "max"  => 500
    ],

    [
        "name" => "Silver",
        "min"  => 500,
        "max"  => 1000
    ],

    [
        "name" => "Gold",
        "min"  => 1000,
        "max"  => 1500
    ],

    [
        "name" => "Platinum",
        "min"  => 1500,
        "max"  => PHP_INT_MAX
    ]

];

$currentLevel = $levels[0];

foreach ($levels as $level) {

    if (
        $currentPoints >= $level["min"] &&
        $currentPoints < $level["max"]
    ) {

        $currentLevel = $level;
        break;
    }
}

$progress = 100;
$pointsToNext = 0;
$nextLevel = null;

if ($currentLevel["max"] != PHP_INT_MAX) {

    $progress = round(
        (
            ($currentPoints - $currentLevel["min"])
            /
            ($currentLevel["max"] - $currentLevel["min"])
        ) * 100
    );

    $pointsToNext =
        $currentLevel["max"] - $currentPoints;

    foreach ($levels as $level) {

        if ($level["min"] == $currentLevel["max"]) {

            $nextLevel = $level["name"];
            break;
        }
    }
}
/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "employee" =>
        $employee["first_name"] . " " . $employee["last_name"],

    "current_points" => $currentPoints,

    "rank" => $rank,

    "level" => $currentLevel["name"],

    "level_min" => $currentLevel["min"],

    "level_max" => $currentLevel["max"],

    "progress" => $progress,

    "next_level" => $nextLevel,

    "points_to_next" => $pointsToNext,

    "earned_this_week" => $weekly,

    "earned_this_month" => $monthly

]);

$stmt->close();
$conn->close();