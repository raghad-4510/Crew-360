<?php

header("Access-Control-Allow-Origin: http://localhost:8443");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}
session_start();

// Temporary for development
if (!isset($_SESSION['employee_id'])) {
    $_SESSION['employee_id'] = 2;
}


include '../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

$employeeId = $_SESSION['employee_id'];
$latitude = $data['latitude'];
$longitude = $data['longitude'];
$distance = $data['distance'];
$gpsAccuracy = $data['gps_accuracy'] ?? null;

$date = date("Y-m-d");
$time = date("Y-m-d H:i:s");

/*
|--------------------------------------------------------------------------
| Get Active Assignment
|--------------------------------------------------------------------------
*/

$assignmentQuery = mysqli_query($conn, "
SELECT id
FROM shift_assignments
WHERE employee_id = $employeeId
AND assignment_status = 'Active'
ORDER BY assignment_start ASC
LIMIT 1
");

if (!$assignmentQuery || mysqli_num_rows($assignmentQuery) == 0) {

    echo json_encode([
        "success" => false,
        "message" => "No active assignment found."
    ]);

    exit;
}

$assignment = mysqli_fetch_assoc($assignmentQuery);
$assignmentId = $assignment['id'];

/*
|--------------------------------------------------------------------------
| Already Checked In?
|--------------------------------------------------------------------------
*/

$check = mysqli_query($conn, "
SELECT id
FROM attendance
WHERE assignment_id = $assignmentId
AND attendance_date = '$date'
");

if (mysqli_num_rows($check) > 0) {

    echo json_encode([
        "success" => false,
        "message" => "You have already checked in today."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Save Attendance
|--------------------------------------------------------------------------
*/

$sql = "
INSERT INTO attendance
(
assignment_id,
attendance_date,
check_in,
latitude,
longitude,
distance,
gps_accuracy,
status
)
VALUES
(
$assignmentId,
'$date',
'$time',
$latitude,
$longitude,
$distance,
" . ($gpsAccuracy !== null ? $gpsAccuracy : "NULL") . ",
'Present'
)
";

if (mysqli_query($conn, $sql)) {

    /*
    |--------------------------------------------------------------------------
    | Complete Current Assignment
    |--------------------------------------------------------------------------
    */

    mysqli_query($conn, "
        UPDATE shift_assignments
        SET assignment_status = 'Completed'
        WHERE id = $assignmentId
    ");

    /*
    |--------------------------------------------------------------------------
    | Activate Next Assignment
    |--------------------------------------------------------------------------
    */

    mysqli_query($conn, "
        UPDATE shift_assignments
        SET assignment_status = 'Active'
        WHERE id = (

            SELECT id
            FROM (

                SELECT id
                FROM shift_assignments
                WHERE employee_id = $employeeId
                AND assignment_status = 'Pending'
                ORDER BY assignment_start ASC
                LIMIT 1

            ) AS next_assignment

        )
    ");

    /*
    |--------------------------------------------------------------------------
    | Award Attendance Commitment
    |--------------------------------------------------------------------------
    */

    $rewardQuery = mysqli_query($conn, "
        SELECT id, points
        FROM reward_types
        WHERE reward_name = 'Attendance commitment'
        AND status = 'Active'
        LIMIT 1
    ");

    if ($reward = mysqli_fetch_assoc($rewardQuery)) {

        $rewardTypeId = (int)$reward["id"];
        $points = (int)$reward["points"];

        
        mysqli_query($conn, "
            INSERT INTO reward_actions
            (
                employee_id,
                reward_type_id,
                points,
                description,
                created_at
            )
            VALUES
            (
                $employeeId,
                $rewardTypeId,
                $points,
                'Automatic reward for successful smart attendance check-in.',
                NOW()
            )
        ");

        
        mysqli_query($conn, "
            UPDATE employees
            SET reward_points = reward_points + $points
            WHERE id = $employeeId
        ");
    }

    echo json_encode([
        "success" => true,
        "message" => "✅ Check-in successful!"
    ]);

}
else {

    echo json_encode([
        "success" => false,
        "message" => mysqli_error($conn)
    ]);

}
