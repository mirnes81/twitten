<?php
/**
 * ÉTAPES :
 * 1. Renommez ce fichier (ou faites-en une copie) en "config.php" dans le même dossier "backend/".
 * 2. Remplissez les 4 valeurs db_* ci-dessous avec les identifiants MySQL donnés par Hoststar
 *    (panneau Hoststar → Bases de données → MySQL → votre base).
 * 3. Uploadez "config.php" (pas ce fichier) sur le serveur, dans le dossier backend/.
 * 4. Ne partagez ce fichier rempli avec personne et ne le committez jamais dans git
 *    (il est déjà exclu via .gitignore).
 */
return [
    // --- À REMPLIR : identifiants MySQL Hoststar ---
    'db_host' => 'localhost',       // souvent "localhost" chez Hoststar — vérifiez dans le panneau
    'db_name' => 'votre_base',      // ex. quelque chose comme "sql12345_mv3"
    'db_user' => 'votre_utilisateur',
    'db_pass' => 'votre_mot_de_passe',

    // --- Déjà correct pour la production, ne pas modifier sauf besoin particulier ---
    // Origine autorisée pour les requêtes CORS. Verrouillé sur le domaine du site
    // pour empêcher d'autres sites d'appeler votre API avec les identifiants d'un utilisateur connecté.
    'cors_origin' => 'https://connect.mv-3pro.ch',
    // Dossier public où sont servies les photos/PDF uploadés (chemin relatif à backend/).
    'uploads_url' => '/backend/uploads',
];
