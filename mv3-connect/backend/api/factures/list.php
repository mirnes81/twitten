<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

$user = require_user();

if ($user['role'] === 'admin') {
    $stmt = db()->query('SELECT * FROM factures ORDER BY created_at DESC');
} elseif ($user['role'] === 'pro') {
    $stmt = db()->prepare('SELECT * FROM factures WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$user['id']]);
} else {
    fail('Accès refusé.', 403);
}

respond(['factures' => array_map('format_facture', $stmt->fetchAll())]);
