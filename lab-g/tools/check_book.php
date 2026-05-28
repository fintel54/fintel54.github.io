<?php
try {
    $pdo = new PDO('sqlite:C:\\ptw\\lab-g\\data.db');
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='book'");
    $res = $stmt ? $stmt->fetch() : null;
    var_dump($res);
} catch (Throwable $e) {
    echo 'ERROR: ' . $e->getMessage();
}

