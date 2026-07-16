# Déploiement de MV3 Connect sur Hoststar (connect.mv-3pro.ch)

## 1. Créer le sous-domaine

1. Connectez-vous au panneau d'administration Hoststar.
2. Allez dans **Domaines** → **Sous-domaines** (ou équivalent selon la version du panneau).
3. Créez `connect` sur `mv-3pro.ch`, avec pour dossier racine quelque chose comme
   `/connect.mv-3pro.ch/` (Hoststar propose généralement un dossier dédié automatiquement).
4. Attendez la propagation DNS (généralement immédiate en interne chez Hoststar, jusqu'à
   quelques heures en externe).

## 2. Créer la base de données MySQL

1. Dans le panneau Hoststar : **Bases de données** → **MySQL** → **Créer une base**.
2. Notez le nom de la base, l'utilisateur et le mot de passe générés (ou choisis).
3. Ouvrez **phpMyAdmin** depuis le panneau, sélectionnez la nouvelle base, onglet **Importer**,
   et importez le fichier `backend/schema.sql` de ce dépôt. Ça crée toutes les tables.

## 3. Préparer les fichiers

Sur votre machine (ou directement ici) :

```
mv3-connect/
  backend/        → à uploader tel quel dans un dossier NON accessible publiquement si possible,
                    ou dans un sous-dossier /backend du site (voir note sécurité plus bas)
  dist/           → générer avec `npm run build`, uploader le contenu à la racine du sous-domaine
```

1. `cd mv3-connect && npm install && npm run build` — génère `dist/index.html` et `dist/assets/`.
2. Copiez `backend/config.example.php` vers `backend/config.php` et renseignez les identifiants
   MySQL obtenus à l'étape 2, ainsi que `cors_origin` (mettre `https://connect.mv-3pro.ch`).

## 4. Upload FTP/SFTP

Arborescence cible sur le serveur (racine du sous-domaine) :

```
/connect.mv-3pro.ch/
  index.html            ← contenu de dist/
  assets/                ← contenu de dist/assets/
  backend/                ← tout le dossier backend/ (avec config.php, PAS config.example.php)
    uploads/              ← doit être accessible en écriture par PHP (chmod 755 ou 775)
```

Le frontend appelle l'API via le chemin relatif `/backend/api/...` par défaut — si vous préférez
un autre chemin, définissez `VITE_API_BASE` avant de builder (`VITE_API_BASE=/api npm run build`)
et adaptez l'emplacement du dossier `backend` en conséquence.

**Permissions** : le dossier `backend/uploads/` doit être accessible en écriture par PHP
(généralement `chmod 755` suffit sur Hoststar ; si les uploads échouent, essayez `775`).

## 5. Vérifications post-déploiement

1. Ouvrez `https://connect.mv-3pro.ch/backend/api/auth/me.php` dans le navigateur — vous devez
   voir `{"error":"Non authentifié."}` (en JSON). Si vous voyez le code PHP brut à la place,
   PHP n'est pas activé sur ce dossier — vérifiez la version PHP configurée pour le sous-domaine
   dans le panneau Hoststar (PHP 8.0+ requis, PDO MySQL activé).
2. Ouvrez `https://connect.mv-3pro.ch/` — l'écran de connexion doit s'afficher.
3. Créez un compte admin directement en base (voir section suivante), puis testez le cycle complet
   depuis l'interface : publier un chantier, soumissionner avec un compte pro, adjuger, etc.

## 6. Créer le premier compte admin

Les inscriptions publiques ne proposent que Client / Sous-traitant / Promoteur (volontairement,
pour éviter que n'importe qui crée un compte admin). Pour créer le tout premier administrateur,
ouvrez phpMyAdmin sur la base et exécutez (adaptez l'e-mail et générez un hash de mot de passe
avec `password_hash('votremotdepasse', PASSWORD_DEFAULT)` en PHP, ou demandez-moi de le générer) :

```sql
INSERT INTO users (role, email, password_hash, nom)
VALUES ('admin', 'admin@mv-3pro.ch', '<hash_généré>', 'Administrateur MV3');
```

## 7. Sécurité — points à vérifier

- `backend/config.php` ne doit **jamais** être accessible publiquement en clair. Le `.htaccess`
  fourni bloque son accès HTTP direct, mais vérifiez que le module Apache `mod_rewrite`/
  `mod_authz_core` est actif chez Hoststar (c'est le cas par défaut).
- `cors_origin` dans `config.php` doit être réglé sur `https://connect.mv-3pro.ch` en production
  (pas `*`), pour empêcher d'autres sites d'appeler votre API avec les identifiants d'un
  utilisateur connecté.
- Le site doit être servi en HTTPS (certificat gratuit Let's Encrypt généralement disponible
  dans le panneau Hoststar sous **SSL/TLS**) — sans ça, les mots de passe circuleraient en clair.
- Les sessions expirent après 30 jours (voir `sessions.expires_at` dans le schéma) ; ajustez
  `INTERVAL 30 DAY` dans `login.php`/`register.php` si vous voulez une durée différente.

## 8. Limitations actuelles à connaître

- Pas de récupération de mot de passe oublié (à ajouter si besoin — je peux le faire).
- La messagerie (chat) reste une démonstration locale non connectée à la base.
- Pas d'envoi d'e-mails/notifications push réels (les notifications ne sont visibles que dans
  l'app, pas encore envoyées par e-mail).
