-- DigiMitra MySQL 8.0 Initialization Script
CREATE DATABASE IF NOT EXISTS digimitra_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE digimitra_db;

GRANT ALL PRIVILEGES ON digimitra_db.* TO 'digimitra_user'@'%';
FLUSH PRIVILEGES;
