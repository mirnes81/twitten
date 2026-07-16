<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
$user = require_user(['client']);
$in = json_input();

$suiviId = (int)($in['suiviId'] ?? 0);
if (!$suiviId) fail('suiviId manquant.');

$stmt = db()->prepare('SELECT * FROM suivis WHERE id = ?');
$stmt->execute([$suiviId]);
$suivi = $stmt->fetch();
if (!$suivi) fail('Suivi introuvable.', 404);

$chStmt = db()->prepare('SELECT client_id FROM chantiers WHERE id = ?');
$chStmt->execute([$suivi['chantier_id']]);
$clientId = $chStmt->fetchColumn();
if ((int)$clientId !== (int)$user['id']) fail('Accès refusé.', 403);

$fields = ['q', 'prix', 'delai', 'com', 'prop', 'sav'];
$vals = [];
foreach ($fields as $f) {
    $v = (int)($in[$f] ?? 0);
    if ($v < 1 || $v > 5) fail("Note invalide pour $f.");
    $vals[] = $v;
}

$stmt = db()->prepare(
    'INSERT INTO reviews (chantier_id, suivi_id, client_id, q, prix, delai, com, prop, sav, commentaire)
     VALUES (?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE q=VALUES(q), prix=VALUES(prix), delai=VALUES(delai), com=VALUES(com), prop=VALUES(prop), sav=VALUES(sav), commentaire=VALUES(commentaire)'
);
$stmt->execute([
    $suivi['chantier_id'], $suiviId, $user['id'],
    $vals[0], $vals[1], $vals[2], $vals[3], $vals[4], $vals[5],
    $in['commentaire'] ?? null,
]);

// met à jour la note moyenne de l'entreprise
$avgStmt = db()->prepare(
    'SELECT AVG((r.q + r.prix + r.delai + r.com + r.prop + r.sav) / 6) AS moy
     FROM reviews r JOIN suivis s ON s.id = r.suivi_id WHERE s.user_id = ?'
);
$avgStmt->execute([$suivi['user_id']]);
$moy = $avgStmt->fetchColumn();
if ($moy !== false && $moy !== null) {
    db()->prepare('UPDATE users SET note = ? WHERE id = ?')->execute([round((float)$moy, 1), $suivi['user_id']]);
}

respond(['ok' => true], 201);
