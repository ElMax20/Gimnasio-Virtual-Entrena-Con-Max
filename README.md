# 🏋️‍♂️ Gimnasio Virtual: Seguidor de Rutinas y Calorías
### 🚀 Entrena Con Max

¡Bienvenido a **Gimnasio Virtual**! Una plataforma web interactiva diseñada para ayudar a los usuarios a alcanzar sus metas físicas de manera eficiente, personalizada y con un seguimiento en tiempo real de su progreso.

A continuación, se detalla la documentación completa del proyecto conforme a los requerimientos de arquitectura, datos y desarrollo.

---

## 🎯 1. Objetivos del Proyecto

### El Problema que Resuelve
La falta de constancia y la desorganización son los principales obstáculos al empezar una vida saludable. Muchas personas no saben qué rutina seguir según su tipo de cuerpo o meta, y carecen de una herramienta unificada para registrar sus entrenamientos diarios y medir su avance calórico, lo que genera frustración y abandono temprano.

### Alcance de la Aplicación
**Gimnasio Virtual** actúa como un entrenador y gestor personal digital. El alcance de la aplicación web incluye:
* **Selección de Objetivos:** Personalización de la experiencia de usuario basada en metas claras: *Perder Peso* o *Ganar Masa Muscular*.
* **Módulo de Rutinas Recomendadas:** Despliegue inteligente de ejercicios guiados orientados al objetivo seleccionado.
* **Registro Diario de Actividad:** Bitácora interactiva donde el usuario anota los ejercicios completados en su sesión.
* **Contador de Progreso:** Visualización clara y motivadora del avance del usuario hacia sus metas diarias y semanales.

---

## 🏗️ 2. Arquitectura del Software

La aplicación sigue un modelo clásico de arquitectura desacoplada basada en cliente-servidor para garantizar modularidad y escalabilidad:

```
[ FRONTEND ] (Interfaz de Usuario)
      │
      ▼ (Peticiones HTTP Asíncronas / API)
[ BACKEND ]  (Lógica de Negocio y Enrutamiento)
      │
      ▼ (Consultas SQL)
[ BASE DE DATOS ] (Persistencia de Datos)
```

### Flujo de Funcionamiento:
1.  **Frontend (Capa de Presentación):** El usuario interactúa con una interfaz web responsiva y dinámica. Captura las metas del usuario y renderiza las rutinas de manera asíncrona.
2.  **Backend (Capa de Lógica):** Procesa las solicitudes del cliente, valida las credenciales y registros de ejercicios, gestiona las sesiones de usuario y sirve como puente de comunicación con la base de datos.
3.  **Base de Datos (Capa de Datos):** Almacena de forma estructurada los perfiles de los usuarios, el catálogo de rutinas predefinidas y el historial de progreso diario.

---

## 🛠️ 3. Stack Tecnológico

Para el desarrollo de esta plataforma se seleccionaron tecnologías modernas, eficientes y de alto rendimiento:

* **Frontend (Cliente):**
    * 🌐 **HTML5 & CSS3:** Estructuración semántica avanzada.
    * 🎨 **TailwindCSS:** Framework de CSS utilitario para un diseño estilizado, moderno, limpio y completamente adaptado a dispositivos móviles (Responsive Design).
    * ⚡ **JavaScript (Vanilla/ES6):** Manipulación dinámica del DOM, validaciones en el cliente y consumo asíncrono de datos para evitar recargas innecesarias de página.
* **Backend (Servidor):**
    * 🐘 **PHP / Node.js:** Encargados de la estructuración de la lógica del lado del servidor, procesamiento de peticiones y control de sesiones seguras.
* **Herramientas y Entorno:**
    * 💻 **XAMPP / MySQL Workbench:** Entorno de desarrollo local para el despliegue del servidor web y administración visual de datos.
    * 🐙 **Git & GitHub:** Control de versiones y alojamiento del código fuente.

---

## 📊 4. Modelo de Datos

* **Tipo de Base de Datos:** **Relacional (RDBMS)**. Se optó por una arquitectura relacional debido a la naturaleza estructurada de la información (un usuario tiene muchas rutinas, una rutina contiene muchos ejercicios, un registro diario pertenece a un usuario específico), asegurando la integridad referencial mediante llaves primarias (`Primary Keys`) y foráneas (`Foreign Keys`).
* **Ubicación de los Datos:** **Interna (Local)** gestionada a través de un motor **MySQL** enlazado localmente durante el entorno de desarrollo actual (con proyección a migración externa en la nube como AWS RDS o Clever Cloud en la fase de producción final).

---

## 🤖 5. Metodología con IA (Aceleración de Código)

Este proyecto integró metodologías ágiles asistidas por Inteligencia Artificial, empleando **Gemini** como copiloto de desarrollo técnico.

La IA fue utilizada estratégicamente en los siguientes pilares:
1.  **Optimización de Consultas SQL:** Diseño eficiente del esquema de la base de datos y optimización de las sentencias de inserción de progreso diario.
2.  **Maquetación con TailwindCSS:** Agilización en la generación de componentes visuales limpios, componentes de progreso interactivos y distribución estética de las rutinas de ejercicios.
3.  **Depuración y Lógica de JavaScript:** Asistencia en la resolución de bugs durante el manejo del estado local de las calorías y la persistencia temporal de las rutinas seleccionadas.

---

## 🔗 Enlace al Repositorio

Puedes visualizar y colaborar con este proyecto directamente en su sitio oficial de desarrollo:
📌 **[GitHub - Gimnasio Virtual: Entrena Con Max](https://github.com/ElMax20/Gimnasio-Virtual-Entrena-Con-Max)**

---
_Desarrollado con dedicación para optimizar el rendimiento deportivo y tecnológico._ 💪🔥
