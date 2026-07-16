<?php
/**
 * Copiez ce fichier en config.php et renseignez vos identifiants Hoststar.
 * config.php ne doit JAMAIS être commité dans git (voir .gitignore).
 */
return [
    'db_host' => 'localhost',
    'db_name' => 'votre_base',
    'db_user' => 'votre_utilisateur',
    'db_pass' => 'votre_mot_de_passe',
    // Origine autorisée pour les requêtes CORS (laissez '*' seulement en dev).
    // En production : 'https://connect.mv-3pro.ch'
    'cors_origin' => '*',
    // Dossier public où sont servies les photos/PDF uploadés.
    'uploads_url' => '/uploads',
];
