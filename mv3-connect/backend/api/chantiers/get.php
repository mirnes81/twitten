<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

require_user();
$id = (int)($_GET['id'] ?? 0);
if (!$id) fail('id manquant.');

$stmt = db()->prepare('SELECT * FROM chantiers WHERE id = ?');
$stmt->execute([$id]);
$c = $stmt->fetch();
if (!$c) fail('Chantier introuvable.', 404);

respond(['chantier' => format_chantier($c)]);
