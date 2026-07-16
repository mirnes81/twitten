<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
require_user(['admin', 'pro', 'promo']);
$in = json_input();
$suiviId = (int)($in['suiviId'] ?? 0);
$categorie = $in['categorie'] ?? '';
$url = $in['url'] ?? '';
if (!$suiviId || !in_array($categorie, ['avant', 'pendant', 'apres'], true) || !$url) fail('Données manquantes.');

$stmt = db()->prepare('INSERT INTO suivi_photos (suivi_id, categorie, url, nom) VALUES (?,?,?,?)');
$stmt->execute([$suiviId, $categorie, $url, $in['name'] ?? null]);

$stmt = db()->prepare('SELECT * FROM suivis WHERE id = ?');
$stmt->execute([$suiviId]);
respond(['suivi' => format_suivi($stmt->fetch())], 201);
