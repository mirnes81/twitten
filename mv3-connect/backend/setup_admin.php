<?php
declare(strict_types=1);

/**
 * Outil à usage unique pour créer le premier compte administrateur, sans
 * avoir besoin d'écrire du SQL ni de communiquer votre mot de passe à qui
 * que ce soit.
 *
 * UTILISATION :
 * 1. Ouvrez ce fichier et changez SETUP_KEY ci-dessous pour une valeur secrète
 *    de votre choix (n'importe quelle chaîne, gardez-la pour vous).
 * 2. Uploadez ce fichier dans le dossier backend/ sur le serveur, à côté de
 *    config.php (qui doit déjà être rempli et en place).
 * 3. Ouvrez https://connect.mv-3pro.ch/backend/setup_admin.php dans votre
 *    navigateur, remplissez le formulaire.
 * 4. SUPPRIMEZ ce fichier du serveur juste après (FTP/SFTP) — c'est une porte
 *    de création de compte admin, elle ne doit pas rester accessible.
 */
const SETUP_KEY = 'CHANGEZ-MOI-avant-upload';

require __DIR__ . '/bootstrap.php';
header('Content-Type: text/html; charset=utf-8');

$error = null;
$success = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $key = $_POST['key'] ?? '';
    $email = trim($_POST['email'] ?? '');
    $nom = trim($_POST['nom'] ?? '');
    $password = $_POST['password'] ?? '';
    $password2 = $_POST['password2'] ?? '';

    if (SETUP_KEY === 'CHANGEZ-MOI-avant-upload') {
        $error = "Vous devez d'abord modifier SETUP_KEY dans setup_admin.php avant de l'utiliser.";
    } elseif (!hash_equals(SETUP_KEY, $key)) {
        $error = "Clé d'installation incorrecte.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "E-mail invalide.";
    } elseif ($nom === '') {
        $error = "Le nom est requis.";
    } elseif (strlen($password) < 8) {
        $error = "Le mot de passe doit faire au moins 8 caractères.";
    } elseif ($password !== $password2) {
        $error = "Les deux mots de passe ne correspondent pas.";
    } else {
        $stmt = db()->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = "Un compte existe déjà avec cet e-mail.";
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = db()->prepare('INSERT INTO users (role, email, password_hash, nom) VALUES (?, ?, ?, ?)');
            $stmt->execute(['admin', $email, $hash, $nom]);
            $success = "Compte administrateur créé pour $email. Vous pouvez maintenant vous connecter sur le site. Supprimez ce fichier (setup_admin.php) du serveur maintenant.";
        }
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>MV3 Connect — Créer le compte admin</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #F4F3EE; color: #16181C; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: #fff; border: 1px solid #E4E2D9; border-radius: 12px; padding: 28px; width: 100%; max-width: 380px; }
  h1 { font-size: 18px; margin: 0 0 6px; }
  p.hint { color: #6B6F76; font-size: 13px; margin: 0 0 18px; }
  label { display: block; font-size: 12px; font-weight: 700; margin: 12px 0 4px; }
  input { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; border: 1px solid #E4E2D9; font-size: 14px; }
  button { margin-top: 18px; width: 100%; padding: 12px; border-radius: 8px; border: none; background: #DD2A17; color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; }
  .error { background: #FDEEEC; color: #DD2A17; padding: 10px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 6px; }
  .success { background: #E8F4EC; color: #1E8A4E; padding: 10px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 6px; }
</style>
</head>
<body>
  <div class="card">
    <h1>Créer le compte administrateur</h1>
    <p class="hint">Usage unique — supprimez ce fichier du serveur juste après.</p>
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <?php if ($success): ?><div class="success"><?= htmlspecialchars($success) ?></div><?php else: ?>
    <form method="post">
      <label>Clé d'installation (SETUP_KEY)</label>
      <input type="password" name="key" required>
      <label>Nom complet</label>
      <input type="text" name="nom" required>
      <label>E-mail</label>
      <input type="email" name="email" required>
      <label>Mot de passe (8 caractères min.)</label>
      <input type="password" name="password" required minlength="8">
      <label>Confirmer le mot de passe</label>
      <input type="password" name="password2" required minlength="8">
      <button type="submit">Créer le compte admin</button>
    </form>
    <?php endif; ?>
  </div>
</body>
</html>
