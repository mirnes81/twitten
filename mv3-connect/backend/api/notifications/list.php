<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

$user = require_user();

$stmt = db()->prepare(
    'SELECT * FROM notifications WHERE user_id = ? OR (user_id IS NULL AND role = ?) ORDER BY created_at DESC LIMIT 50'
);
$stmt->execute([$user['id'], $user['role']]);

$rows = array_map(fn($n) => [
    'id' => (int)$n['id'],
    'titre' => $n['titre'],
    'texte' => $n['texte'],
    'color' => $n['color'],
    'date' => $n['created_at'],
    'lu' => $n['read_at'] !== null,
], $stmt->fetchAll());

respond(['notifications' => $rows]);
