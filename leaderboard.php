<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();

include "../config/database.php";

// Temporary for development
if (!isset($_SESSION["employee_id"])) {
    $_SESSION["employee_id"] = 2;
}

$employeeId = $_SESSION["employee_id"];

/*
|--------------------------------------------------------------------------
| Get employee Home Station
|--------------------------------------------------------------------------
*/

$sql = "
SELECT HomeStation
FROM employees
WHERE id = $employeeId
LIMIT 1
";

$result = mysqli_query($conn, $sql);

if (!$result || mysqli_num_rows($result) == 0) {

    echo json_encode([
        "success" => false,
        "message" => "Employee not found"
    ]);

    exit;
}

$employee = mysqli_fetch_assoc($result);

$homeStation = $employee["HomeStation"];

/*
|--------------------------------------------------------------------------
| Leaderboard
|--------------------------------------------------------------------------
*/

$sql = "
SELECT
    id,
    first_name,
    last_name,
    reward_points,
    HomeStation

FROM employees

WHERE HomeStation = '$homeStation'

ORDER BY reward_points DESC
";

$result = mysqli_query($conn, $sql);

$leaderboard = [];

$currentRank = 0;
$previousPoints = null;
$position = 0;

$currentEmployee = null;

while ($row = mysqli_fetch_assoc($result)) {

    $position++;

    if (
        $previousPoints === null ||
        $row["reward_points"] != $previousPoints
    ) {
        $currentRank = $position;
    }

    $entry = [
        "rank" => $currentRank,
        "id" => (int)$row["id"],
        "name" => $row["first_name"] . " " . $row["last_name"],
        "points" => (int)$row["reward_points"],
        "current" => ($row["id"] == $employeeId)
    ];

    if ($position <= 5) {
        $leaderboard[] = $entry;
    }

    if ($row["id"] == $employeeId) {
        $currentEmployee = $entry;
    }

    $previousPoints = $row["reward_points"];
}

$totalEmployees = $position;
echo json_encode([
    "success" => true,
    "station" => $homeStation,
    "employeeCount" => $totalEmployees,
    "leaderboard" => $leaderboard,
    "currentEmployee" => $currentEmployee
]);