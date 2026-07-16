<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
$user = require_user(['admin', 'pro', 'promo']);
$in = json_input();
$suiviId = (int)($in['suiviId'] ?? 0);
$jalonKey = $in['jalonKey'] ?? '';
if (!$suiviId || !$jalonKey) fail('Données manquantes.');

if ($user['role'] === 'pro') {
    $check = db()->prepare('SELECT user_id FROM suivis WHERE id = ?');
    $check->execute([$suiviId]);
    if ((int)$check->fetchColumn() !== (int)$user['id']) fail('Accès refusé.', 403);
}

db()->prepare('UPDATE suivi_jalons SET done = NOT done WHERE suivi_id = ? AND jalon_key = ?')->execute([$suiviId, $jalonKey]);

$stmt = db()->prepare('SELECT * FROM suivis WHERE id = ?');
$stmt->execute([$suiviId]);
respond(['suivi' => format_suivi($stmt->fetch())]);
