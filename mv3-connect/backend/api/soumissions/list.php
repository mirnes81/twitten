<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

$user = require_user();
$chantierId = (int)($_GET['chantier_id'] ?? 0);

if ($chantierId) {
    $stmt = db()->prepare('SELECT * FROM soumissions WHERE chantier_id = ? ORDER BY created_at DESC');
    $stmt->execute([$chantierId]);
} elseif ($user['role'] === 'pro') {
    $stmt = db()->prepare('SELECT * FROM soumissions WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$user['id']]);
} else {
    fail('chantier_id requis.');
}

respond(['soumissions' => array_map('format_soumission', $stmt->fetchAll())]);
