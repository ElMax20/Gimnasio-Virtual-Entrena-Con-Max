<?php
// db_helper.php - Helper para persistencia en base de datos MySQL mediante PDO
date_default_timezone_set('America/Lima');

// Configuración de base de datos MySQL
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', 'PracticaBase123');
define('DB_NAME', 'entrena_con_max');

// Rutas de archivos JSON antiguos (mantenidos para referencia y migración)
define('USERS_FILE', __DIR__ . '/users.txt');
define('DATA_FILE', __DIR__ . '/user_data.txt');

// Función de conexión PDO a MySQL con inicialización automática
function db_connect() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    
    $host = DB_HOST;
    $port = DB_PORT;
    $user = DB_USER;
    $pass = DB_PASS;
    $dbname = DB_NAME;
    
    try {
        // Conexión inicial sin base de datos para intentar crearla si no existe
        $pdo_init = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass);
        $pdo_init->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo_init->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        
        // Conectar a la base de datos específica
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Inicializar tablas necesarias si no existen
        db_initialize_tables($pdo);
        
        return $pdo;
    } catch (PDOException $e) {
        die("Error crítico de base de datos: " . $e->getMessage());
    }
}

// Inicializa las tablas si no existen
function db_initialize_tables($pdo) {
    // 1. Tabla de Usuarios
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(50) NOT NULL UNIQUE,
        `email` VARCHAR(100) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `avatar` VARCHAR(255) DEFAULT '',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;");
    
    // 2. Tabla de Perfiles Nutricionales
    $pdo->exec("CREATE TABLE IF NOT EXISTS `profiles` (
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
    ) ENGINE=InnoDB;");
    
    // 3. Tabla de Comidas (meals)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `meals` (
        `id` VARCHAR(50) PRIMARY KEY,
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
    ) ENGINE=InnoDB;");
    
    // 4. Tabla de Historial de Peso
    $pdo->exec("CREATE TABLE IF NOT EXISTS `weight_history` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `date` DATE NOT NULL,
        `weight` DECIMAL(5,2) NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        UNIQUE KEY `user_date_weight` (`user_id`, `date`)
    ) ENGINE=InnoDB;");

    // === NUEVAS TABLAS DE ENTRENAMIENTO ===
    
    // 5. Tabla de Rutinas
    $pdo->exec("CREATE TABLE IF NOT EXISTS `routines` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `title` VARCHAR(255) NOT NULL,
        `description` TEXT DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;");

    // 6. Tabla de Ejercicios en Rutinas
    $pdo->exec("CREATE TABLE IF NOT EXISTS `routine_exercises` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `routine_id` INT NOT NULL,
        `exercise_name` VARCHAR(255) NOT NULL,
        `exercise_id` VARCHAR(100) DEFAULT NULL,
        `rest_time` INT DEFAULT 60,
        `use_discs` TINYINT(1) DEFAULT 0,
        `bar_weight` DECIMAL(5,2) DEFAULT 0.00,
        FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;");

    // 7. Tabla de Series Planificadas
    $pdo->exec("CREATE TABLE IF NOT EXISTS `routine_sets` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `exercise_id` INT NOT NULL,
        `set_number` INT NOT NULL,
        `weight` DECIMAL(6,2) NOT NULL,
        `reps` VARCHAR(50) NOT NULL,
        FOREIGN KEY (`exercise_id`) REFERENCES `routine_exercises`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;");

    // 8. Tabla de Entrenamientos Realizados
    $pdo->exec("CREATE TABLE IF NOT EXISTS `workout_logs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `routine_id` INT DEFAULT NULL,
        `routine_title` VARCHAR(255) NOT NULL,
        `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `duration` INT NOT NULL,
        `volume` DECIMAL(10,2) NOT NULL,
        `total_sets` INT NOT NULL,
        `total_reps` INT NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;");

    // 9. Tabla de Ejercicios Realizados
    $pdo->exec("CREATE TABLE IF NOT EXISTS `workout_exercise_logs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `workout_log_id` INT NOT NULL,
        `exercise_name` VARCHAR(255) NOT NULL,
        FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;");

    // 10. Tabla de Series Realizadas
    $pdo->exec("CREATE TABLE IF NOT EXISTS `workout_set_logs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `exercise_log_id` INT NOT NULL,
        `set_number` INT NOT NULL,
        `weight` DECIMAL(6,2) NOT NULL,
        `reps` INT NOT NULL,
        `completed` TINYINT(1) DEFAULT 1,
        FOREIGN KEY (`exercise_log_id`) REFERENCES `workout_exercise_logs`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;");
}

// Carga todos los usuarios indexados por nombre de usuario (para mantener compatibilidad)
function db_load_users() {
    $pdo = db_connect();
    $stmt = $pdo->query("SELECT * FROM users");
    $users = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $users[$row['username']] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'email' => $row['email'],
            'password' => $row['password'],
            'avatar' => $row['avatar'],
            'created_at' => $row['created_at']
        ];
    }
    return $users;
}

// Registra un nuevo usuario
function db_register_user($username, $email, $password) {
    $username = trim(strtolower($username));
    $email = trim(strtolower($email));
    if (empty($username) || empty($email) || empty($password)) {
        return ['success' => false, 'message' => 'El usuario, correo y la contraseña no pueden estar vacíos.'];
    }

    $pdo = db_connect();
    
    // Verificar duplicado de usuario
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetchColumn() > 0) {
        return ['success' => false, 'message' => 'El nombre de usuario ya está registrado.'];
    }

    // Verificar duplicado de email
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        return ['success' => false, 'message' => 'El correo electrónico ya está registrado.'];
    }

    // Guardar contraseña usando hash bcrypt
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, '')");
    $stmt->execute([$username, $email, $passwordHash]);

    return ['success' => true, 'message' => 'Registro completado con éxito.'];
}

// Inicia sesión de usuario
function db_login_user($username, $password) {
    $username = trim(strtolower($username));
    if (empty($username) || empty($password)) {
        return ['success' => false, 'message' => 'Usuario y contraseña requeridos.'];
    }

    $pdo = db_connect();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        return ['success' => false, 'message' => 'El usuario no existe.'];
    }

    if (password_verify($password, $user['password'])) {
        return ['success' => true, 'username' => $username];
    }

    return ['success' => false, 'message' => 'Contraseña incorrecta.'];
}

// Obtiene los datos de un usuario específico de la base de datos (con perfiles, comidas e historial)
function db_get_user_data($username) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    // Obtener ID del usuario
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    
    if (!$userId) {
        return [
            'profile' => null,
            'meals' => [],
            'weight_history' => []
        ];
    }
    
    // 1. Obtener perfil
    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
    $stmt->execute([$userId]);
    $profileRow = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $profile = null;
    if ($profileRow) {
        $profile = [
            'weight' => floatval($profileRow['weight']),
            'height' => floatval($profileRow['height']),
            'unit_weight' => $profileRow['unit_weight'],
            'unit_height' => $profileRow['unit_height'],
            'gender' => $profileRow['gender'],
            'age' => intval($profileRow['age']),
            'activity' => $profileRow['activity'],
            'goal' => $profileRow['goal'],
            'body_fat' => $profileRow['body_fat'],
            'target_weight' => floatval($profileRow['target_weight']),
            'tmb' => intval($profileRow['tmb']),
            'getd' => intval($profileRow['getd']),
            'target_calories' => intval($profileRow['target_calories']),
            'is_capped' => (bool)$profileRow['is_capped'],
            'macros' => [
                'protein_g' => floatval($profileRow['protein_g']),
                'fat_g' => floatval($profileRow['fat_g']),
                'carb_g' => floatval($profileRow['carb_g'])
            ]
        ];
    }
    
    // 2. Obtener comidas (meals)
    $stmt = $pdo->prepare("SELECT * FROM meals WHERE user_id = ? ORDER BY created_at ASC");
    $stmt->execute([$userId]);
    $meals = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $date = $row['date'];
        $sec = $row['section'];
        if (!isset($meals[$date])) {
            $meals[$date] = [
                'desayuno' => [],
                'almuerzo' => [],
                'merienda' => [],
                'agregar_comidas' => []
            ];
        }
        $meals[$date][$sec][] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'carbs' => floatval($row['carbs']),
            'proteins' => floatval($row['proteins']),
            'fats' => floatval($row['fats']),
            'kcal' => intval($row['kcal'])
        ];
    }
    
    // 3. Obtener historial de peso
    $stmt = $pdo->prepare("SELECT date, weight FROM weight_history WHERE user_id = ? ORDER BY date ASC");
    $stmt->execute([$userId]);
    $weight_history = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $weight_history[] = [
            'date' => $row['date'],
            'weight' => floatval($row['weight'])
        ];
    }
    
    return [
        'profile' => $profile,
        'meals' => $meals,
        'weight_history' => $weight_history
    ];
}

// Agrega una comida para una fecha y sección
function db_add_meal($username, $date, $section, $food) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    
    if (!$userId) return null;
    
    $food['id'] = uniqid();
    $stmt = $pdo->prepare("INSERT INTO meals (id, user_id, date, section, name, carbs, proteins, fats, kcal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $food['id'],
        $userId,
        $date,
        $section,
        $food['name'],
        $food['carbs'],
        $food['proteins'],
        $food['fats'],
        $food['kcal']
    ]);
    
    return $food;
}

// Elimina una comida
function db_delete_meal($username, $date, $section, $foodId) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    
    if (!$userId) return false;
    
    $stmt = $pdo->prepare("DELETE FROM meals WHERE id = ? AND user_id = ? AND date = ? AND section = ?");
    $stmt->execute([$foodId, $userId, $date, $section]);
    
    return $stmt->rowCount() > 0;
}

// Guarda el perfil de salud recalculado del usuario
function db_save_profile($username, $profile) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    
    if (!$userId) return false;
    
    // Guardar o actualizar perfil
    $stmt = $pdo->prepare("INSERT INTO profiles (
        user_id, gender, age, weight, height, unit_weight, unit_height, activity, goal, body_fat, target_weight, tmb, getd, target_calories, is_capped, protein_g, fat_g, carb_g
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) ON DUPLICATE KEY UPDATE 
        gender=VALUES(gender), age=VALUES(age), weight=VALUES(weight), height=VALUES(height), 
        unit_weight=VALUES(unit_weight), unit_height=VALUES(unit_height), activity=VALUES(activity), 
        goal=VALUES(goal), body_fat=VALUES(body_fat), target_weight=VALUES(target_weight), 
        tmb=VALUES(tmb), getd=VALUES(getd), target_calories=VALUES(target_calories), 
        is_capped=VALUES(is_capped), protein_g=VALUES(protein_g), fat_g=VALUES(fat_g), carb_g=VALUES(carb_g)");
        
    $stmt->execute([
        $userId,
        $profile['gender'],
        $profile['age'],
        $profile['weight'],
        $profile['height'],
        $profile['unit_weight'],
        $profile['unit_height'],
        $profile['activity'],
        $profile['goal'],
        $profile['body_fat'],
        $profile['target_weight'],
        $profile['tmb'],
        $profile['getd'],
        $profile['target_calories'],
        $profile['is_capped'] ? 1 : 0,
        $profile['macros']['protein_g'],
        $profile['macros']['fat_g'],
        $profile['macros']['carb_g']
    ]);
    
    // Registrar el peso en el historial (si es hoy)
    $date = date('Y-m-d');
    $stmt = $pdo->prepare("INSERT INTO weight_history (user_id, date, weight) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE weight = VALUES(weight)");
    $stmt->execute([$userId, $date, $profile['weight']]);
    
    return true;
}

// Agrega una actualización de peso y recalcula si es significativo
function db_log_weight($username, $weight) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    
    if (!$userId) return null;
    
    $date = date('Y-m-d');
    
    // Registrar peso
    $stmt = $pdo->prepare("INSERT INTO weight_history (user_id, date, weight) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE weight = VALUES(weight)");
    $stmt->execute([$userId, $date, $weight]);
    
    // Recalcular perfil
    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
    $stmt->execute([$userId]);
    $profileRow = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($profileRow) {
        $oldWeight = floatval($profileRow['weight']);
        
        if (abs($oldWeight - $weight) >= 0.1) {
            $profileRow['weight'] = $weight;
            
            $weight_kg = ($profileRow['unit_weight'] === 'lbs') ? ($weight * 0.453592) : $weight;
            $height_cm = ($profileRow['unit_height'] === 'in') ? (floatval($profileRow['height']) * 2.54) : floatval($profileRow['height']);
            $age = intval($profileRow['age']);
            
            if ($profileRow['gender'] === 'male') {
                $tmb = (10 * $weight_kg) + (6.25 * $height_cm) - (5 * $age) + 5;
            } else {
                $tmb = (10 * $weight_kg) + (6.25 * $height_cm) - (5 * $age) - 161;
            }
            
            $multipliers = [
                'bajo' => 1.2,
                'moderado' => 1.375,
                'alto' => 1.55,
                'muy_alto' => 1.725
            ];
            $mult = isset($multipliers[$profileRow['activity']]) ? $multipliers[$profileRow['activity']] : 1.2;
            $getd = $tmb * $mult;
            
            $target_calories = $getd;
            if ($profileRow['goal'] === 'perdida_peso' || $profileRow['goal'] === 'definicion') {
                $target_calories = $getd - 400;
            } elseif ($profileRow['goal'] === 'subida_peso' || $profileRow['goal'] === 'deportivo') {
                $target_calories = $getd + 400;
            }
            
            $is_capped = false;
            if ($profileRow['gender'] === 'female' && $target_calories < 1200) {
                $target_calories = 1200;
                $is_capped = true;
            } elseif ($profileRow['gender'] === 'male' && $target_calories < 1500) {
                $target_calories = 1500;
                $is_capped = true;
            }
            
            $protein_g = 1.8 * $weight_kg;
            $protein_kcal = $protein_g * 4;
            $fat_kcal = $target_calories * 0.25;
            $fat_g = $fat_kcal / 9;
            $carb_kcal = $target_calories - $protein_kcal - $fat_kcal;
            if ($carb_kcal < 0) $carb_kcal = 0;
            $carb_g = $carb_kcal / 4;
            
            $profileRow['tmb'] = round($tmb);
            $profileRow['getd'] = round($getd);
            $profileRow['target_calories'] = round($target_calories);
            $profileRow['is_capped'] = $is_capped ? 1 : 0;
            $profileRow['protein_g'] = round($protein_g, 1);
            $profileRow['fat_g'] = round($fat_g, 1);
            $profileRow['carb_g'] = round($carb_g, 1);
            
            $stmt = $pdo->prepare("UPDATE profiles SET 
                weight = ?, tmb = ?, getd = ?, target_calories = ?, is_capped = ?, protein_g = ?, fat_g = ?, carb_g = ?
                WHERE user_id = ?");
            $stmt->execute([
                $weight,
                $profileRow['tmb'],
                $profileRow['getd'],
                $profileRow['target_calories'],
                $profileRow['is_capped'],
                $profileRow['protein_g'],
                $profileRow['fat_g'],
                $profileRow['carb_g'],
                $userId
            ]);
        }
    }
    
    return db_get_user_data($username);
}

// Actualiza las credenciales del usuario
function db_update_user_credentials($oldUsername, $newUsername, $newEmail, $avatarPath) {
    $oldUsername = trim(strtolower($oldUsername));
    $newUsername = trim(strtolower($newUsername));
    $newEmail = trim(strtolower($newEmail));
    
    if (empty($newUsername) || empty($newEmail)) {
        return ['success' => false, 'message' => 'El nombre de usuario y el correo no pueden estar vacíos.'];
    }
    
    $pdo = db_connect();
    
    // Verificar si el nuevo username ya existe
    if ($oldUsername !== $newUsername) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([$newUsername]);
        if ($stmt->fetchColumn() > 0) {
            return ['success' => false, 'message' => 'El nuevo nombre de usuario ya está en uso.'];
        }
    }
    
    // Verificar si el nuevo email ya existe
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ? AND username != ?");
    $stmt->execute([$newEmail, $oldUsername]);
    if ($stmt->fetchColumn() > 0) {
        return ['success' => false, 'message' => 'El correo electrónico ya está en uso por otra cuenta.'];
    }
    
    // Actualizar datos de usuario
    if ($avatarPath !== null) {
        $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ?, avatar = ? WHERE username = ?");
        $stmt->execute([$newUsername, $newEmail, $avatarPath, $oldUsername]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ? WHERE username = ?");
        $stmt->execute([$newUsername, $newEmail, $oldUsername]);
    }
    
    return ['success' => true, 'message' => 'Configuración actualizada con éxito.'];
}

// Obtiene el access token para FatSecret OAuth 2.0 con caché
function get_fatsecret_token() {
    $tokenFile = __DIR__ . '/fatsecret_token.txt';
    if (file_exists($tokenFile)) {
        $data = json_decode(file_get_contents($tokenFile), true);
        if (is_array($data) && isset($data['access_token']) && isset($data['expires_at']) && $data['expires_at'] > time()) {
            return $data['access_token'];
        }
    }

    $clientId = '856d7ec06200498f9b5679923ddab29d';
    $clientSecret = 'dee3aa9884a5458dad637464f0d2c8ad';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://oauth.fatsecret.com/connect/token');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'client_credentials',
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'scope' => 'basic'
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        return null;
    }
    curl_close($ch);
    
    $data = json_decode($response, true);
    if (is_array($data) && isset($data['access_token'])) {
        $data['expires_at'] = time() + intval($data['expires_in'] ?? 3600) - 60;
        file_put_contents($tokenFile, json_encode($data));
        return $data['access_token'];
    }
    
    return null;
}

// Busca alimentos en FatSecret API
function search_fatsecret_food($query) {
    $token = get_fatsecret_token();
    if (!$token) {
        return ['error' => 'No se pudo obtener el token de acceso de FatSecret.'];
    }
    
    $url = 'https://platform.fatsecret.com/rest/server.api?' . http_build_query([
        'method' => 'foods.search',
        'search_expression' => $query,
        'format' => 'json',
        'max_results' => 10
    ]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        return ['error' => 'Error al conectar con la API de FatSecret.'];
    }
    curl_close($ch);
    
    $data = json_decode($response, true);
    return $data;
}


// === NUEVAS FUNCIONES DE ENTRENAMIENTO ===

// Busca ejercicios en ExerciseDB API de RapidAPI (con fallback local)
function search_exercisedb_exercises($query) {
    $apiKey = 'd6c7bdbdemsh77f4552059fa61dp1a3516jsn08896c86b72';
    $host = 'exercisedb.p.rapidapi.com';
    
    $queryClean = strtolower(trim($query));
    $mockExercises = [
        ['id' => 'm1', 'name' => 'press de banca plano', 'bodyPart' => 'chest', 'target' => 'pectorals'],
        ['id' => 'm2', 'name' => 'press inclinado con mancuernas', 'bodyPart' => 'chest', 'target' => 'pectorals'],
        ['id' => 'm3', 'name' => 'sentadillas con barra', 'bodyPart' => 'legs', 'target' => 'quads'],
        ['id' => 'm4', 'name' => 'peso muerto rumano', 'bodyPart' => 'legs', 'target' => 'hamstrings'],
        ['id' => 'm5', 'name' => 'press militar con barra', 'bodyPart' => 'shoulders', 'target' => 'deltoids'],
        ['id' => 'm6', 'name' => 'elevaciones laterales', 'bodyPart' => 'shoulders', 'target' => 'deltoids'],
        ['id' => 'm7', 'name' => 'dominadas pronas', 'bodyPart' => 'back', 'target' => 'lats'],
        ['id' => 'm8', 'name' => 'remo con barra', 'bodyPart' => 'back', 'target' => 'lats'],
        ['id' => 'm9', 'name' => 'jalon al pecho en polea', 'bodyPart' => 'back', 'target' => 'lats'],
        ['id' => 'm10', 'name' => 'face pulls', 'bodyPart' => 'back/shoulders', 'target' => 'deltoids'],
        ['id' => 'm11', 'name' => 'fondos de triceps', 'bodyPart' => 'arms', 'target' => 'triceps'],
        ['id' => 'm12', 'name' => 'curl de biceps alterno', 'bodyPart' => 'arms', 'target' => 'biceps']
    ];
    
    $responseArray = null;
    
    if (!empty($queryClean)) {
        $url = "https://{$host}/exercises/name/" . urlencode($queryClean) . "?limit=15";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "X-RapidAPI-Key: $apiKey",
            "X-RapidAPI-Host: $host"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $response) {
            $responseArray = json_decode($response, true);
        }
    }
    
    // Si la API falla, no está autorizada o la consulta está vacía, filtramos el listado mock local
    if (!is_array($responseArray) || isset($responseArray['message'])) {
        if (empty($queryClean)) {
            return $mockExercises;
        }
        $filtered = [];
        foreach ($mockExercises as $ex) {
            if (stripos($ex['name'], $queryClean) !== false) {
                $filtered[] = $ex;
            }
        }
        return $filtered;
    }
    
    return $responseArray;
}

// Guarda o actualiza una rutina personalizada
function db_save_routine($username, $routineData) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    if (!$userId) return ['success' => false, 'message' => 'Usuario no encontrado'];
    
    try {
        $pdo->beginTransaction();
        
        $title = trim($routineData['title'] ?? 'Nueva Rutina');
        
        // Generar descripción listando los ejercicios
        $exerciseNames = [];
        if (isset($routineData['exercises']) && is_array($routineData['exercises'])) {
            foreach ($routineData['exercises'] as $ex) {
                $exerciseNames[] = trim($ex['name']);
            }
        }
        $description = !empty($exerciseNames) ? implode(', ', $exerciseNames) : 'Rutina vacía';
        
        if (isset($routineData['id']) && $routineData['id'] > 0) {
            $routineId = intval($routineData['id']);
            $stmt = $pdo->prepare("UPDATE routines SET title = ?, description = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$title, $description, $routineId, $userId]);
            
            // Eliminar ejercicios previos para re-insertar
            $stmt = $pdo->prepare("DELETE FROM routine_exercises WHERE routine_id = ?");
            $stmt->execute([$routineId]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO routines (user_id, title, description) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $title, $description]);
            $routineId = $pdo->lastInsertId();
        }
        
        // Insertar ejercicios y series
        if (isset($routineData['exercises']) && is_array($routineData['exercises'])) {
            foreach ($routineData['exercises'] as $ex) {
                $exerciseName = trim($ex['name']);
                $restTime = intval($ex['rest_time'] ?? 60);
                $useDiscs = isset($ex['use_discs']) ? intval($ex['use_discs']) : 0;
                $barWeight = floatval($ex['bar_weight'] ?? 0.00);
                
                $stmt = $pdo->prepare("INSERT INTO routine_exercises (routine_id, exercise_name, rest_time, use_discs, bar_weight) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$routineId, $exerciseName, $restTime, $useDiscs, $barWeight]);
                $exerciseId = $pdo->lastInsertId();
                
                if (isset($ex['sets']) && is_array($ex['sets'])) {
                    foreach ($ex['sets'] as $set) {
                        $setNumber = intval($set['set_number']);
                        $weight = floatval($set['weight']);
                        $reps = trim($set['reps']);
                        
                        $stmt = $pdo->prepare("INSERT INTO routine_sets (exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?)");
                        $stmt->execute([$exerciseId, $setNumber, $weight, $reps]);
                    }
                }
            }
        }
        
        $pdo->commit();
        return ['success' => true, 'routine_id' => $routineId];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

// Carga las rutinas de un usuario
function db_get_routines($username) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    if (!$userId) return [];
    
    $stmt = $pdo->prepare("SELECT * FROM routines WHERE user_id = ? ORDER BY id DESC");
    $stmt->execute([$userId]);
    $routines = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $routineId = $row['id'];
        
        // Obtener ejercicios
        $stmt2 = $pdo->prepare("SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY id ASC");
        $stmt2->execute([$routineId]);
        $exercises = [];
        
        while ($exRow = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            $exId = $exRow['id'];
            
            // Obtener series
            $stmt3 = $pdo->prepare("SELECT * FROM routine_sets WHERE exercise_id = ? ORDER BY set_number ASC");
            $stmt3->execute([$exId]);
            $sets = [];
            
            while ($setRow = $stmt3->fetch(PDO::FETCH_ASSOC)) {
                $sets[] = [
                    'id' => $setRow['id'],
                    'set_number' => intval($setRow['set_number']),
                    'weight' => floatval($setRow['weight']),
                    'reps' => $setRow['reps']
                ];
            }
            
            $exercises[] = [
                'id' => $exId,
                'name' => $exRow['exercise_name'],
                'rest_time' => intval($exRow['rest_time']),
                'use_discs' => (bool)$exRow['use_discs'],
                'bar_weight' => floatval($exRow['bar_weight']),
                'sets' => $sets
            ];
        }
        
        $routines[] = [
            'id' => $routineId,
            'title' => $row['title'],
            'description' => $row['description'],
            'created_at' => $row['created_at'],
            'exercises' => $exercises
        ];
    }
    
    return $routines;
}

// Elimina una rutina
function db_delete_routine($username, $routineId) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    if (!$userId) return false;
    
    $stmt = $pdo->prepare("DELETE FROM routines WHERE id = ? AND user_id = ?");
    $stmt->execute([$routineId, $userId]);
    
    return $stmt->rowCount() > 0;
}

// Duplica una rutina
function db_duplicate_routine($username, $routineId) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    if (!$userId) return ['success' => false, 'message' => 'Usuario no encontrado'];
    
    try {
        $pdo->beginTransaction();
        
        // Cargar rutina
        $stmt = $pdo->prepare("SELECT * FROM routines WHERE id = ? AND user_id = ?");
        $stmt->execute([$routineId, $userId]);
        $r = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$r) throw new Exception("Rutina original no encontrada.");
        
        $newTitle = $r['title'] . " (Copia)";
        $stmt = $pdo->prepare("INSERT INTO routines (user_id, title, description) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $newTitle, $r['description']]);
        $newRoutineId = $pdo->lastInsertId();
        
        // Cargar ejercicios
        $stmt = $pdo->prepare("SELECT * FROM routine_exercises WHERE routine_id = ?");
        $stmt->execute([$routineId]);
        $exercises = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($exercises as $ex) {
            $stmt2 = $pdo->prepare("INSERT INTO routine_exercises (routine_id, exercise_name, exercise_id, rest_time, use_discs, bar_weight) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt2->execute([
                $newRoutineId,
                $ex['exercise_name'],
                $ex['exercise_id'],
                $ex['rest_time'],
                $ex['use_discs'],
                $ex['bar_weight']
            ]);
            $newExId = $pdo->lastInsertId();
            
            // Cargar series
            $stmt3 = $pdo->prepare("SELECT * FROM routine_sets WHERE exercise_id = ?");
            $stmt3->execute([$ex['id']]);
            $sets = $stmt3->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($sets as $set) {
                $stmt4 = $pdo->prepare("INSERT INTO routine_sets (exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?)");
                $stmt4->execute([
                    $newExId,
                    $set['set_number'],
                    $set['weight'],
                    $set['reps']
                ]);
            }
        }
        
        $pdo->commit();
        return ['success' => true, 'new_routine_id' => $newRoutineId];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

// Guarda el log de un entrenamiento realizado
function db_save_workout_log($username, $workoutData) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    if (!$userId) return ['success' => false, 'message' => 'Usuario no encontrado'];
    
    try {
        $pdo->beginTransaction();
        
        $routineId = isset($workoutData['routine_id']) && $workoutData['routine_id'] > 0 ? intval($workoutData['routine_id']) : null;
        $routineTitle = trim($workoutData['routine_title'] ?? 'Entrenamiento Personalizado');
        $duration = intval($workoutData['duration'] ?? 0);
        $volume = floatval($workoutData['volume'] ?? 0.00);
        $totalSets = intval($workoutData['total_sets'] ?? 0);
        $totalReps = intval($workoutData['total_reps'] ?? 0);
        
        $stmt = $pdo->prepare("INSERT INTO workout_logs (user_id, routine_id, routine_title, duration, volume, total_sets, total_reps) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $routineId, $routineTitle, $duration, $volume, $totalSets, $totalReps]);
        $workoutLogId = $pdo->lastInsertId();
        
        if (isset($workoutData['exercises']) && is_array($workoutData['exercises'])) {
            foreach ($workoutData['exercises'] as $ex) {
                $stmt = $pdo->prepare("INSERT INTO workout_exercise_logs (workout_log_id, exercise_name) VALUES (?, ?)");
                $stmt->execute([$workoutLogId, trim($ex['name'])]);
                $exerciseLogId = $pdo->lastInsertId();
                
                if (isset($ex['sets']) && is_array($ex['sets'])) {
                    foreach ($ex['sets'] as $set) {
                        $stmt = $pdo->prepare("INSERT INTO workout_set_logs (exercise_log_id, set_number, weight, reps, completed) VALUES (?, ?, ?, ?, ?)");
                        $stmt->execute([
                            $exerciseLogId,
                            intval($set['set_number']),
                            floatval($set['weight']),
                            intval($set['reps']),
                            $set['completed'] ? 1 : 0
                        ]);
                    }
                }
            }
        }
        
        $pdo->commit();
        return ['success' => true, 'workout_log_id' => $workoutLogId];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

// Obtiene los logs de entrenamientos de un usuario para una rutina
function db_get_workout_logs($username, $routineId) {
    $username = trim(strtolower($username));
    $pdo = db_connect();
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userId = $stmt->fetchColumn();
    if (!$userId) return [];
    
    $stmt = $pdo->prepare("SELECT * FROM workout_logs WHERE user_id = ? AND routine_id = ? ORDER BY date ASC");
    $stmt->execute([$userId, $routineId]);
    $logs = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $logs[] = [
            'id' => $row['id'],
            'routine_title' => $row['routine_title'],
            'date' => $row['date'],
            'duration' => intval($row['duration']),
            'volume' => floatval($row['volume']),
            'total_sets' => intval($row['total_sets']),
            'total_reps' => intval($row['total_reps'])
        ];
    }
    
    return $logs;
}
