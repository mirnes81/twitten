<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

require_user();

$stmt = db()->query("SELECT id, nom, entreprise, note FROM users WHERE role = 'pro' ORDER BY entreprise, nom");
$rows = array_map(fn($u) => [
    'id' => (int)$u['id'],
    'nom' => $u['entreprise'] ?: $u['nom'],
    'note' => $u['note'] !== null ? (float)$u['note'] : null,
], $stmt->fetchAll());

respond(['pros' => $rows]);
