<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

require_user();
$id = (int)($_GET['id'] ?? 0);
$chantierId = (int)($_GET['chantier_id'] ?? 0);
$soumissionId = (int)($_GET['soumission_id'] ?? 0);

if ($id) {
    $stmt = db()->prepare('SELECT * FROM suivis WHERE id = ?');
    $stmt->execute([$id]);
} elseif ($chantierId) {
    $stmt = db()->prepare('SELECT * FROM suivis WHERE chantier_id = ? ORDER BY id DESC LIMIT 1');
    $stmt->execute([$chantierId]);
} elseif ($soumissionId) {
    $stmt = db()->prepare('SELECT * FROM suivis WHERE soumission_id = ?');
    $stmt->execute([$soumissionId]);
} else {
    fail('id, chantier_id ou soumission_id requis.');
}

$s = $stmt->fetch();
respond(['suivi' => $s ? format_suivi($s) : null]);
