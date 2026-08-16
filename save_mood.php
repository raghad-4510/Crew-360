<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$employeeId = $_SESSION["employee_id"];

$data = json_decode(file_get_contents("php://input"), true);

$moodScore = intval($data["score"]);
$moodLabel = mysqli_real_escape_string($conn, $data["label"]);
$comment = mysqli_real_escape_string($conn, $data["comment"] ?? "");

$today = date("Y-m-d");


$check = mysqli_query(
    $conn,
    "SELECT id FROM employee_moods
     WHERE employee_id = $employeeId
     AND mood_date = '$today'"
);

if (mysqli_num_rows($check) > 0) {

    echo json_encode([
        "success" => false,
        "message" => "You have already submitted today's mood."
    ]);

    exit;
}

$stmt = $conn->prepare("
INSERT INTO employee_moods
(
employee_id,
mood_score,
mood_label,
comment,
mood_date
)
VALUES
(
?,?,?,?,?
)
");

$stmt->bind_param(
    "iisss",
    $employeeId,
    $moodScore,
    $moodLabel,
    $comment,
    $today
);

$stmt->execute();

echo json_encode([
    "success" => true,
    "message" => "Mood saved successfully."
]);