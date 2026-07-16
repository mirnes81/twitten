-- MV3 Connect — schéma MySQL
-- Compatible MySQL 5.7+ / MariaDB 10.3+ (hébergement mutualisé type Hoststar)
-- Import via phpMyAdmin ou : mysql -u USER -p DBNAME < schema.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============== UTILISATEURS ==============
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role ENUM('client','pro','promo','admin') NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nom VARCHAR(190) NOT NULL,
  entreprise VARCHAR(190) NULL,          -- pour role=pro : raison sociale affichée
  organisation VARCHAR(190) NULL,        -- pour role=promo : raison sociale affichée
  note DECIMAL(2,1) NULL,                -- pour role=pro : note moyenne
  plan ENUM('Starter','Pro','Premium') NULL, -- pour role=pro
  telephone VARCHAR(40) NULL,
  npa_commune VARCHAR(190) NULL,         -- pour role=client
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token CHAR(64) PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============== CHANTIERS ==============
CREATE TABLE IF NOT EXISTS chantiers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  categorie VARCHAR(80) NOT NULL,
  ville VARCHAR(190) NULL,
  adresse VARCHAR(255) NULL,
  type_bien VARCHAR(80) NULL,
  etage VARCHAR(80) NULL,
  num_appart VARCHAR(40) NULL,
  description TEXT NULL,
  metres JSON NULL,                      -- { surfSol: 7, surfMur: 20, ... }
  budget VARCHAR(190) NULL,
  delai VARCHAR(190) NULL,
  limite VARCHAR(190) NULL,
  statut ENUM('Ouvert','Attribué','Terminé') NOT NULL DEFAULT 'Ouvert',
  prive TINYINT(1) NOT NULL DEFAULT 0,
  invites JSON NULL,                     -- liste de user_id pro invités (chantier privé)
  demandeur VARCHAR(190) NULL,           -- nom du promoteur pour le compte de qui c'est publié
  client_id INT UNSIGNED NULL,           -- si publié par un particulier
  created_by INT UNSIGNED NULL,          -- user_id admin/promo qui a publié
  match_score INT NULL,
  tags JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chantier_photos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chantier_id INT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  nom VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============== SOUMISSIONS (bordereaux) ==============
CREATE TABLE IF NOT EXISTS soumissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chantier_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,         -- pro qui soumissionne
  entreprise VARCHAR(190) NOT NULL,      -- dénormalisé pour affichage rapide
  total DECIMAL(12,2) NOT NULL,
  delai_debut VARCHAR(190) NULL,
  duree VARCHAR(190) NULL,
  garantie VARCHAR(190) NULL,
  remarques TEXT NULL,
  statut ENUM('En attente','Gagnée','Perdue') NOT NULL DEFAULT 'En attente',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS soumission_lignes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  soumission_id INT UNSIGNED NOT NULL,
  code VARCHAR(20) NULL,
  description VARCHAR(255) NOT NULL,
  unite VARCHAR(20) NULL,
  quantite DECIMAL(10,2) NOT NULL DEFAULT 0,
  prix_unitaire DECIMAL(10,2) NOT NULL DEFAULT 0,
  ordre INT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (soumission_id) REFERENCES soumissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============== SUIVI DE CHANTIER ==============
CREATE TABLE IF NOT EXISTS suivis (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chantier_id INT UNSIGNED NOT NULL,
  soumission_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,         -- pro adjugé
  entreprise VARCHAR(190) NOT NULL,
  statut ENUM('En cours','Terminé') NOT NULL DEFAULT 'En cours',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_soumission (soumission_id),
  FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE CASCADE,
  FOREIGN KEY (soumission_id) REFERENCES soumissions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suivi_jalons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  suivi_id INT UNSIGNED NOT NULL,
  jalon_key ENUM('acompte','debut','cours','reception') NOT NULL,
  label VARCHAR(190) NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  ordre INT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (suivi_id) REFERENCES suivis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suivi_photos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  suivi_id INT UNSIGNED NOT NULL,
  categorie ENUM('avant','pendant','apres') NOT NULL,
  url VARCHAR(500) NOT NULL,
  nom VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suivi_id) REFERENCES suivis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suivi_documents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  suivi_id INT UNSIGNED NOT NULL,
  jalon_key VARCHAR(20) NOT NULL,
  url VARCHAR(500) NOT NULL,
  nom VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suivi_id) REFERENCES suivis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============== FACTURATION (commission plateforme) ==============
CREATE TABLE IF NOT EXISTS factures (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  soumission_id INT UNSIGNED NOT NULL,
  chantier_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  entreprise VARCHAR(190) NOT NULL,
  montant DECIMAL(12,2) NOT NULL,
  taux DECIMAL(4,3) NOT NULL,
  commission DECIMAL(12,2) NOT NULL,
  statut ENUM('Due','Payée') NOT NULL DEFAULT 'Due',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_facture_soumission (soumission_id),
  FOREIGN KEY (soumission_id) REFERENCES soumissions(id) ON DELETE CASCADE,
  FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============== NOTIFICATIONS ==============
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,             -- destinataire précis
  role ENUM('client','pro','promo','admin') NULL, -- ou diffusion par rôle (ex. tous les admins)
  titre VARCHAR(190) NOT NULL,
  texte VARCHAR(500) NOT NULL,
  color VARCHAR(20) NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============== AVIS CLIENT ==============
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chantier_id INT UNSIGNED NOT NULL,
  suivi_id INT UNSIGNED NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  q INT NOT NULL, prix INT NOT NULL, delai INT NOT NULL, com INT NOT NULL, prop INT NOT NULL, sav INT NOT NULL,
  commentaire TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_review_suivi (suivi_id),
  FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE CASCADE,
  FOREIGN KEY (suivi_id) REFERENCES suivis(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
