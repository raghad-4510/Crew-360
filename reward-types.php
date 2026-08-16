<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

include "../config/database.php";

$sql = "
SELECT
    id,
    reward_name,
    points
FROM reward_types
WHERE status = 'Active'
ORDER BY points DESC, reward_name ASC
";

$result = mysqli_query($conn, $sql);

$rewardTypes = [];

while ($row = mysqli_fetch_assoc($result)) {

    $rewardTypes[] = [
        "id" => (int)$row["id"],
        "name" => $row["reward_name"],
        "points" => (int)$row["points"]
    ];
}

echo json_encode([
    "success" => true,
    "rewardTypes" => $rewardTypes
]);

mysqli_close($conn);