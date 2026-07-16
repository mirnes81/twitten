<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
$user = require_user(['admin', 'promo', 'client']);
$in = json_input();
$soumissionId = (int)($in['soumissionId'] ?? 0);
if (!$soumissionId) fail('soumissionId manquant.');

$stmt = db()->prepare(
    'SELECT s.*, c.demandeur, c.client_id, c.titre AS chantier_titre
     FROM soumissions s JOIN chantiers c ON c.id = s.chantier_id WHERE s.id = ?'
);
$stmt->execute([$soumissionId]);
$s = $stmt->fetch();
if (!$s) fail('Soumission introuvable.', 404);

if ($user['role'] === 'promo' && $s['demandeur'] !== $user['organisation']) fail('Accès refusé.', 403);
if ($user['role'] === 'client' && (int)$s['client_id'] !== (int)$user['id']) fail('Accès refusé.', 403);

$chantierId = (int)$s['chantier_id'];

db()->beginTransaction();
db()->prepare("UPDATE soumissions SET statut = 'Gagnée' WHERE id = ?")->execute([$soumissionId]);
db()->prepare("UPDATE soumissions SET statut = 'Perdue' WHERE chantier_id = ? AND id != ?")->execute([$chantierId, $soumissionId]);
db()->prepare("UPDATE chantiers SET statut = 'Attribué' WHERE id = ?")->execute([$chantierId]);

$existing = db()->prepare('SELECT id FROM suivis WHERE soumission_id = ?');
$existing->execute([$soumissionId]);
if (!$existing->fetch()) {
    $stmt2 = db()->prepare(
        'INSERT INTO suivis (chantier_id, soumission_id, user_id, entreprise, statut) VALUES (?,?,?,?,"En cours")'
    );
    $stmt2->execute([$chantierId, $soumissionId, $s['user_id'], $s['entreprise']]);
    $suiviId = (int)db()->lastInsertId();

    $jalons = [
        ['acompte', 'Acompte 30 % reçu'],
        ['debut', 'Début des travaux'],
        ['cours', 'Travaux en cours 30 %'],
        ['reception', 'Réception et solde 10 %'],
    ];
    $ordre = 0;
    foreach ($jalons as [$key, $label]) {
        db()->prepare('INSERT INTO suivi_jalons (suivi_id, jalon_key, label, ordre) VALUES (?,?,?,?)')
            ->execute([$suiviId, $key, $label, $ordre++]);
    }

    $proStmt = db()->prepare('SELECT plan FROM users WHERE id = ?');
    $proStmt->execute([$s['user_id']]);
    $plan = $proStmt->fetchColumn() ?: 'Pro';
    $taux = COMMISSION_RATES[$plan] ?? COMMISSION_RATES['Pro'];
    $commission = round((float)$s['total'] * $taux, 2);

    db()->prepare(
        'INSERT INTO factures (soumission_id, chantier_id, user_id, entreprise, montant, taux, commission, statut)
         VALUES (?,?,?,?,?,?,?,"Due")'
    )->execute([$soumissionId, $chantierId, $s['user_id'], $s['entreprise'], $s['total'], $taux, $commission]);

    notify((int)$s['user_id'], null, 'Chantier gagné 🎉', "{$s['chantier_titre']} — contrat attribué", '#1E8A4E');
    notify(
        (int)$s['user_id'], null, 'Facture de commission émise',
        round($taux * 100) . '% sur ' . number_format((float)$s['total'], 0, '.', "'") . ' CHF — '
            . number_format($commission, 0, '.', "'") . ' CHF dus à MV3 Connect',
        '#B97709'
    );
}

$losers = db()->prepare('SELECT DISTINCT user_id FROM soumissions WHERE chantier_id = ? AND id != ?');
$losers->execute([$chantierId, $soumissionId]);
foreach ($losers->fetchAll() as $l) {
    notify((int)$l['user_id'], null, 'Soumission non retenue', "{$s['chantier_titre']} — une autre entreprise a été choisie", '#6B6F76');
}

db()->commit();
respond(['ok' => true]);
