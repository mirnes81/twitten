<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);

$in = json_input();
$role = $in['role'] ?? '';
$email = trim(strtolower($in['email'] ?? ''));
$password = $in['password'] ?? '';
$nom = trim($in['nom'] ?? '');

if (!in_array($role, ['client', 'pro', 'promo', 'admin'], true)) fail('Rôle invalide.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('E-mail invalide.');
if (strlen($password) < 8) fail('Le mot de passe doit contenir au moins 8 caractères.');
if ($nom === '') fail('Le nom est requis.');

$stmt = db()->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) fail('Un compte existe déjà avec cet e-mail.', 409);

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = db()->prepare(
    'INSERT INTO users (role, email, password_hash, nom, entreprise, organisation, plan, telephone, npa_commune)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $role, $email, $hash, $nom,
    $role === 'pro' ? ($in['entreprise'] ?? $nom) : null,
    $role === 'promo' ? ($in['organisation'] ?? $nom) : null,
    $role === 'pro' ? 'Starter' : null,
    $in['telephone'] ?? null,
    $role === 'client' ? ($in['npaCommune'] ?? null) : null,
]);
$userId = (int)db()->lastInsertId();

$token = bin2hex(random_bytes(32));
$stmt = db()->prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))');
$stmt->execute([$token, $userId]);

$stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

respond(['token' => $token, 'user' => public_user($user)], 201);
