<?php
declare(strict_types=1);
require __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);

$in = json_input();
$email = trim(strtolower($in['email'] ?? ''));
$password = $in['password'] ?? '';

$stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    fail('E-mail ou mot de passe incorrect.', 401);
}

$token = bin2hex(random_bytes(32));
$stmt = db()->prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))');
$stmt->execute([$token, $user['id']]);

respond(['token' => $token, 'user' => public_user($user)]);
