<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée.', 405);
require_user();

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    fail('Fichier manquant ou invalide.');
}

$file = $_FILES['file'];
$maxSize = 10 * 1024 * 1024; // 10 Mo
if ($file['size'] > $maxSize) fail('Fichier trop volumineux (10 Mo max).');

$allowed = [
    'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif',
    'application/pdf' => 'pdf',
];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);
if (!isset($allowed[$mime])) fail('Type de fichier non autorisé (images ou PDF uniquement).');

$ext = $allowed[$mime];
$subdir = date('Y/m');
$dir = __DIR__ . '/../uploads/' . $subdir;
if (!is_dir($dir)) mkdir($dir, 0755, true);

$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$dest = $dir . '/' . $filename;
if (!move_uploaded_file($file['tmp_name'], $dest)) fail('Échec de l\'enregistrement du fichier.', 500);

global $config;
$url = rtrim($config['uploads_url'], '/') . '/' . $subdir . '/' . $filename;

respond(['url' => $url, 'name' => $file['name']], 201);
