# Déploiement de MV3 Connect sur Hoststar (connect.mv-3pro.ch)

## Check-list rapide

- [ ] Sous-domaine `connect.mv-3pro.ch` créé dans le panneau Hoststar
- [ ] Base de données MySQL créée, `backend/schema.sql` importé via phpMyAdmin
- [ ] `backend/config.example.php` copié en `backend/config.php` et rempli avec vos identifiants MySQL
- [ ] `npm run build` exécuté, contenu de `dist/` prêt à uploader
- [ ] Upload FTP/SFTP fait (voir arborescence section 4)
- [ ] `https://connect.mv-3pro.ch/backend/api/auth/me.php` répond en JSON (pas en PHP brut)
- [ ] Compte admin créé via `setup_admin.php` (section 6), puis **le fichier supprimé du serveur**
- [ ] Cycle complet testé depuis l'interface (publier, soumissionner, adjuger, suivi, facture)

## 1. Créer le sous-domaine

1. Connectez-vous au panneau d'administration Hoststar.
2. Allez dans **Domaines** → **Sous-domaines** (ou équivalent selon la version du panneau).
3. Créez `connect` sur `mv-3pro.ch`, avec pour dossier racine quelque chose comme
   `/connect.mv-3pro.ch/` (Hoststar propose généralement un dossier dédié automatiquement).
4. Attendez la propagation DNS (généralement immédiate en interne chez Hoststar, jusqu'à
   quelques heures en externe).

## 2. Créer la base de données MySQL

1. Dans le panneau Hoststar : **Bases de données** → **MySQL** → **Créer une base**.
2. Notez le nom de la base, l'utilisateur et le mot de passe générés (ou choisis) — vous en
   aurez besoin à l'étape 3, dans votre propre `config.php`.
3. Ouvrez **phpMyAdmin** depuis le panneau, sélectionnez la nouvelle base, onglet **Importer**,
   et importez le fichier `backend/schema.sql` de ce dépôt. Ça crée toutes les tables.

## 3. Préparer les fichiers

Sur votre machine (ou directement ici) :

```
mv3-connect/
  backend/        → à uploader tel quel dans un sous-dossier /backend du site
  dist/           → générer avec `npm run build`, uploader le contenu à la racine du sous-domaine
```

1. `cd mv3-connect && npm install && npm run build` — génère `dist/index.html` et `dist/assets/`.
2. Copiez `backend/config.example.php` vers `backend/config.php` et remplissez les 4 identifiants
   MySQL obtenus à l'étape 2 (`db_host`, `db_name`, `db_user`, `db_pass`). Les autres valeurs
   (`cors_origin`, `uploads_url`) sont déjà correctes pour la production, inutile d'y toucher.
   **Ce fichier reste sur votre machine / votre serveur — ne le partagez avec personne.**

## 4. Upload FTP/SFTP

Arborescence cible sur le serveur (racine du sous-domaine) :

```
/connect.mv-3pro.ch/
  index.html            ← contenu de dist/
  assets/                ← contenu de dist/assets/
  backend/                ← tout le dossier backend/ (avec config.php, PAS config.example.php)
    uploads/              ← doit être accessible en écriture par PHP (chmod 755 ou 775)
    setup_admin.php        ← à supprimer du serveur juste après avoir créé le compte admin (section 6)
```

Le frontend appelle l'API via le chemin relatif `/backend/api/...` par défaut — si vous préférez
un autre chemin, définissez `VITE_API_BASE` avant de builder (`VITE_API_BASE=/api npm run build`)
et adaptez à la fois l'emplacement du dossier `backend` et la valeur `uploads_url` dans `config.php`
en conséquence.

**Permissions** : le dossier `backend/uploads/` doit être accessible en écriture par PHP
(généralement `chmod 755` suffit sur Hoststar ; si les uploads échouent, essayez `775`).

## 5. Vérifications post-déploiement

1. Ouvrez `https://connect.mv-3pro.ch/backend/api/auth/me.php` dans le navigateur — vous devez
   voir `{"error":"Non authentifié."}` (en JSON). Si vous voyez le code PHP brut à la place,
   PHP n'est pas activé sur ce dossier — vérifiez la version PHP configurée pour le sous-domaine
   dans le panneau Hoststar (PHP 8.0+ requis, PDO MySQL activé).
2. Ouvrez `https://connect.mv-3pro.ch/` — l'écran de connexion doit s'afficher.
3. Créez votre compte admin (section 6 ci-dessous), puis testez le cycle complet depuis
   l'interface : publier un chantier, soumissionner avec un compte pro, adjuger, suivre le
   chantier, régler la commission.

## 6. Créer le premier compte admin

Les inscriptions publiques ne proposent que Client / Sous-traitant / Promoteur (volontairement,
pour éviter que n'importe qui crée un compte admin). Un outil dédié, `backend/setup_admin.php`,
vous permet de créer le tout premier administrateur vous-même, sans écrire de SQL et sans
communiquer votre mot de passe à qui que ce soit :

1. Ouvrez `backend/setup_admin.php` et changez la ligne `const SETUP_KEY = 'CHANGEZ-MOI-avant-upload';`
   pour une valeur secrète de votre choix (gardez-la pour vous, ne me la communiquez pas).
2. Uploadez ce fichier modifié dans `backend/` sur le serveur, à côté de `config.php`.
3. Ouvrez `https://connect.mv-3pro.ch/backend/setup_admin.php`, remplissez le formulaire
   (clé d'installation, nom, e-mail, mot de passe).
4. **Supprimez immédiatement `setup_admin.php` du serveur** via FTP/SFTP — c'est une porte de
   création de compte admin, elle ne doit pas rester accessible en ligne.
5. Connectez-vous sur `https://connect.mv-3pro.ch/` avec cet e-mail et ce mot de passe.

## 7. Sécurité — points à vérifier

- `backend/config.php` ne doit **jamais** être accessible publiquement en clair. Le `.htaccess`
  fourni bloque son accès HTTP direct, mais vérifiez que le module Apache `mod_rewrite`/
  `mod_authz_core` est actif chez Hoststar (c'est le cas par défaut).
- `backend/setup_admin.php` doit être supprimé du serveur juste après utilisation (section 6).
- `cors_origin` dans `config.php` doit rester réglé sur `https://connect.mv-3pro.ch` en production
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
