<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);

$header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (preg_match('/Bearer\s+(.+)/i', $header, $m)) {
    $stmt = db()->prepare('DELETE FROM sessions WHERE token = ?');
    $stmt->execute([trim($m[1])]);
}

respond(['ok' => true]);
