<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
require_user(['admin', 'pro', 'promo']);
$in = json_input();
$suiviId = (int)($in['suiviId'] ?? 0);
$url = $in['url'] ?? '';
if (!$suiviId || !$url) fail('Données manquantes.');

db()->prepare('DELETE FROM suivi_photos WHERE suivi_id = ? AND url = ? LIMIT 1')->execute([$suiviId, $url]);

$stmt = db()->prepare('SELECT * FROM suivis WHERE id = ?');
$stmt->execute([$suiviId]);
respond(['suivi' => format_suivi($stmt->fetch())]);
