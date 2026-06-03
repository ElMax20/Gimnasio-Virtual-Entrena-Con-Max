-- db_schema.sql
CREATE DATABASE IF NOT EXISTS `entrena_con_max` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `entrena_con_max`;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Perfiles Nutricionales (1 a 1 con usuarios)
CREATE TABLE IF NOT EXISTS `profiles` (
    `user_id` INT PRIMARY KEY,
    `gender` ENUM('male', 'female') NOT NULL,
    `age` INT NOT NULL,
    `weight` DECIMAL(5,2) NOT NULL,
    `height` DECIMAL(5,2) NOT NULL,
    `unit_weight` VARCHAR(5) DEFAULT 'kg',
    `unit_height` VARCHAR(5) DEFAULT 'cm',
    `activity` ENUM('bajo', 'moderado', 'alto', 'muy_alto') NOT NULL,
    `goal` ENUM('perdida_peso', 'subida_peso', 'definicion', 'mantenimiento', 'deportivo') NOT NULL,
    `body_fat` VARCHAR(10) DEFAULT NULL,
    `target_weight` DECIMAL(5,2) NOT NULL,
    `tmb` INT NOT NULL,
    `getd` INT NOT NULL,
    `target_calories` INT NOT NULL,
    `is_capped` TINYINT(1) DEFAULT 0,
    `protein_g` DECIMAL(5,1) NOT NULL,
    `fat_g` DECIMAL(5,1) NOT NULL,
    `carb_g` DECIMAL(5,1) NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Comidas y Alimentos
CREATE TABLE IF NOT EXISTS `meals` (
    `id` VARCHAR(50) PRIMARY KEY, -- Mantenemos VARCHAR para compatibilidad con uniqid() del frontend
    `user_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `section` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `carbs` DECIMAL(6,2) NOT NULL,
    `proteins` DECIMAL(6,2) NOT NULL,
    `fats` DECIMAL(6,2) NOT NULL,
    `kcal` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Historial de Peso
CREATE TABLE IF NOT EXISTS `weight_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `weight` DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `user_date_weight` (`user_id`, `date`)
) ENGINE=InnoDB;

-- TABLAS DE ENTRENAMIENTO Y RUTINAS (AGREGADO NUEVO)

-- 1. Tabla de Rutinas
CREATE TABLE IF NOT EXISTS `routines` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Tabla de Ejercicios en Rutinas
CREATE TABLE IF NOT EXISTS `routine_exercises` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `routine_id` INT NOT NULL,
    `exercise_name` VARCHAR(255) NOT NULL,
    `exercise_id` VARCHAR(100) DEFAULT NULL,
    `rest_time` INT DEFAULT 60, -- en segundos
    `use_discs` TINYINT(1) DEFAULT 0,
    `bar_weight` DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabla de Series Planificadas
CREATE TABLE IF NOT EXISTS `routine_sets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exercise_id` INT NOT NULL,
    `set_number` INT NOT NULL,
    `weight` DECIMAL(6,2) NOT NULL,
    `reps` VARCHAR(50) NOT NULL, -- rango de repeticiones (ej. "8-10" o "12")
    FOREIGN KEY (`exercise_id`) REFERENCES `routine_exercises`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla de Entrenamientos Realizados (Workout Logs)
CREATE TABLE IF NOT EXISTS `workout_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `routine_id` INT DEFAULT NULL,
    `routine_title` VARCHAR(255) NOT NULL,
    `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `duration` INT NOT NULL, -- en segundos
    `volume` DECIMAL(10,2) NOT NULL, -- volumen total en kg
    `total_sets` INT NOT NULL,
    `total_reps` INT NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla de Ejercicios en Entrenamientos Realizados
CREATE TABLE IF NOT EXISTS `workout_exercise_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workout_log_id` INT NOT NULL,
    `exercise_name` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabla de Series en Entrenamientos Realizados
CREATE TABLE IF NOT EXISTS `workout_set_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exercise_log_id` INT NOT NULL,
    `set_number` INT NOT NULL,
    `weight` DECIMAL(6,2) NOT NULL,
    `reps` INT NOT NULL,
    `completed` TINYINT(1) DEFAULT 1,
    FOREIGN KEY (`exercise_log_id`) REFERENCES `workout_exercise_logs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
