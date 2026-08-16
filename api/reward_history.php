<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}
header("Content-Type: application/json");
require_once "db.php";


$employeeId = isset($_GET["employee_id"])
    ? intval($_GET["employee_id"])
    : 2;

$stmt = $conn->prepare("
SELECT
    ra.id,
    rt.reward_name,
    ra.points,
    ra.description,
    ra.created_at
FROM reward_actions ra

JOIN reward_types rt
ON rt.id = ra.reward_type_id

WHERE ra.employee_id = ?

ORDER BY ra.created_at DESC

LIMIT 20
");

$stmt->bind_param("i", $employeeId);
$stmt->execute();

$result = $stmt->get_result();

$history = [];

while ($row = $result->fetch_assoc()) {

   $history[] = [

    "id" => $row["id"],

    "label" => $row["reward_name"],

    "points" => (int)$row["points"],

    "description" => $row["description"],

    "date" => date(
        "d M Y",
        strtotime($row["created_at"])
    )

];

}

echo json_encode($history);