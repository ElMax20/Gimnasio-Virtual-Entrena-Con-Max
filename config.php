<?php
// config.php - Configuración de Perfil de Usuario
session_start();
require_once 'db_helper.php';

// Redireccionar si no ha iniciado sesión
if (!isset($_SESSION['username'])) {
    header('Location: app.php');
    exit;
}

$oldUsername = $_SESSION['username'];
$users = db_load_users();
$userRecord = isset($users[$oldUsername]) ? $users[$oldUsername] : null;

if (!$userRecord) {
    header('Location: app.php?action=logout');
    exit;
}

$currentEmail = isset($userRecord['email']) ? $userRecord['email'] : '';
$initial = strtoupper(substr($oldUsername, 0, 1));
$default_avatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23ff2a2a'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Outfit, sans-serif' font-size='50' font-weight='800'>{$initial}</text></svg>";
$avatar = ($userRecord && !empty($userRecord['avatar']) && file_exists(__DIR__ . '/' . $userRecord['avatar'])) ? $userRecord['avatar'] : $default_avatar;

$config_error = '';
$config_success = '';

// Procesar Formulario de Configuración
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newUsername = $_POST['username'] ?? '';
    $newEmail = $_POST['email'] ?? '';
    
    $avatarPath = null;
    $uploadOk = true;

    // Verificar si se subió un nuevo avatar
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['avatar']['tmp_name'];
        $fileName = $_FILES['avatar']['name'];
        $fileSize = $_FILES['avatar']['size'];
        $fileType = $_FILES['avatar']['type'];
        
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));
        
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (in_array($fileExtension, $allowedExtensions)) {
            // Validar tamaño máximo (2MB)
            if ($fileSize < 2 * 1024 * 1024) {
                $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
                $uploadFileDir = __DIR__ . '/uploads/';
                
                // Asegurar que la carpeta exista
                if (!file_exists($uploadFileDir)) {
                    mkdir($uploadFileDir, 0755, true);
                }
                
                $dest_path = $uploadFileDir . $newFileName;
                if (move_uploaded_file($fileTmpPath, $dest_path)) {
                    $avatarPath = 'uploads/' . $newFileName;
                    
                    // Borrar el avatar anterior si no es el default
                    if ($userRecord && !empty($userRecord['avatar']) && file_exists(__DIR__ . '/' . $userRecord['avatar'])) {
                        unlink(__DIR__ . '/' . $userRecord['avatar']);
                    }
                } else {
                    $config_error = 'Ocurrió un error al mover el archivo subido.';
                    $uploadOk = false;
                }
            } else {
                $config_error = 'El archivo es demasiado grande. El límite es de 2 MB.';
                $uploadOk = false;
            }
        } else {
            $config_error = 'Extensión de archivo no permitida. Solo JPG, JPEG, PNG, GIF y WEBP.';
            $uploadOk = false;
        }
    }

    if ($uploadOk) {
        $res = db_update_user_credentials($oldUsername, $newUsername, $newEmail, $avatarPath);
        if ($res['success']) {
            $config_success = $res['message'];
            $_SESSION['username'] = trim(strtolower($newUsername));
            // Actualizar variables de vista
            $oldUsername = $_SESSION['username'];
            $users = db_load_users();
            $userRecord = $users[$oldUsername];
            $currentEmail = $userRecord['email'];
            $initial = strtoupper(substr($oldUsername, 0, 1));
            $default_avatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23ff2a2a'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Outfit, sans-serif' font-size='50' font-weight='800'>{$initial}</text></svg>";
            $avatar = ($userRecord && !empty($userRecord['avatar']) && file_exists(__DIR__ . '/' . $userRecord['avatar'])) ? $userRecord['avatar'] : $default_avatar;
        } else {
            $config_error = $res['message'];
            // Si subió un avatar y falló la actualización del usuario, eliminar el archivo subido
            if ($avatarPath && file_exists(__DIR__ . '/' . $avatarPath)) {
                unlink(__DIR__ . '/' . $avatarPath);
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrena Con Max - Configuración de Perfil</title>
    <!-- Google Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Stylesheet -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Efecto resplandor de fondo -->
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
                <li><a href="app.php">Calorías</a></li>
                <li><a href="routines.php">Rutinas</a></li>
                <li><a href="config.php" class="active">Configuración</a></li>
                <li>
                    <a href="config.php" class="nav-avatar-container" title="Configuración de Perfil">
                        <img src="<?= $avatar ?>" class="nav-avatar" alt="Avatar">
                    </a>
                </li>
            </ul>
        </div>
    </header>

    <div class="container config-layout">
        <div class="config-card">
            <h2 class="text-gradient" style="font-size: 2rem; margin-bottom: 2rem; text-align: center; text-transform: uppercase;">
                Configurar Perfil
            </h2>

            <?php if (!empty($config_error)): ?>
                <div class="auth-alert error" style="display: block; margin-bottom: 2rem;">
                    <?= htmlspecialchars($config_error) ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($config_success)): ?>
                <div class="auth-alert success" style="display: block; margin-bottom: 2rem;">
                    <?= htmlspecialchars($config_success) ?>
                </div>
            <?php endif; ?>

            <form action="config.php" method="POST" enctype="multipart/form-data">
                <!-- Sección foto de perfil circular -->
                <div class="config-avatar-section">
                    <img src="<?= $avatar ?>" class="config-avatar-preview" id="avatarPreview" alt="Avatar Preview">
                    <label class="config-avatar-upload-btn">
                        Cambiar Imagen
                        <input type="file" name="avatar" id="avatarInput" accept="image/*" onchange="previewImage(event)">
                    </label>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Formatos aceptados: JPG, PNG, WEBP (Max. 2MB)</span>
                </div>

                <div class="form-group">
                    <label for="username">Nombre de Usuario</label>
                    <input type="text" id="username" name="username" class="form-control" value="<?= htmlspecialchars($oldUsername) ?>" required>
                </div>

                <div class="form-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" name="email" class="form-control" value="<?= htmlspecialchars($currentEmail) ?>" placeholder="Añade un correo para recuperación" required>
                </div>

                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 2rem; font-size: 1.05rem;">
                    Guardar Cambios
                </button>
            </form>
        </div>

        <div class="config-card" style="margin-top: 2rem; border-color: rgba(255, 42, 42, 0.2);">
            <h3 style="color: var(--primary); margin-bottom: 1rem; font-size: 1.2rem; font-weight: 700; border-left: 3px solid var(--primary); padding-left: 0.5rem; text-transform: uppercase;">
                Gestión de Cuenta
            </h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5;">
                ¿Deseas cerrar tu sesión actual en este dispositivo? Podrás volver a entrar con tus credenciales.
            </p>
            <a href="app.php?action=logout" class="btn-secondary" style="border-color: var(--primary); color: var(--primary); display: inline-flex; width: auto; padding: 0.6rem 1.5rem; justify-content: center; font-weight: 700; text-decoration: none; border-radius: 6px; transition: var(--transition);">
                Cerrar Sesión
            </a>
        </div>
    </div>

    <!-- Footer -->
    <footer>
        <div class="container">
            <p>&copy; <?= date('Y') ?> Entrena Con Max. Todos los derechos reservados. Diseñado para optimizar tu rendimiento.</p>
        </div>
    </footer>

    <!-- Scripts -->
    <script>
        // Previsualización de imagen al instante
        function previewImage(event) {
            const input = event.target;
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('avatarPreview').src = e.target.result;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Script de interactividad del cursor
        const bgGlow = document.getElementById('bgGlow');
        document.addEventListener('mousemove', (e) => {
            if (bgGlow) {
                bgGlow.style.left = e.clientX + 'px';
                bgGlow.style.top = e.clientY + 'px';
            }
        });

        // Script Menú Móvil
        const mobileMenu = document.getElementById('mobileMenu');
        const navLinks = document.getElementById('navLinks');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                navLinks.classList.toggle('mobile-active');
            });
        }
    </script>
</body>
</html>
