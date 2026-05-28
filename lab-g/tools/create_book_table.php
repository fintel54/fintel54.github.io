<?php
try {
    $pdo = new PDO('sqlite:C:\\ptw\\lab-g\\data.db');
    $sql = 'CREATE TABLE IF NOT EXISTS book (
        id integer not null primary key autoincrement,
        title text not null,
        author text not null,
        description text not null
    )';
    $pdo->exec($sql);
    echo "OK\n";
} catch (Throwable $e) {
    echo 'ERROR: ' . $e->getMessage() . "\n";
}

