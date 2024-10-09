<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$servername = "localhost";
$username = "root";  // Your MySQL username
$password = "password";  // Your MySQL password
$dbname = "pipper";  // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    error_log('Connection failed: ' . $conn->connect_error);
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Handle POST request to create a new Pip
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log('API hit: ' . json_encode($_POST)); // Log the incoming POST data

    $username = $_POST['username'] ?? '';
    $message = $_POST['message'] ?? '';

    if (empty($username) || empty($message)) {
        echo json_encode(['status' => 'error', 'message' => 'Username and message cannot be empty.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO pips (username, message) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $message);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        error_log('Query execution failed: ' . $stmt->error);
        echo json_encode(['status' => 'error', 'message' => 'Error creating Pip.']);
    }
    $stmt->close();
    exit;
}

// Handle GET request to fetch Pips
$result = $conn->query("SELECT id, username, message FROM pips ORDER BY created_at DESC");

$pips = [];
while ($row = $result->fetch_assoc()) {
    $pips[] = $row;
}

echo json_encode($pips);
$conn->close();
