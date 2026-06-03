# Gimnasio Virtual: Seguidor de Rutinas y Calorías — Entrena con Max

Bienvenido al repositorio oficial de **Entrena Con Max**, una plataforma web premium de alto rendimiento diseñada para optimizar tu nutrición y acondicionamiento físico. 

Este proyecto cuenta con arquitectura híbrida:
1. **Modo Servidor (PHP/MySQL)**: Para almacenamiento persistente en servidor local o hosting comercial.
2. **Modo Servidorless (Static HTML/LocalStorage)**: Optimizado especialmente para ser visualizado de manera pública en **GitHub Pages** sin necesidad de un backend activo.

---

## 🚀 Características Clave

*   **Fórmula Mifflin-St Jeor Médica**: Cálculo exacto del Gasto Energético Total Diario (GETD) y objetivo calórico diario (déficit o superávit).
*   **Macronutrientes Científicos**: Distribución inteligente de Proteínas, Carbohidratos y Grasas según peso y actividad física.
*   **Seguimiento Dinámico de Rutinas**: Inicia entrenamientos inmersivos en vivo con cronómetro, tiempos de descanso interactivos y control de discos y repeticiones.
*   **Sobrecarga Progresiva Automatizada (Logros)**: Cuando superas tu marca de volumen (`peso * repeticiones`) en cualquier serie de ejercicio, la plataforma lo detecta y lo establece como tu nuevo objetivo normal planificado automáticamente.
*   **Buscador Nutricional Autocompletable**: Ingresa tus comidas de forma fluida con buscador local.
*   **Gráfica de Evolución de Peso**: Historial de control de peso visualizado en una gráfica SVG integrada y responsiva.

---

## 🛠️ Cómo Visualizar en GitHub Pages (Sin Servidor)

Dado que GitHub Pages solo aloja archivos estáticos, hemos configurado una capa de base de datos emulada en `localStorage` en [js/github-pages-compat.js](js/github-pages-compat.js).

### Instrucciones para Publicar en tu Cuenta de GitHub:
1. Crea un nuevo repositorio en tu cuenta de GitHub llamado: `Gimnasio-Virtual-Entrena-Con-Max`.
2. Sube los archivos de este proyecto al repositorio mediante la consola de comandos de git o arrastrando la carpeta a **GitHub Desktop**.
3. En GitHub, ve a **Settings** (Configuración) de tu repositorio.
4. En la barra lateral izquierda, selecciona **Pages**.
5. En la sección *Build and deployment*, bajo *Source*, selecciona **Deploy from a branch**.
6. En *Branch*, elige la rama principal (`main` o `master`), la carpeta raíz (`/root`) y pulsa **Save** (Guardar).
7. ¡Listo! Tu página web estará pública en unos minutos en la dirección que te proporcionará GitHub (ej. `https://tu-usuario.github.io/Gimnasio-Virtual-Entrena-Con-Max/index.html`).

---

## 💻 Ejecución Local con Servidor (PHP & Base de Datos)

Para ejecutar el modo de aplicación persistente local con base de datos:
1. Copia esta carpeta dentro del directorio raíz de tu servidor (ej. `C:/xampp/htdocs/Aporte`).
2. Importa el archivo `db_schema.sql` en tu gestor de base de datos MySQL.
3. Configura los parámetros de conexión en el archivo `config.php` y `db_helper.php` si es necesario.
4. Abre tu navegador en `http://localhost/Aporte/app.php`.

---

© 2026 Entrena Con Max. Todos los derechos reservados. Diseñado para optimizar tu rendimiento físico.
