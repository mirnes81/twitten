<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

$user = require_user();

$sql = 'SELECT * FROM chantiers';
$params = [];

if ($user['role'] === 'promo') {
    $sql .= ' WHERE demandeur = ?';
    $params[] = $user['organisation'];
} elseif ($user['role'] === 'client') {
    $sql .= ' WHERE client_id = ?';
    $params[] = $user['id'];
} elseif ($user['role'] === 'pro' && ($_GET['scope'] ?? 'browse') === 'browse') {
    $sql .= " WHERE statut = 'Ouvert' AND (prive = 0 OR JSON_CONTAINS(invites, ?))";
    $params[] = (string)$user['id'];
}
// admin (et pro avec scope=all) : pas de filtre, tout est visible.

$sql .= ' ORDER BY created_at DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);

respond(['chantiers' => array_map('format_chantier', $stmt->fetchAll())]);
