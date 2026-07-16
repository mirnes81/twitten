<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
$user = require_user(['admin', 'promo', 'client']);
$in = json_input();

$titre = trim($in['titre'] ?? '');
if ($titre === '') fail('Titre requis.');
$categorie = $in['categorie'] ?? 'Carrelage';

$demandeur = null;
$clientId = null;
if ($user['role'] === 'promo') {
    $demandeur = $user['organisation'];
} elseif ($user['role'] === 'client') {
    $clientId = $user['id'];
} elseif ($user['role'] === 'admin') {
    $demandeur = trim($in['demandeur'] ?? '') ?: null;
}

$stmt = db()->prepare(
    'INSERT INTO chantiers
     (titre, categorie, ville, adresse, type_bien, etage, num_appart, description, metres, budget, delai, limite,
      statut, prive, invites, demandeur, client_id, created_by, match_score, tags)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?, "Ouvert", ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $titre, $categorie, $in['ville'] ?? null, $in['adresse'] ?? null, $in['typeBien'] ?? null,
    $in['etage'] ?? null, $in['numAppart'] ?? null, $in['desc'] ?? null,
    json_encode($in['metres'] ?? new stdClass()), $in['budget'] ?? null, $in['delai'] ?? null, $in['limite'] ?? null,
    !empty($in['prive']) ? 1 : 0, json_encode($in['invites'] ?? []), $demandeur, $clientId, $user['id'],
    90, json_encode($in['tags'] ?? [$categorie]),
]);
$id = (int)db()->lastInsertId();

foreach ($in['photos'] ?? [] as $p) {
    if (!empty($p['url'])) {
        $stmt2 = db()->prepare('INSERT INTO chantier_photos (chantier_id, url, nom) VALUES (?, ?, ?)');
        $stmt2->execute([$id, $p['url'], $p['name'] ?? null]);
    }
}

$titreNotif = $user['role'] === 'client' ? 'Nouvelle demande particulier' : 'Nouveau chantier publié';
notify(null, 'pro', $titreNotif, "$titre — " . ($in['ville'] ?? 'lieu à confirmer'), '#DD2A17');

$stmt = db()->prepare('SELECT * FROM chantiers WHERE id = ?');
$stmt->execute([$id]);
respond(['chantier' => format_chantier($stmt->fetch())], 201);
