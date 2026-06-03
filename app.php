<?php
// app.php - Dashboard y Autenticación del Gimnasio Virtual
session_start();
require_once 'db_helper.php';

$auth_error = '';
$auth_success = '';

// Procesar Acciones de Formularios (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'register') {
            $username = $_POST['username'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $res = db_register_user($username, $email, $password);
            if ($res['success']) {
                $auth_success = $res['message'];
            } else {
                $auth_error = $res['message'];
            }
        } elseif ($_POST['action'] === 'login') {
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            $res = db_login_user($username, $password);
            if ($res['success']) {
                $_SESSION['username'] = $res['username'];
                header('Location: app.php');
                exit;
            } else {
                $auth_error = $res['message'];
            }
        } elseif ($_POST['action'] === 'onboarding') {
            if (!isset($_SESSION['username'])) {
                header('Location: app.php');
                exit;
            }
            $username = $_SESSION['username'];
            
            $weight = floatval($_POST['weight'] ?? 0);
            $height = floatval($_POST['height'] ?? 0);
            $unit_weight = $_POST['unit_weight'] ?? 'kg';
            $unit_height = $_POST['unit_height'] ?? 'cm';
            $gender = $_POST['gender'] ?? 'male';
            $age = intval($_POST['age'] ?? 0);
            $activity = $_POST['activity'] ?? 'moderado';
            $goal = $_POST['goal'] ?? 'mantenimiento';
            $body_fat = $_POST['body_fat'] ?? '13-15%';
            $target_weight = floatval($_POST['target_weight'] ?? $weight);

            // Conversión de unidades para las fórmulas (Mifflin requiere kg y cm)
            $weight_kg = ($unit_weight === 'lbs') ? ($weight * 0.453592) : $weight;
            $height_cm = ($unit_height === 'in') ? ($height * 2.54) : $height;

            // Paso A: TMB (Mifflin-St Jeor)
            if ($gender === 'male') {
                $tmb = (10 * $weight_kg) + (6.25 * $height_cm) - (5 * $age) + 5;
            } else {
                $tmb = (10 * $weight_kg) + (6.25 * $height_cm) - (5 * $age) - 161;
            }

            // Paso B: GETD (Gasto Energético Total Diario)
            $multipliers = [
                'bajo' => 1.2,
                'moderado' => 1.375,
                'alto' => 1.55,
                'muy_alto' => 1.725
            ];
            $mult = isset($multipliers[$activity]) ? $multipliers[$activity] : 1.2;
            $getd = $tmb * $mult;

            // Paso C: Objetivo Calórico (Déficit o Superávit)
            $target_calories = $getd;
            if ($goal === 'perdida_peso' || $goal === 'definicion') {
                $target_calories = $getd - 400; // Déficit de 400 kcal
            } elseif ($goal === 'subida_peso' || $goal === 'deportivo') {
                $target_calories = $getd + 400; // Superávit de 400 kcal
            }

            // Parámetros de Control y Seguridad
            $is_capped = false;
            if ($gender === 'female' && $target_calories < 1200) {
                $target_calories = 1200;
                $is_capped = true;
            } elseif ($gender === 'male' && $target_calories < 1500) {
                $target_calories = 1500;
                $is_capped = true;
            }

            // Desglose de Macronutrientes
            $protein_g = 1.8 * $weight_kg;
            $protein_kcal = $protein_g * 4;
            $fat_kcal = $target_calories * 0.25; // 25% grasas
            $fat_g = $fat_kcal / 9;
            $carb_kcal = $target_calories - $protein_kcal - $fat_kcal;
            if ($carb_kcal < 0) $carb_kcal = 0;
            $carb_g = $carb_kcal / 4;

            $profile = [
                'weight' => $weight,
                'height' => $height,
                'unit_weight' => $unit_weight,
                'unit_height' => $unit_height,
                'gender' => $gender,
                'age' => $age,
                'activity' => $activity,
                'goal' => $goal,
                'body_fat' => $body_fat,
                'target_weight' => $target_weight,
                'tmb' => round($tmb),
                'getd' => round($getd),
                'target_calories' => round($target_calories),
                'is_capped' => $is_capped,
                'macros' => [
                    'protein_g' => round($protein_g, 1),
                    'fat_g' => round($fat_g, 1),
                    'carb_g' => round($carb_g, 1)
                ]
            ];

            db_save_profile($username, $profile);
            header('Location: app.php');
            exit;
        }
    }
}

// Procesar Peticiones AJAX
if (isset($_GET['ajax'])) {
    if (!isset($_SESSION['username'])) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'No autorizado']);
        exit;
    }
    
    $username = $_SESSION['username'];
    $date = date('Y-m-d');
    header('Content-Type: application/json');

    if ($_GET['ajax'] === 'search_food') {
        $query = trim($_GET['q'] ?? '');
        if (empty($query)) {
            echo json_encode(['success' => false, 'error' => 'Consulta vacía.']);
            exit;
        }
        
        $res = search_fatsecret_food($query);
        
        if (isset($res['error']) || !isset($res['foods_search']['results']['food'])) {
            $mockFoods = [
                [
                    'food_id' => '1',
                    'food_name' => 'Pechuga de Pollo a la Plancha',
                    'food_description' => 'Per 100g - Calories: 165kcal | Fat: 3.60g | Carbs: 0.00g | Protein: 31.00g'
                ],
                [
                    'food_id' => '2',
                    'food_name' => 'Arroz Blanco Cocido',
                    'food_description' => 'Per 100g - Calories: 130kcal | Fat: 0.30g | Carbs: 28.00g | Protein: 2.70g'
                ],
                [
                    'food_id' => '3',
                    'food_name' => 'Huevo Entero Cocido',
                    'food_description' => 'Per 1 serving (50g) - Calories: 78kcal | Fat: 5.30g | Carbs: 0.60g | Protein: 6.30g'
                ],
                [
                    'food_id' => '4',
                    'food_name' => 'Plátano / Banano',
                    'food_description' => 'Per 100g - Calories: 89kcal | Fat: 0.30g | Carbs: 23.00g | Protein: 1.10g'
                ],
                [
                    'food_id' => '5',
                    'food_name' => 'Avena en Hojuelas',
                    'food_description' => 'Per 100g - Calories: 389kcal | Fat: 6.90g | Carbs: 66.00g | Protein: 16.90g'
                ],
                [
                    'food_id' => '6',
                    'food_name' => 'Lomo de Vetado / Res',
                    'food_description' => 'Per 100g - Calories: 250kcal | Fat: 15.00g | Carbs: 0.00g | Protein: 26.00g'
                ],
                [
                    'food_id' => '7',
                    'food_name' => 'Manzana Roja',
                    'food_description' => 'Per 100g - Calories: 52kcal | Fat: 0.20g | Carbs: 14.00g | Protein: 0.30g'
                ],
                [
                    'food_id' => '8',
                    'food_name' => 'Leche Semidescremada',
                    'food_description' => 'Per 100ml - Calories: 46kcal | Fat: 1.50g | Carbs: 4.80g | Protein: 3.20g'
                ],
                [
                    'food_id' => '9',
                    'food_name' => 'Arroz Integral Cocido',
                    'food_description' => 'Per 100g - Calories: 111kcal | Fat: 0.90g | Carbs: 23.00g | Protein: 2.60g'
                ],
                [
                    'food_id' => '10',
                    'food_name' => 'Carne Molida de Res (Magra 90%)',
                    'food_description' => 'Per 100g - Calories: 176kcal | Fat: 10.00g | Carbs: 0.00g | Protein: 20.00g'
                ],
                [
                    'food_id' => '11',
                    'food_name' => 'Filete de Salmón a la Plancha',
                    'food_description' => 'Per 100g - Calories: 206kcal | Fat: 12.00g | Carbs: 0.00g | Protein: 22.00g'
                ],
                [
                    'food_id' => '12',
                    'food_name' => 'Atún en Lata al Agua (Drenado)',
                    'food_description' => 'Per 100g - Calories: 116kcal | Fat: 0.80g | Carbs: 0.00g | Protein: 26.00g'
                ],
                [
                    'food_id' => '13',
                    'food_name' => 'Pechuga de Pavo Cocida',
                    'food_description' => 'Per 100g - Calories: 135kcal | Fat: 1.00g | Carbs: 0.00g | Protein: 30.00g'
                ],
                [
                    'food_id' => '14',
                    'food_name' => 'Clara de Huevo',
                    'food_description' => 'Per 100g - Calories: 52kcal | Fat: 0.20g | Carbs: 0.70g | Protein: 11.00g'
                ],
                [
                    'food_id' => '15',
                    'food_name' => 'Pan Integral (Rebanada)',
                    'food_description' => 'Per 1 slice (30g) - Calories: 75kcal | Fat: 1.00g | Carbs: 13.00g | Protein: 3.50g'
                ],
                [
                    'food_id' => '16',
                    'food_name' => 'Pan Blanco (Rebanada)',
                    'food_description' => 'Per 1 slice (25g) - Calories: 67kcal | Fat: 0.80g | Carbs: 12.50g | Protein: 2.0g'
                ],
                [
                    'food_id' => '17',
                    'food_name' => 'Yogur Griego Natural (Sin Grasa)',
                    'food_description' => 'Per 100g - Calories: 59kcal | Fat: 0.40g | Carbs: 3.60g | Protein: 10.00g'
                ],
                [
                    'food_id' => '18',
                    'food_name' => 'Queso Cottage (Bajo en Grasa)',
                    'food_description' => 'Per 100g - Calories: 82kcal | Fat: 2.30g | Carbs: 3.40g | Protein: 11.00g'
                ],
                [
                    'food_id' => '19',
                    'food_name' => 'Queso Fresco',
                    'food_description' => 'Per 100g - Calories: 299kcal | Fat: 24.00g | Carbs: 3.00g | Protein: 18.00g'
                ],
                [
                    'food_id' => '20',
                    'food_name' => 'Palta / Aguacate (Hass)',
                    'food_description' => 'Per 100g - Calories: 160kcal | Fat: 15.00g | Carbs: 9.00g | Protein: 2.00g'
                ],
                [
                    'food_id' => '21',
                    'food_name' => 'Almendras',
                    'food_description' => 'Per 100g - Calories: 579kcal | Fat: 50.00g | Carbs: 22.00g | Protein: 21.00g'
                ],
                [
                    'food_id' => '22',
                    'food_name' => 'Nueces',
                    'food_description' => 'Per 100g - Calories: 654kcal | Fat: 65.00g | Carbs: 14.00g | Protein: 15.00g'
                ],
                [
                    'food_id' => '23',
                    'food_name' => 'Maní / Cacahuates',
                    'food_description' => 'Per 100g - Calories: 567kcal | Fat: 49.00g | Carbs: 16.00g | Protein: 26.00g'
                ],
                [
                    'food_id' => '24',
                    'food_name' => 'Aceite de Oliva Extra Virgen',
                    'food_description' => 'Per 1 tbsp (15ml) - Calories: 119kcal | Fat: 13.50g | Carbs: 0.00g | Protein: 0.00g'
                ],
                [
                    'food_id' => '25',
                    'food_name' => 'Espinaca Fresca',
                    'food_description' => 'Per 100g - Calories: 23kcal | Fat: 0.40g | Carbs: 3.60g | Protein: 2.90g'
                ],
                [
                    'food_id' => '26',
                    'food_name' => 'Brócoli al Vapor',
                    'food_description' => 'Per 100g - Calories: 35kcal | Fat: 0.40g | Carbs: 7.00g | Protein: 2.40g'
                ],
                [
                    'food_id' => '27',
                    'food_name' => 'Zanahoria Cruda',
                    'food_description' => 'Per 100g - Calories: 41kcal | Fat: 0.20g | Carbs: 10.00g | Protein: 0.90g'
                ],
                [
                    'food_id' => '28',
                    'food_name' => 'Papa / Patata Cocida',
                    'food_description' => 'Per 100g - Calories: 87kcal | Fat: 0.10g | Carbs: 20.00g | Protein: 1.90g'
                ],
                [
                    'food_id' => '29',
                    'food_name' => 'Camote / Batata Dulce Cocida',
                    'food_description' => 'Per 100g - Calories: 86kcal | Fat: 0.10g | Carbs: 20.00g | Protein: 1.60g'
                ],
                [
                    'food_id' => '30',
                    'food_name' => 'Lentejas Cocidas',
                    'food_description' => 'Per 100g - Calories: 116kcal | Fat: 0.40g | Carbs: 20.00g | Protein: 9.00g'
                ],
                [
                    'food_id' => '31',
                    'food_name' => 'Garbanzos Cocidos',
                    'food_description' => 'Per 100g - Calories: 164kcal | Fat: 2.60g | Carbs: 27.00g | Protein: 8.90g'
                ],
                [
                    'food_id' => '32',
                    'food_name' => 'Frijoles Negros Cocidos',
                    'food_description' => 'Per 100g - Calories: 132kcal | Fat: 0.50g | Carbs: 23.00g | Protein: 8.90g'
                ],
                [
                    'food_id' => '33',
                    'food_name' => 'Proteína de Suero (Whey Protein)',
                    'food_description' => 'Per 1 scoop (30g) - Calories: 120kcal | Fat: 1.50g | Carbs: 3.00g | Protein: 24.00g'
                ],
                [
                    'food_id' => '34',
                    'food_name' => 'Plátano Macho Cocido',
                    'food_description' => 'Per 100g - Calories: 115kcal | Fat: 0.20g | Carbs: 31.00g | Protein: 0.90g'
                ],
                [
                    'food_id' => '35',
                    'food_name' => 'Manzana Verde',
                    'food_description' => 'Per 100g - Calories: 52kcal | Fat: 0.20g | Carbs: 14.00g | Protein: 0.30g'
                ],
                [
                    'food_id' => '36',
                    'food_name' => 'Fresa / Frutilla',
                    'food_description' => 'Per 100g - Calories: 32kcal | Fat: 0.30g | Carbs: 7.70g | Protein: 0.70g'
                ]
            ];
            
            if (!function_exists('php_strip_accents')) {
                function php_strip_accents($str) {
                    $accents = ['á'=>'a', 'é'=>'e', 'í'=>'i', 'ó'=>'o', 'ú'=>'u', 'ñ'=>'n', 'ü'=>'u', 'Á'=>'A', 'É'=>'E', 'Í'=>'I', 'Ó'=>'O', 'Ú'=>'U', 'Ñ'=>'N', 'Ü'=>'U'];
                    return strtr($str, $accents);
                }
            }
            
            $filteredMock = [];
            $cleanQuery = strtolower(php_strip_accents($query));
            foreach ($mockFoods as $f) {
                $cleanName = strtolower(php_strip_accents($f['food_name']));
                if (strpos($cleanName, $cleanQuery) !== false) {
                    $filteredMock[] = $f;
                }
            }
            
            echo json_encode([
                'success' => true,
                'foods' => $filteredMock,
                'fallback' => true
            ]);
            exit;
        }
        
        $foodResults = $res['foods_search']['results']['food'];
        if (isset($foodResults['food_id'])) {
            $foodResults = [$foodResults];
        }
        
        echo json_encode([
            'success' => true,
            'foods' => $foodResults,
            'fallback' => false
        ]);
        exit;
    }

    if ($_GET['ajax'] === 'add_food') {
        $section = $_POST['section'] ?? '';
        $name = trim($_POST['name'] ?? '');
        $carbs = floatval($_POST['carbs'] ?? 0);
        $proteins = floatval($_POST['proteins'] ?? 0);
        $fats = floatval($_POST['fats'] ?? 0);
        
        if (empty($name)) {
            echo json_encode(['success' => false, 'error' => 'El nombre del alimento es requerido.']);
            exit;
        }

        $kcal = ($carbs * 4) + ($proteins * 4) + ($fats * 9);
        
        $food = [
            'name' => $name,
            'carbs' => $carbs,
            'proteins' => $proteins,
            'fats' => $fats,
            'kcal' => round($kcal)
        ];

        $newFood = db_add_meal($username, $date, $section, $food);
        echo json_encode(['success' => true, 'food' => $newFood]);
        exit;
    } elseif ($_GET['ajax'] === 'delete_food') {
        $section = $_POST['section'] ?? '';
        $foodId = $_POST['id'] ?? '';
        
        $res = db_delete_meal($username, $date, $section, $foodId);
        echo json_encode(['success' => $res]);
        exit;
    } elseif ($_GET['ajax'] === 'update_weight') {
        $weight = floatval($_POST['weight'] ?? 0);
        if ($weight > 0) {
            $newUserData = db_log_weight($username, $weight);
            echo json_encode([
                'success' => true, 
                'profile' => $newUserData['profile'], 
                'weight_history' => $newUserData['weight_history']
            ]);
            exit;
        }
        echo json_encode(['success' => false, 'error' => 'Por favor introduce un peso válido.']);
        exit;
    }
    exit;
}

// Procesar Cierre de Sesión
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header('Location: index.php');
    exit;
}

// Cargar estado de la vista
$isLoggedIn = isset($_SESSION['username']);
$username = $isLoggedIn ? $_SESSION['username'] : '';
$userData = $isLoggedIn ? db_get_user_data($username) : null;
$hasProfile = ($userData && $userData['profile'] !== null);

$users = db_load_users();
$userRecord = $isLoggedIn && isset($users[$username]) ? $users[$username] : null;
$initial = $isLoggedIn ? strtoupper(substr($username, 0, 1)) : '';
$default_avatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23ff2a2a'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Outfit, sans-serif' font-size='50' font-weight='800'>{$initial}</text></svg>";
$avatar = ($userRecord && !empty($userRecord['avatar']) && file_exists(__DIR__ . '/' . $userRecord['avatar'])) ? $userRecord['avatar'] : $default_avatar;

// Si tiene perfil, pre-calcular valores para hoy
$today_kcal = 0;
$today_carbs = 0;
$today_proteins = 0;
$today_fats = 0;
$meals_today = [];

if ($hasProfile) {
    $date_today = date('Y-m-d');
    $meals_today = isset($userData['meals'][$date_today]) ? $userData['meals'][$date_today] : [
        'desayuno' => [],
        'almuerzo' => [],
        'merienda' => [],
        'agregar_comidas' => []
    ];
    
    // Sumar consumos
    foreach ($meals_today as $sec => $foods) {
        foreach ($foods as $food) {
            $today_kcal += $food['kcal'];
            $today_carbs += $food['carbs'];
            $today_proteins += $food['proteins'];
            $today_fats += $food['fats'];
        }
    }
    
    // Calcular semanas estimadas
    $profile = $userData['profile'];
    $weight_diff = abs($profile['weight'] - $profile['target_weight']);
    if ($weight_diff < 0.1) {
        $timeline_msg = "¡Estás en tu peso objetivo! Mantén tus calorías actuales.";
    } else {
        // Pérdida o ganancia semanal basada en 400 kcal/día = 2800 kcal/semana.
        // 1 kg = 7700 kcal. 2800 / 7700 = 0.3636 kg por semana.
        $kg_per_week = 0.3636;
        $weeks = round($weight_diff / $kg_per_week, 1);
        $goal_action = ($profile['goal'] === 'perdida_peso' || $profile['goal'] === 'definicion') ? 'perder' : 'ganar';
        $timeline_msg = "Lograrás tu meta de <span>" . htmlspecialchars($profile['target_weight']) . " " . htmlspecialchars($profile['unit_weight']) . "</span> en aproximadamente <span>" . $weeks . " semanas</span> (tasa saludable de ~0.4 kg por semana).";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrena Con Max - Dashboard Virtual</title>
    <!-- Google Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Stylesheet -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="bg-glow" id="bgGlow"></div>

    <!-- Navegación -->
    <header id="header">
        <div class="container navbar">
            <a href="index.php" class="logo">
                <span>ENTRENA CON</span> MAX
            </a>
            
            <div class="menu-toggle" id="mobileMenu">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <ul class="nav-links" id="navLinks">
                <li><a href="index.php">Inicio</a></li>
                <?php if ($isLoggedIn && $hasProfile): ?>
                    <li><a href="app.php" class="active">Calorías</a></li>
                    <li><a href="routines.php">Rutinas</a></li>
                    <li><a href="config.php">Configuración</a></li>
                    <li>
                        <a href="config.php" class="nav-avatar-container" title="Configuración de Perfil">
                            <img src="<?= $avatar ?>" class="nav-avatar" alt="Avatar">
                        </a>
                    </li>
                <?php elseif ($isLoggedIn): ?>
                    <li><a href="config.php" class="btn-header">Configuración</a></li>
                <?php else: ?>
                    <li><a href="app.php" class="btn-header">Iniciar Sesión</a></li>
                <?php endif; ?>
            </ul>
        </div>
    </header>

    <?php if (!$isLoggedIn): ?>
        <!-- PANTALLA DE INICIAR SESIÓN / REGISTRARSE -->
        <div class="auth-page">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="logo"><span>ENTRENA CON</span> MAX</div>
                    <p>Ingresa tus credenciales para acceder al Gimnasio Virtual.</p>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="switchAuthTab('login')">Iniciar Sesión</button>
                    <button class="auth-tab" onclick="switchAuthTab('register')">Registrar</button>
                </div>

                <?php if (!empty($auth_error)): ?>
                    <div class="auth-alert error"><?= htmlspecialchars($auth_error) ?></div>
                <?php endif; ?>
                <?php if (!empty($auth_success)): ?>
                    <div class="auth-alert success"><?= htmlspecialchars($auth_success) ?></div>
                <?php endif; ?>

                <!-- Formulario Login -->
                <form action="app.php" method="POST" class="auth-form active" id="loginForm">
                    <input type="hidden" name="action" value="login">
                    <div class="form-group">
                        <label for="login_user">Nombre de Usuario</label>
                        <input type="text" id="login_user" name="username" class="form-control" placeholder="Introduce tu usuario" required>
                    </div>
                    <div class="form-group">
                        <label for="login_pass">Contraseña</label>
                        <input type="password" id="login_pass" name="password" class="form-control" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">
                        Entrar a la Plataforma
                    </button>
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <button type="button" class="btn-secondary" style="width: 100%; font-size: 0.95rem; display: flex; justify-content: center; align-items: center;" onclick="switchAuthTab('register')">
                            ¿No tienes cuenta? Regístrate
                        </button>
                    </div>
                </form>

                <!-- Formulario Registro -->
                <form action="app.php" method="POST" class="auth-form" id="registerForm">
                    <input type="hidden" name="action" value="register">
                    <div class="form-group">
                        <label for="reg_user">Nombre de Usuario</label>
                        <input type="text" id="reg_user" name="username" class="form-control" placeholder="Elige tu nombre de usuario" required>
                    </div>
                    <div class="form-group">
                        <label for="reg_email">Correo Electrónico</label>
                        <input type="email" id="reg_email" name="email" class="form-control" placeholder="tucorreo@ejemplo.com" required>
                    </div>
                    <div class="form-group">
                        <label for="reg_pass">Contraseña</label>
                        <input type="password" id="reg_pass" name="password" class="form-control" placeholder="Crea una contraseña segura" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">
                        Crear Cuenta Nueva
                    </button>
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <button type="button" class="btn-secondary" style="width: 100%; font-size: 0.95rem; display: flex; justify-content: center; align-items: center;" onclick="switchAuthTab('login')">
                            ¿Ya tienes cuenta? Inicia Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>

    <?php elseif (!$hasProfile): ?>
        <!-- FORMULARIO DE ONBOARDING -->
        <div class="onboarding-page">
            <div class="onboarding-card">
                <div class="onboarding-header">
                    <h2>Configura tu Perfil</h2>
                    <p>Cuéntanos sobre ti para calibrar tus macros y calorías con precisión científica.</p>
                </div>

                <div class="onboarding-progress">
                    <div class="progress-dot active" id="dot1"></div>
                    <div class="progress-dot" id="dot2"></div>
                    <div class="progress-dot" id="dot3"></div>
                </div>

                <form action="app.php" method="POST" id="onboardingForm">
                    <input type="hidden" name="action" value="onboarding">

                    <!-- PASO 1: Datos Fisiológicos -->
                    <div class="step-container active" id="step1">
                        <h3 style="margin-bottom: 1.5rem;">Datos Fisiológicos</h3>
                        
                        <div class="step-grid">
                            <div>
                                <label style="display:block; margin-bottom: 0.5rem; font-weight:700;">GÉNERO BIOLÓGICO</label>
                                <div class="step-options-grid" style="grid-template-columns: 1fr 1fr;">
                                    <label class="option-card selected" id="genderMaleCard">
                                        <input type="radio" name="gender" value="male" checked onclick="selectOption('gender', 'MaleCard')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        <span class="option-card-title">Masculino</span>
                                    </label>
                                    <label class="option-card" id="genderFemaleCard">
                                        <input type="radio" name="gender" value="female" onclick="selectOption('gender', 'FemaleCard')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-3-3.87"></path><path d="M9 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M9 3.13a4 4 0 0 0 0 7.75"></path></svg>
                                        <span class="option-card-title">Femenino</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                                    <label style="font-weight:700;">EDAD</label>
                                </div>
                                <input type="number" name="age" class="form-control" placeholder="Años" min="10" max="100" required style="height: 60px; font-size: 1.2rem;">
                            </div>
                        </div>

                        <div class="step-grid" style="margin-top: 2rem;">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                                    <label style="font-weight:700;">PESO ACTUAL</label>
                                    <div class="unit-toggle-group">
                                        <button type="button" class="unit-btn active" id="unitWeightKg" onclick="setUnit('weight', 'kg')">KG</button>
                                        <button type="button" class="unit-btn" id="unitWeightLbs" onclick="setUnit('weight', 'lbs')">LBS</button>
                                    </div>
                                    <input type="hidden" name="unit_weight" id="unit_weight_input" value="kg">
                                </div>
                                <input type="number" step="0.1" name="weight" id="weight_input" class="form-control" placeholder="Valor" required style="height: 60px; font-size: 1.2rem;">
                            </div>

                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                                    <label style="font-weight:700;">ESTATURA</label>
                                    <div class="unit-toggle-group">
                                        <button type="button" class="unit-btn active" id="unitHeightCm" onclick="setUnit('height', 'cm')">CM</button>
                                        <button type="button" class="unit-btn" id="unitHeightIn" onclick="setUnit('height', 'in')">IN</button>
                                    </div>
                                    <input type="hidden" name="unit_height" id="unit_height_input" value="cm">
                                </div>
                                <input type="number" step="0.1" name="height" id="height_input" class="form-control" placeholder="Valor" required style="height: 60px; font-size: 1.2rem;">
                            </div>
                        </div>
                    </div>

                    <!-- PASO 2: Objetivos de Rendimiento -->
                    <div class="step-container" id="step2">
                        <h3 style="margin-bottom: 1.5rem;">Tus Objetivos</h3>
                        
                        <label style="display:block; margin-bottom: 0.5rem; font-weight:700;">SELECCIONA TU META</label>
                        <div class="step-options-grid">
                            <label class="option-card selected" id="goalPerdidaCard">
                                <input type="radio" name="goal" value="perdida_peso" checked onclick="selectOption('goal', 'PerdidaCard'); updateActivityTexts();">
                                <span class="option-card-title">Perder Grasa</span>
                                <span class="option-card-desc">Reducción de grasa corporal conservando músculo.</span>
                            </label>
                            <label class="option-card" id="goalSubidaCard">
                                <input type="radio" name="goal" value="subida_peso" onclick="selectOption('goal', 'SubidaCard'); updateActivityTexts();">
                                <span class="option-card-title">Ganar Músculo</span>
                                <span class="option-card-desc">Ganancia de tejido magro y fuerza.</span>
                            </label>
                            <label class="option-card" id="goalDefinicionCard">
                                <input type="radio" name="goal" value="definicion" onclick="selectOption('goal', 'DefinicionCard'); updateActivityTexts();">
                                <span class="option-card-title">Definición</span>
                                <span class="option-card-desc">Focalizado en cortes musculares máximos.</span>
                            </label>
                            <label class="option-card" id="goalMantenimientoCard">
                                <input type="radio" name="goal" value="mantenimiento" onclick="selectOption('goal', 'MantenimientoCard'); updateActivityTexts();">
                                <span class="option-card-title">Mantenimiento</span>
                                <span class="option-card-desc">Mantener tu composición corporal actual.</span>
                            </label>
                            <label class="option-card" id="goalDeportivoCard">
                                <input type="radio" name="goal" value="deportivo" onclick="selectOption('goal', 'DeportivoCard'); updateActivityTexts();">
                                <span class="option-card-title">Deportivo</span>
                                <span class="option-card-desc">Aumento de energía para atletas de alto rendimiento.</span>
                            </label>
                        </div>

                        <div class="step-grid" style="margin-top: 2rem;">
                            <div>
                                <label style="display:block; margin-bottom: 0.5rem; font-weight:700;">PESO OBJETIVO</label>
                                <input type="number" step="0.1" name="target_weight" class="form-control" placeholder="Meta" required style="height: 60px; font-size: 1.2rem;">
                            </div>
                            <div>
                                <label style="display:block; margin-bottom: 0.5rem; font-weight:700;">GRASA CORPORAL ESTIMADA</label>
                                <select name="body_fat" class="form-control" style="height: 60px; font-size: 1.1rem; background-color: var(--bg-secondary);">
                                    <option value="1-4%">1 - 4% (Esencial)</option>
                                    <option value="5-7%">5 - 7% (Extremo)</option>
                                    <option value="8-10%">8 - 10% (Definido)</option>
                                    <option value="11-12%">11 - 12% (Atlético)</option>
                                    <option value="13-15%" selected>13 - 15% (Saludable)</option>
                                    <option value="16-19%">16 - 19% (Normal)</option>
                                    <option value="20-24%">20 - 24% (Moderado)</option>
                                    <option value="25-30%">25 - 30% (Elevado)</option>
                                    <option value="35-40%">35 - 40% (Sobrepeso)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- PASO 3: Nivel de Actividad Física -->
                    <div class="step-container" id="step3">
                        <h3 style="margin-bottom: 1.5rem;">Tu Actividad Física</h3>
                        
                        <label style="display:block; margin-bottom: 0.5rem; font-weight:700;">NIVEL DE ACTIVIDAD DIARIA</label>
                        <div class="step-options-grid" style="grid-template-columns: 1fr 1fr;">
                            <label class="option-card selected" id="activityBajoCard">
                                <input type="radio" name="activity" value="bajo" checked onclick="selectOption('activity', 'BajoCard')">
                                <span class="option-card-title" style="color:var(--primary);">Bajo (x1.2)</span>
                                <span class="option-card-desc" id="actBajoDesc">Trabajo de escritorio, menos de 5,000 pasos al día. No entrena.</span>
                            </label>
                            <label class="option-card" id="activityModeradoCard">
                                <input type="radio" name="activity" value="moderado" onclick="selectOption('activity', 'ModeradoCard')">
                                <span class="option-card-title" style="color:var(--primary);">Moderado (x1.375)</span>
                                <span class="option-card-desc" id="actModeradoDesc">3-4 días de caminatas o cardio ligero + actividades comunes.</span>
                            </label>
                            <label class="option-card" id="activityAltoCard">
                                <input type="radio" name="activity" value="alto" onclick="selectOption('activity', 'AltoCard')">
                                <span class="option-card-title" style="color:var(--primary);">Alto (x1.55)</span>
                                <span class="option-card-desc" id="actAltoDesc">5+ días de ejercicio (Cardio combinado con circuitos de fuerza).</span>
                            </label>
                            <label class="option-card" id="activityMuyAltoCard">
                                <input type="radio" name="activity" value="muy_alto" onclick="selectOption('activity', 'MuyAltoCard')">
                                <span class="option-card-title" style="color:var(--primary);">Muy Alto (x1.725)</span>
                                <span class="option-card-desc" id="actMuyAltoDesc">Atletas, entrenamientos dobles diarios o trabajo físico pesado.</span>
                            </label>
                        </div>
                    </div>

                    <!-- Botones de Control de Navegación -->
                    <div class="onboarding-buttons">
                        <button type="button" class="btn-secondary" id="btnPrev" onclick="moveStep(-1)" style="visibility: hidden;">Anterior</button>
                        <button type="button" class="btn-primary" id="btnNext" onclick="moveStep(1)">Siguiente</button>
                    </div>
                </form>
            </div>
        </div>

    <?php else: ?>
        <!-- DASHBOARD PRINCIPAL -->
        <div class="container dashboard-layout">
            <div class="dashboard-header">
                <div>
                    <h2 class="text-gradient" style="font-size: 2.2rem; text-transform: uppercase;">BIENVENIDO, <?= htmlspecialchars(strtoupper($username)) ?></h2>
                    <p style="color: var(--text-secondary); margin-top: 0.3rem;">Aquí tienes el control de tu nutrición de hoy.</p>
                </div>
                <div>
                    <span style="font-size: 0.95rem; font-weight:700; color: var(--text-muted);">
                        FECHA: <?= date('d/m/Y') ?>
                    </span>
                </div>
            </div>

            <!-- Grilla Principal -->
            <div class="dashboard-grid">
                <!-- Columna Izquierda: Círculo de Calorías y Macronutrientes -->
                <div class="panel-card">
                    <h3>Calorías Diarias</h3>

                    <?php if ($profile['is_capped']): ?>
                        <div class="capped-alert">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top: 2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            <span><strong>Límite de seguridad activo:</strong> Tu meta calórica ha sido ajustada al mínimo biológico saludable (<?= ($profile['gender'] === 'female') ? '1,200' : '1,500' ?> kcal) para prevenir la desnutrición.</span>
                        </div>
                    <?php endif; ?>

                    <div class="calorie-circle-container">
                        <svg class="calorie-svg">
                            <circle class="calorie-bg-circle" cx="130" cy="130" r="110" />
                            <circle class="calorie-progress-circle" id="calorieProgress" cx="130" cy="130" r="110" stroke-dasharray="691.15" stroke-dashoffset="691.15" />
                        </svg>
                        <div class="calorie-circle-text">
                            <div class="calorie-val" id="consumedKcal"><?= $today_kcal ?></div>
                            <div class="calorie-lbl">Consumidas</div>
                            <div class="calorie-goal">Meta: <span id="goalKcal"><?= $profile['target_calories'] ?></span> kcal</div>
                        </div>
                    </div>

                    <!-- Macronutrientes -->
                    <div class="macros-grid">
                        <!-- Proteínas -->
                        <div class="macro-bar-container">
                            <div class="macro-bar-header">
                                <div class="macro-label"><span class="macro-dot prot"></span>Proteína</div>
                                <div class="macro-text-vals"><span id="currProt"><?= round($today_proteins, 1) ?></span> / <span id="goalProt"><?= $profile['macros']['protein_g'] ?></span>g</div>
                            </div>
                            <div class="macro-bar-track">
                                <div class="macro-bar-fill prot" id="barProt"></div>
                            </div>
                        </div>
                        
                        <!-- Carbohidratos -->
                        <div class="macro-bar-container">
                            <div class="macro-bar-header">
                                <div class="macro-label"><span class="macro-dot carb"></span>Carbohidratos</div>
                                <div class="macro-text-vals"><span id="currCarb"><?= round($today_carbs, 1) ?></span> / <span id="goalCarb"><?= $profile['macros']['carb_g'] ?></span>g</div>
                            </div>
                            <div class="macro-bar-track">
                                <div class="macro-bar-fill carb" id="barCarb"></div>
                            </div>
                        </div>

                        <!-- Grasas -->
                        <div class="macro-bar-container">
                            <div class="macro-bar-header">
                                <div class="macro-label"><span class="macro-dot fat"></span>Grasas</div>
                                <div class="macro-text-vals"><span id="currFat"><?= round($today_fats, 1) ?></span> / <span id="goalFat"><?= $profile['macros']['fat_g'] ?></span>g</div>
                            </div>
                            <div class="macro-bar-track">
                                <div class="macro-bar-fill fat" id="barFat"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline -->
                    <div class="timeline-card">
                        <div class="timeline-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div class="timeline-text">
                            <h4>Línea de Tiempo</h4>
                            <p id="timelineMessage"><?= $timeline_msg ?></p>
                        </div>
                    </div>
                </div>

                <!-- Columna Derecha: Seguimiento de Peso e Historial -->
                <div class="panel-card">
                    <h3>Seguimiento Físico</h3>
                    
                    <div class="weight-tracker-wrapper">
                        <!-- Input de Peso -->
                        <div class="weight-input-box">
                            <div>
                                <h4 style="font-size: 1.05rem; margin-bottom: 0.2rem;">Actualizar Peso Semanal</h4>
                                <p style="font-size: 0.8rem; color: var(--text-muted);">Las calorías diarias se reajustarán automáticamente al variar tu peso.</p>
                            </div>
                            <form class="weight-input-form" onsubmit="updateWeight(event)">
                                <input type="number" step="0.1" id="newWeightVal" class="form-control" placeholder="<?= $profile['unit_weight'] ?>" required>
                                <button type="submit" class="btn-primary" style="padding: 0.8rem 1.2rem; font-size: 0.95rem;">Log</button>
                            </form>
                        </div>

                        <!-- Gráfico SVG -->
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: -1rem;">
                            <h4 style="font-size: 1rem; color: var(--text-secondary);">Evolución de Peso (<?= strtoupper($profile['unit_weight']) ?>)</h4>
                        </div>
                        <div class="weight-chart-container">
                            <svg class="weight-chart-svg" id="weightChartSvg" viewBox="0 0 500 200">
                                <!-- Las líneas del gráfico serán cargadas por Javascript dinámicamente -->
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Actividades de GETD -->
            <div class="activity-table-wrapper">
                <h3>Tasa de Actividad Física Diaria (GETD)</h3>
                <div class="activity-table-container">
                    <table class="activity-table">
                        <thead>
                            <tr>
                                <th>Nivel de Actividad</th>
                                <th>Si el objetivo es: Perder Peso</th>
                                <th>Si el objetivo es: Ganar Músculo</th>
                                <th>Multiplicador (GETD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr id="rowActBajo" class="<?= ($profile['activity'] === 'bajo') ? 'active-row' : '' ?>">
                                <td>Bajo <span class="activity-badge">x1.2</span></td>
                                <td>Trabajo de escritorio, menos de 5,000 pasos al día. No entrena.</td>
                                <td>Trabajo de escritorio, sin estímulo de fuerza actual.</td>
                                <td>x 1.2</td>
                            </tr>
                            <tr id="rowActModerado" class="<?= ($profile['activity'] === 'moderado') ? 'active-row' : '' ?>">
                                <td>Moderado <span class="activity-badge">x1.375</span></td>
                                <td>3-4 días de caminatas o cardio ligero + actividades diarias comunes.</td>
                                <td>3 días de entrenamiento de fuerza enfocado (Rutina de cuerpo completo).</td>
                                <td>x 1.375</td>
                            </tr>
                            <tr id="rowActAlto" class="<?= ($profile['activity'] === 'alto') ? 'active-row' : '' ?>">
                                <td>Alto <span class="activity-badge">x1.55</span></td>
                                <td>5+ días de ejercicio (Cardio combinado con circuitos de fuerza).</td>
                                <td>4-5 días de entrenamiento de fuerza intenso (Rutinas divididas por músculos).</td>
                                <td>x 1.55</td>
                            </tr>
                            <tr id="rowActMuyAlto" class="<?= ($profile['activity'] === 'muy_alto') ? 'active-row' : '' ?>">
                                <td>Muy Alto <span class="activity-badge">x1.725</span></td>
                                <td>Atletas, entrenamientos dobles diarios o trabajo físico muy pesado.</td>
                                <td>Atletas de fuerza o culturistas en fases de volumen de alta demanda.</td>
                                <td>x 1.725</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SECCIONES DE COMIDAS (Desayuno, Almuerzo, Merienda, Agregar Comidas) -->
            <div class="meals-section-header">
                <h3 style="font-size: 1.6rem; border: none; padding: 0;">Distribución de Comidas</h3>
            </div>
            
            <div class="meals-grid">
                <!-- Desayuno -->
                <div class="meal-card" id="cardDesayuno">
                    <div class="meal-card-header">
                        <div class="meal-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            Desayuno
                        </div>
                        <div class="meal-total-kcal"><span id="kcalValDesayuno">0</span> kcal</div>
                    </div>
                    <ul class="meal-food-list" id="listDesayuno">
                        <!-- Cargados dinámicamente -->
                    </ul>
                    <button class="btn-add-food-trigger" onclick="openAddFoodModal('desayuno')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Agregar alimento
                    </button>
                </div>

                <!-- Almuerzo -->
                <div class="meal-card" id="cardAlmuerzo">
                    <div class="meal-card-header">
                        <div class="meal-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            Almuerzo
                        </div>
                        <div class="meal-total-kcal"><span id="kcalValAlmuerzo">0</span> kcal</div>
                    </div>
                    <ul class="meal-food-list" id="listAlmuerzo">
                        <!-- Cargados dinámicamente -->
                    </ul>
                    <button class="btn-add-food-trigger" onclick="openAddFoodModal('almuerzo')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Agregar alimento
                    </button>
                </div>

                <!-- Merienda -->
                <div class="meal-card" id="cardMerienda">
                    <div class="meal-card-header">
                        <div class="meal-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            Merienda
                        </div>
                        <div class="meal-total-kcal"><span id="kcalValMerienda">0</span> kcal</div>
                    </div>
                    <ul class="meal-food-list" id="listMerienda">
                        <!-- Cargados dinámicamente -->
                    </ul>
                    <button class="btn-add-food-trigger" onclick="openAddFoodModal('merienda')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Agregar alimento
                    </button>
                </div>

                <!-- Agregar Comidas (Comodín) -->
                <div class="meal-card" id="cardAgregarComidas">
                    <div class="meal-card-header">
                        <div class="meal-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            Agregar Comidas
                        </div>
                        <div class="meal-total-kcal"><span id="kcalValAgregarComidas">0</span> kcal</div>
                    </div>
                    <ul class="meal-food-list" id="listAgregarComidas">
                        <!-- Cargados dinámicamente -->
                    </ul>
                    <button class="btn-add-food-trigger" onclick="openAddFoodModal('agregar_comidas')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Agregar alimento
                    </button>
                </div>
            </div>

            <!-- Disclaimer legal en el Dashboard -->
            <div class="legal-disclaimer">
                <strong>Aviso Legal (Disclaimer):</strong> Los cálculos calóricos y macronutrientes recomendados en esta aplicación web son solo una guía informativa basada en fórmulas estándar del sector deportivo. Esta información no reemplaza el consejo médico ni la guía personalizada de un nutricionista titulado. Realice cambios en su dieta y entrenamiento bajo su propio riesgo y supervisión.
            </div>
        </div>

        <!-- MODAL AGREGAR COMIDA -->
        <div class="modal" id="addFoodModal">
            <div class="modal-backdrop" onclick="closeAddFoodModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitleText" style="margin-bottom:0;">Agregar Alimento</h3>
                    <button class="btn-modal-close" onclick="closeAddFoodModal()">&times;</button>
                </div>
                <form id="addFoodForm" onsubmit="submitFood(event)">
                    <input type="hidden" name="section" id="modalSectionInput">
                    
                    <!-- Campo de búsqueda -->
                    <div class="form-group" style="position: relative;">
                        <label for="food_search">Buscar Alimento (API FatSecret)</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="food_search" class="form-control" placeholder="Escribe el alimento, ej: Plátano, Pollo..." oninput="debouncedSearchFoodAPI()">
                            <button type="button" class="btn-primary" onclick="searchFoodAPI()" style="padding: 0 1.2rem; font-size: 0.9rem;">Buscar</button>
                        </div>
                        <!-- Dropdown de resultados de búsqueda -->
                        <div id="food_search_results" class="search-results-dropdown" style="display: none;"></div>
                    </div>

                    <!-- Detalle del alimento seleccionado (oculto por defecto) -->
                    <div id="selected_food_detail" style="display: none; border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem;">
                        <h4 id="selected_food_name" style="color: white; margin-bottom: 0.5rem; font-size: 1.1rem; font-weight: 700;">Nombre del Alimento</h4>
                        <p id="selected_food_base_desc" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">Detalles base</p>
                        
                        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
                            <div class="form-group" style="margin: 0; flex: 1;">
                                <label for="food_quantity" id="quantity_label">Cantidad a consumir (g)</label>
                                <input type="number" step="1" id="food_quantity" class="form-control" value="100" oninput="recalculateSelectedMacros()">
                            </div>
                        </div>

                        <!-- Campos ocultos para enviar los valores calculados -->
                        <input type="hidden" id="food_name" name="name">
                        <input type="hidden" id="food_carbs" name="carbs">
                        <input type="hidden" id="food_proteins" name="proteins">
                        <input type="hidden" id="food_fats" name="fats">

                        <div style="background: rgba(0,0,0,0.3); border:1px solid var(--border); padding: 1rem; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-size:0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.2rem;">Macros de la Porción:</span>
                                <span style="font-size:0.85rem; color: var(--text-secondary); font-weight: 700;" id="modalMacrosCalc">P: 0g | C: 0g | G: 0g</span>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size:0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.2rem;">Calorías Totales:</span>
                                <span style="font-size:1.2rem; font-weight:800; color:var(--primary);" id="modalCalorieCalc">0 kcal</span>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeAddFoodModal()">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar Alimento</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Transferir datos de PHP a JS para el cargado dinámico -->
        <script>
            window.userDataMeals = <?= json_encode($meals_today) ?>;
            window.userWeightHistory = <?= json_encode($userData['weight_history']) ?>;
            window.userUnitWeight = <?= json_encode($profile['unit_weight']) ?>;
        </script>
    <?php endif; ?>

    <!-- Footer -->
    <footer style="margin-top: 5rem;">
        <div class="container">
            <p>&copy; <?= date('Y') ?> Entrena Con Max. Todos los derechos reservados. Diseñado para optimizar tu rendimiento.</p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="js/app.js"></script>
</body>
</html>
