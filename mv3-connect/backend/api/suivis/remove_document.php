<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
require_user(['admin', 'pro', 'promo', 'client']);
$in = json_input();
$docId = (int)($in['docId'] ?? 0);
if (!$docId) fail('docId manquant.');

$stmt = db()->prepare('SELECT suivi_id FROM suivi_documents WHERE id = ?');
$stmt->execute([$docId]);
$suiviId = $stmt->fetchColumn();
if (!$suiviId) fail('Document introuvable.', 404);

db()->prepare('DELETE FROM suivi_documents WHERE id = ?')->execute([$docId]);

$stmt = db()->prepare('SELECT * FROM suivis WHERE id = ?');
$stmt->execute([$suiviId]);
respond(['suivi' => format_suivi($stmt->fetch())]);
