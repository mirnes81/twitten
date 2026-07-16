<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
$user = require_user(['pro']);
$in = json_input();

$chantierId = (int)($in['chantierId'] ?? 0);
$lignes = $in['lignes'] ?? [];
if (!$chantierId || !$lignes) fail('Données manquantes.');

$sousTotal = 0.0;
foreach ($lignes as $l) $sousTotal += (float)($l['q'] ?? 0) * (float)($l['pu'] ?? 0);
$total = round($sousTotal * 1.081, 2);

$chStmt = db()->prepare('SELECT * FROM chantiers WHERE id = ?');
$chStmt->execute([$chantierId]);
$ch = $chStmt->fetch();
if (!$ch) fail('Chantier introuvable.', 404);

db()->beginTransaction();
$stmt = db()->prepare(
    'INSERT INTO soumissions (chantier_id, user_id, entreprise, total, delai_debut, duree, garantie, remarques, statut)
     VALUES (?,?,?,?,?,?,?,?,"En attente")'
);
$stmt->execute([
    $chantierId, $user['id'], $user['entreprise'] ?? $user['nom'], $total,
    $in['delaiDebut'] ?? 'À convenir', $in['duree'] ?? '—', $in['garantie'] ?? '5 ans', $in['remarques'] ?? null,
]);
$soumissionId = (int)db()->lastInsertId();

$ordre = 0;
foreach ($lignes as $l) {
    $stmt2 = db()->prepare(
        'INSERT INTO soumission_lignes (soumission_id, code, description, unite, quantite, prix_unitaire, ordre)
         VALUES (?,?,?,?,?,?,?)'
    );
    $stmt2->execute([$soumissionId, $l['code'] ?? null, $l['d'] ?? '', $l['u'] ?? null, (float)($l['q'] ?? 0), (float)($l['pu'] ?? 0), $ordre++]);
}
db()->commit();

$totalFmt = number_format($total, 0, '.', "'");
notify(null, 'admin', 'Nouvelle soumission reçue', ($user['entreprise'] ?? $user['nom']) . " — {$ch['titre']} · {$totalFmt} CHF", '#DD2A17');
if ($ch['client_id']) {
    notify((int)$ch['client_id'], null, 'Nouvelle offre reçue', ($user['entreprise'] ?? $user['nom']) . " a soumis une offre — {$totalFmt} CHF", '#DD2A17');
}

$stmt = db()->prepare('SELECT * FROM soumissions WHERE id = ?');
$stmt->execute([$soumissionId]);
respond(['soumission' => format_soumission($stmt->fetch())], 201);
