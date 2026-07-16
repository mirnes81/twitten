<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
$user = require_user(['admin', 'pro']);
$in = json_input();
$id = (int)($in['id'] ?? 0);
if (!$id) fail('id manquant.');

$stmt = db()->prepare('SELECT * FROM factures WHERE id = ?');
$stmt->execute([$id]);
$f = $stmt->fetch();
if (!$f) fail('Facture introuvable.', 404);
if ($user['role'] === 'pro' && (int)$f['user_id'] !== (int)$user['id']) fail('Accès refusé.', 403);

db()->prepare("UPDATE factures SET statut = 'Payée' WHERE id = ?")->execute([$id]);

$stmt = db()->prepare('SELECT * FROM factures WHERE id = ?');
$stmt->execute([$id]);
respond(['facture' => format_facture($stmt->fetch())]);
