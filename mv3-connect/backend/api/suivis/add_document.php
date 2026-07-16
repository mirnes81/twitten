<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
require_user(['admin', 'pro', 'promo', 'client']);
$in = json_input();
$suiviId = (int)($in['suiviId'] ?? 0);
$jalonKey = $in['jalonKey'] ?? '';
$url = $in['url'] ?? '';
if (!$suiviId || !$jalonKey || !$url) fail('Données manquantes.');

$stmt = db()->prepare('INSERT INTO suivi_documents (suivi_id, jalon_key, url, nom) VALUES (?,?,?,?)');
$stmt->execute([$suiviId, $jalonKey, $url, $in['name'] ?? null]);

$stmt = db()->prepare('SELECT * FROM suivis WHERE id = ?');
$stmt->execute([$suiviId]);
respond(['suivi' => format_suivi($stmt->fetch())], 201);
