<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $config['cors_origin']);
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        global $config;
        $dsn = "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void {
    respond(['error' => $message], $status);
}

/** Retourne l'utilisateur authentifié (via header Authorization: Bearer <token>) ou null. */
function current_user(): ?array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/i', $header, $m)) return null;
    $token = trim($m[1]);
    if ($token === '') return null;

    $stmt = db()->prepare(
        'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    return $user ?: null;
}

/** Exige un utilisateur connecté, avec un rôle parmi $roles si fourni. Termine la requête sinon. */
function require_user(array $roles = []): array {
    $user = current_user();
    if (!$user) fail('Non authentifié.', 401);
    if ($roles && !in_array($user['role'], $roles, true)) fail('Accès refusé pour ce rôle.', 403);
    return $user;
}

function public_user(array $u): array {
    return [
        'id' => (int)$u['id'],
        'role' => $u['role'],
        'email' => $u['email'],
        'nom' => $u['nom'],
        'entreprise' => $u['entreprise'],
        'organisation' => $u['organisation'],
        'note' => $u['note'] !== null ? (float)$u['note'] : null,
        'plan' => $u['plan'],
        'telephone' => $u['telephone'],
        'npaCommune' => $u['npa_commune'],
    ];
}

function format_chantier(array $c): array {
    $photos = db()->prepare('SELECT id, url, nom FROM chantier_photos WHERE chantier_id = ? ORDER BY id');
    $photos->execute([$c['id']]);
    return [
        'id' => (int)$c['id'],
        'titre' => $c['titre'],
        'categorie' => $c['categorie'],
        'ville' => $c['ville'],
        'adresse' => $c['adresse'],
        'typeBien' => $c['type_bien'],
        'etage' => $c['etage'],
        'numAppart' => $c['num_appart'],
        'desc' => $c['description'],
        'metres' => $c['metres'] ? json_decode($c['metres'], true) : new stdClass(),
        'budget' => $c['budget'],
        'delai' => $c['delai'],
        'limite' => $c['limite'],
        'statut' => $c['statut'],
        'prive' => (bool)$c['prive'],
        'invites' => $c['invites'] ? json_decode($c['invites'], true) : [],
        'demandeur' => $c['demandeur'],
        'clientId' => $c['client_id'] !== null ? (int)$c['client_id'] : null,
        'match' => $c['match_score'] !== null ? (int)$c['match_score'] : null,
        'tags' => $c['tags'] ? json_decode($c['tags'], true) : [],
        'photos' => array_map(fn($p) => ['url' => $p['url'], 'name' => $p['nom']], $photos->fetchAll()),
        'createdAt' => $c['created_at'],
    ];
}

function format_soumission(array $s, bool $withLignes = true): array {
    $noteStmt = db()->prepare('SELECT note FROM users WHERE id = ?');
    $noteStmt->execute([$s['user_id']]);
    $note = $noteStmt->fetchColumn();

    $out = [
        'id' => (int)$s['id'],
        'chantierId' => (int)$s['chantier_id'],
        'entreprise' => $s['entreprise'],
        'note' => $note !== false && $note !== null ? (float)$note : null,
        'total' => (float)$s['total'],
        'delaiDebut' => $s['delai_debut'],
        'duree' => $s['duree'],
        'garantie' => $s['garantie'],
        'remarques' => $s['remarques'],
        'statut' => $s['statut'],
        'date' => $s['created_at'],
    ];
    if ($withLignes) {
        $stmt = db()->prepare('SELECT code, description, unite, quantite, prix_unitaire FROM soumission_lignes WHERE soumission_id = ? ORDER BY ordre');
        $stmt->execute([$s['id']]);
        $out['lignes'] = array_map(fn($l) => [
            'code' => $l['code'], 'd' => $l['description'], 'u' => $l['unite'],
            'q' => (float)$l['quantite'], 'pu' => (float)$l['prix_unitaire'],
        ], $stmt->fetchAll());
    }
    return $out;
}

function format_suivi(array $s): array {
    $jalons = db()->prepare('SELECT jalon_key, label, done FROM suivi_jalons WHERE suivi_id = ? ORDER BY ordre');
    $jalons->execute([$s['id']]);
    $photos = db()->prepare('SELECT categorie, url, nom FROM suivi_photos WHERE suivi_id = ? ORDER BY id');
    $photos->execute([$s['id']]);
    $docs = db()->prepare('SELECT id, jalon_key, url, nom, created_at FROM suivi_documents WHERE suivi_id = ? ORDER BY id');
    $docs->execute([$s['id']]);

    $photosByCat = ['avant' => [], 'pendant' => [], 'apres' => []];
    foreach ($photos->fetchAll() as $p) {
        $photosByCat[$p['categorie']][] = ['url' => $p['url'], 'name' => $p['nom']];
    }

    return [
        'id' => (int)$s['id'],
        'chantierId' => (int)$s['chantier_id'],
        'soumissionId' => (int)$s['soumission_id'],
        'entreprise' => $s['entreprise'],
        'statut' => $s['statut'],
        'jalons' => array_map(fn($j) => ['id' => $j['jalon_key'], 'label' => $j['label'], 'done' => (bool)$j['done']], $jalons->fetchAll()),
        'photos' => $photosByCat,
        'documents' => array_map(fn($d) => ['id' => (int)$d['id'], 'jalonId' => $d['jalon_key'], 'url' => $d['url'], 'name' => $d['nom'], 'date' => $d['created_at']], $docs->fetchAll()),
    ];
}

function format_facture(array $f): array {
    return [
        'id' => (int)$f['id'],
        'soumissionId' => (int)$f['soumission_id'],
        'chantierId' => (int)$f['chantier_id'],
        'entreprise' => $f['entreprise'],
        'montant' => (float)$f['montant'],
        'taux' => (float)$f['taux'],
        'commission' => (float)$f['commission'],
        'statut' => $f['statut'],
        'date' => $f['created_at'],
    ];
}

function notify(?int $userId, ?string $role, string $titre, string $texte, string $color): void {
    $stmt = db()->prepare('INSERT INTO notifications (user_id, role, titre, texte, color) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$userId, $role, $titre, $texte, $color]);
}

const COMMISSION_RATES = ['Starter' => 0.10, 'Pro' => 0.07, 'Premium' => 0.04];
