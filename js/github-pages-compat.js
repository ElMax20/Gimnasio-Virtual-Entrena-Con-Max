// github-pages-compat.js - Client-side LocalStorage DB for GitHub Pages Compatibility
(function() {
    // Detect if we are running in static mode (no PHP)
    const isStatic = window.location.pathname.endsWith('.html') || 
                     window.location.hostname.includes('github.io') || 
                     window.location.protocol === 'file:';

    if (!isStatic) {
        return; // Run PHP normally if hosted on local server
    }

    console.log("GitHub Pages Compatibility Mode Active: Using LocalStorage Database.");

    // Helper: Get URL Query parameters
    function getQueryParam(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    // Default username if not logged in (fallback for static demo)
    let currentUsername = localStorage.getItem('logged_in_user') || null;

    // Default Foods Data Bank (replacing app.php mock array)
    const MOCK_FOODS = [
        { name: "pechuga de pollo", calories: 165, proteins: 31, carbs: 0, fats: 3.6, size: 100 },
        { name: "arroz blanco cocido", calories: 130, proteins: 2.7, carbs: 28, fats: 0.3, size: 100 },
        { name: "arroz integral cocido", calories: 111, proteins: 2.6, carbs: 23, fats: 0.9, size: 100 },
        { name: "huevo entero", calories: 155, proteins: 13, carbs: 1.1, fats: 11, size: 100 },
        { name: "clara de huevo", calories: 52, proteins: 11, carbs: 0.7, fats: 0.2, size: 100 },
        { name: "platano (banano)", calories: 89, proteins: 1.1, carbs: 23, fats: 0.3, size: 100 },
        { name: "manzana", calories: 52, proteins: 0.3, carbs: 14, fats: 0.2, size: 100 },
        { name: "avena en hojuelas", calories: 389, proteins: 16.9, carbs: 66, fats: 6.9, size: 100 },
        { name: "leche descremada", calories: 34, proteins: 3.4, carbs: 5, fats: 0.1, size: 100 },
        { name: "leche entera", calories: 61, proteins: 3.2, carbs: 4.8, fats: 3.3, size: 100 },
        { name: "pan integral", calories: 247, proteins: 13, carbs: 41, fats: 3.4, size: 100 },
        { name: "pan blanco", calories: 265, proteins: 9, carbs: 49, fats: 3.2, size: 100 },
        { name: "atun en agua (lata)", calories: 116, proteins: 26, carbs: 0, fats: 1, size: 100 },
        { name: "aguacate (palta)", calories: 160, proteins: 2, carbs: 9, fats: 15, size: 100 },
        { name: "almendras", calories: 579, proteins: 21, carbs: 22, fats: 49, size: 100 },
        { name: "papas cocidas (patatas)", calories: 87, proteins: 1.9, carbs: 20, fats: 0.1, size: 100 },
        { name: "camote (batata)", calories: 86, proteins: 1.6, carbs: 20, fats: 0.1, size: 100 },
        { name: "lentejas cocidas", calories: 116, proteins: 9, carbs: 20, fats: 0.4, size: 100 },
        { name: "garbanzos cocidos", calories: 164, proteins: 8.9, carbs: 27, fats: 2.6, size: 100 },
        { name: "carne de res magra", calories: 250, proteins: 26, carbs: 0, fats: 15, size: 100 },
        { name: "lomo de cerdo", calories: 143, proteins: 26, carbs: 0, fats: 3.5, size: 100 },
        { name: "queso fresco magro", calories: 98, proteins: 11, carbs: 3.5, fats: 4, size: 100 },
        { name: "yogurt griego natural", calories: 59, proteins: 10, carbs: 3.6, fats: 0.4, size: 100 },
        { name: "aceite de oliva", calories: 884, proteins: 0, carbs: 0, fats: 100, size: 100 },
        { name: "fresas", calories: 32, proteins: 0.7, carbs: 7.7, fats: 0.3, size: 100 },
        { name: "brocoli", calories: 34, proteins: 2.8, carbs: 7, fats: 0.4, size: 100 },
        { name: "espinacas cocidas", calories: 23, proteins: 3, carbs: 3.8, fats: 0.3, size: 100 },
        { name: "pepino", calories: 15, proteins: 0.7, carbs: 3.6, fats: 0.1, size: 100 },
        { name: "zanahoria raw", calories: 41, proteins: 0.9, carbs: 10, fats: 0.2, size: 100 },
        { name: "pechuga de pavo", calories: 135, proteins: 30, carbs: 0.1, fats: 1.1, size: 100 },
        { name: "merluza (pescado blanco)", calories: 90, proteins: 18, carbs: 0, fats: 2, size: 100 },
        { name: "salmon", calories: 208, proteins: 20, carbs: 0, fats: 13, size: 100 },
        { name: "tomate", calories: 18, proteins: 0.9, carbs: 3.9, fats: 0.2, size: 100 },
        { name: "cebolla", calories: 40, proteins: 1.1, carbs: 9.3, fats: 0.1, size: 100 },
        { name: "queso mozzarella", calories: 280, proteins: 28, carbs: 2.2, fats: 17, size: 100 },
        { name: "pasta (fideos cocidos)", calories: 131, proteins: 5, carbs: 25, fats: 1.1, size: 100 }
    ];

    // Default Exercises for Workout Database (ExerciseDB Mock)
    const MOCK_EXERCISES = [
        { name: "remo con barra", bodyPart: "espalda (back)", target: "dorsal ancho (lats)" },
        { name: "banca con barra (bench press)", bodyPart: "pecho (chest)", target: "pectorales (pectorals)" },
        { name: "banca inclinada con mancuernas", bodyPart: "pecho (chest)", target: "pectorales superiores" },
        { name: "sentadilla con barra (squats)", bodyPart: "piernas (legs)", target: "cuádriceps (quads)" },
        { name: "peso muerto (deadlift)", bodyPart: "espalda / piernas", target: "femorales e isquios" },
        { name: "curl de biceps con barra", bodyPart: "brazos (arms)", target: "bíceps (biceps)" },
        { name: "curl de biceps martillo", bodyPart: "brazos (arms)", target: "bíceps y braquial" },
        { name: "press militar con barra", bodyPart: "hombros (shoulders)", target: "deltoides anterior" },
        { name: "elevaciones laterales con mancuernas", bodyPart: "hombros (shoulders)", target: "deltoides lateral" },
        { name: "extensiones de tríceps en polea", bodyPart: "brazos (arms)", target: "tríceps (triceps)" },
        { name: "fondos de pecho (dips)", bodyPart: "pecho / brazos", target: "pectorales / tríceps" },
        { name: "zancadas con mancuernas (lunges)", bodyPart: "piernas (legs)", target: "glúteos / cuádriceps" },
        { name: "prensa de piernas (leg press)", bodyPart: "piernas (legs)", target: "cuádriceps" },
        { name: "dominadas (pullups)", bodyPart: "espalda (back)", target: "dorsal ancho" }
    ];

    // DB Access helpers
    function getUsers() {
        return JSON.parse(localStorage.getItem('static_users') || '{}');
    }
    function saveUsers(users) {
        localStorage.setItem('static_users', JSON.stringify(users));
    }

    function getProfile(username) {
        return JSON.parse(localStorage.getItem('profile_' + username) || 'null');
    }
    function saveProfile(username, profile) {
        localStorage.setItem('profile_' + username, JSON.stringify(profile));
    }

    function getRoutines(username) {
        return JSON.parse(localStorage.getItem('routines_' + username) || '[]');
    }
    function saveRoutines(username, routines) {
        localStorage.setItem('routines_' + username, JSON.stringify(routines));
    }

    function getMeals(username) {
        return JSON.parse(localStorage.getItem('meals_' + username) || '[]');
    }
    function saveMeals(username, meals) {
        localStorage.setItem('meals_' + username, JSON.stringify(meals));
    }

    function getWeightHistory(username) {
        return JSON.parse(localStorage.getItem('weight_history_' + username) || '[]');
    }
    function saveWeightHistory(username, history) {
        localStorage.setItem('weight_history_' + username, JSON.stringify(history));
    }

    function getWorkoutLogs(username) {
        return JSON.parse(localStorage.getItem('workout_logs_' + username) || '[]');
    }
    function saveWorkoutLogs(username, logs) {
        localStorage.setItem('workout_logs_' + username, JSON.stringify(logs));
    }

    // Intercept Fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        const urlStr = url.toString();
        
        // Fulfill app.php requests
        if (urlStr.includes('app.php')) {
            const ajax = getQueryParam('ajax', urlStr);
            const action = getQueryParam('action', urlStr);
            
            // Check POST action in body if not in query
            let bodyData = null;
            if (options && options.body) {
                try {
                    // Could be JSON or FormUrlEncoded
                    if (typeof options.body === 'string') {
                        bodyData = JSON.parse(options.body);
                    } else if (options.body instanceof URLSearchParams) {
                        bodyData = {};
                        for (let [k, v] of options.body.entries()) {
                            bodyData[k] = v;
                        }
                    } else if (options.body instanceof FormData) {
                        bodyData = {};
                        for (let [k, v] of options.body.entries()) {
                            bodyData[k] = v;
                        }
                    }
                } catch(e) {}
            }

            const activeAction = action || (bodyData && bodyData.action);

            // POST actions (Authentication / Onboarding)
            if (options && options.method === 'POST') {
                if (activeAction === 'register') {
                    const username = bodyData.username.trim().toLowerCase();
                    const email = bodyData.email.trim().toLowerCase();
                    const password = bodyData.password;
                    
                    if (!username || !email || !password) {
                        return Promise.resolve(new Response(JSON.stringify({ success: false, error: "Campos requeridos" })));
                    }

                    const users = getUsers();
                    if (users[username]) {
                        return Promise.resolve(new Response(JSON.stringify({ success: false, error: "El usuario ya existe" })));
                    }

                    users[username] = { email, password, avatar: '' };
                    saveUsers(users);
                    
                    return Promise.resolve(new Response(JSON.stringify({ success: true, message: "Registro completado con éxito. Ahora inicia sesión." })));
                }

                if (activeAction === 'login') {
                    const username = bodyData.username.trim().toLowerCase();
                    const password = bodyData.password;
                    
                    const users = getUsers();
                    const user = users[username];
                    
                    if (!user || user.password !== password) {
                        return Promise.resolve(new Response(JSON.stringify({ success: false, error: "Usuario o contraseña incorrectos" })));
                    }

                    localStorage.setItem('logged_in_user', username);
                    localStorage.setItem('user_avatar', user.avatar || '');
                    currentUsername = username;
                    
                    // Redirect on login
                    setTimeout(() => { window.location.href = 'app.html'; }, 500);
                    return Promise.resolve(new Response(JSON.stringify({ success: true, username })));
                }

                if (activeAction === 'onboarding') {
                    // Handled locally in app.html script
                    return Promise.resolve(new Response(JSON.stringify({ success: true })));
                }

                if (ajax === 'save_profile') {
                    saveProfile(currentUsername, bodyData);
                    return Promise.resolve(new Response(JSON.stringify({ success: true })));
                }

                if (ajax === 'add_food') {
                    const meals = getMeals(currentUsername);
                    const newFood = {
                        id: Date.now(),
                        food_name: bodyData.food_name,
                        calories: parseFloat(bodyData.calories) || 0,
                        proteins: parseFloat(bodyData.proteins) || 0,
                        carbs: parseFloat(bodyData.carbs) || 0,
                        fats: parseFloat(bodyData.fats) || 0,
                        grams: parseFloat(bodyData.grams) || 100,
                        created_at: new Date().toISOString()
                    };
                    meals.push(newFood);
                    saveMeals(currentUsername, meals);
                    return Promise.resolve(new Response(JSON.stringify({ success: true, meal: newFood })));
                }

                if (ajax === 'delete_food') {
                    let meals = getMeals(currentUsername);
                    const foodId = parseInt(bodyData.id);
                    meals = meals.filter(m => m.id !== foodId);
                    saveMeals(currentUsername, meals);
                    return Promise.resolve(new Response(JSON.stringify({ success: true })));
                }

                if (ajax === 'add_weight') {
                    const history = getWeightHistory(currentUsername);
                    const newWeight = {
                        weight: parseFloat(bodyData.weight),
                        date: new Date().toISOString().split('T')[0]
                    };
                    history.push(newWeight);
                    saveWeightHistory(currentUsername, history);
                    return Promise.resolve(new Response(JSON.stringify({ success: true, weight: newWeight.weight, date: newWeight.date })));
                }
            }

            // GET actions
            if (activeAction === 'logout') {
                localStorage.removeItem('logged_in_user');
                localStorage.removeItem('user_avatar');
                currentUsername = null;
                window.location.href = 'app.html';
                return Promise.resolve(new Response(JSON.stringify({ success: true })));
            }

            if (ajax === 'search_food') {
                const query = getQueryParam('q', urlStr).toLowerCase();
                const matches = MOCK_FOODS.filter(f => f.name.includes(query));
                return Promise.resolve(new Response(JSON.stringify(matches)));
            }
        }

        // Fulfill routines.php requests
        if (urlStr.includes('routines.php')) {
            const ajax = getQueryParam('ajax', urlStr);
            
            let bodyData = null;
            if (options && options.body) {
                try {
                    bodyData = JSON.parse(options.body);
                } catch(e) {}
            }

            if (ajax === 'get_routines') {
                const routines = getRoutines(currentUsername);
                return Promise.resolve(new Response(JSON.stringify({ success: true, routines })));
            }

            if (ajax === 'save_routine') {
                const routines = getRoutines(currentUsername);
                const title = bodyData.title;
                const exercises = bodyData.exercises || [];
                const editId = bodyData.id;

                let description = exercises.length > 0 ? exercises.map(ex => ex.name).join(', ') : 'Rutina vacía';

                if (editId) {
                    const idx = routines.findIndex(r => r.id == editId);
                    if (idx !== -1) {
                        routines[idx].title = title;
                        routines[idx].description = description;
                        routines[idx].exercises = exercises;
                    }
                } else {
                    const newId = Date.now();
                    routines.push({
                        id: newId,
                        title,
                        description,
                        exercises
                    });
                }
                saveRoutines(currentUsername, routines);
                return Promise.resolve(new Response(JSON.stringify({ success: true })));
            }

            if (ajax === 'delete_routine') {
                let routines = getRoutines(currentUsername);
                // In duplicate/delete, body might be URLSearchParams or FormData
                let deleteId = null;
                if (options.body instanceof URLSearchParams || options.body instanceof FormData) {
                    deleteId = parseInt(options.body.get('id'));
                } else if (bodyData) {
                    deleteId = parseInt(bodyData.id);
                }
                routines = routines.filter(r => r.id !== deleteId);
                saveRoutines(currentUsername, routines);
                return Promise.resolve(new Response(JSON.stringify({ success: true })));
            }

            if (ajax === 'duplicate_routine') {
                const routines = getRoutines(currentUsername);
                let dupId = null;
                if (options.body instanceof URLSearchParams || options.body instanceof FormData) {
                    dupId = parseInt(options.body.get('id'));
                } else if (bodyData) {
                    dupId = parseInt(bodyData.id);
                }
                const orig = routines.find(r => r.id == dupId);
                if (orig) {
                    const dup = JSON.parse(JSON.stringify(orig));
                    dup.id = Date.now();
                    dup.title = dup.title + " (Copia)";
                    routines.push(dup);
                    saveRoutines(currentUsername, routines);
                    return Promise.resolve(new Response(JSON.stringify({ success: true })));
                }
                return Promise.resolve(new Response(JSON.stringify({ success: false, error: "Rutina no encontrada" })));
            }

            if (ajax === 'search_exercises') {
                const query = getQueryParam('q', urlStr).toLowerCase();
                const matches = MOCK_EXERCISES.filter(ex => ex.name.includes(query));
                return Promise.resolve(new Response(JSON.stringify(matches)));
            }

            if (ajax === 'save_workout_log') {
                const logs = getWorkoutLogs(currentUsername);
                bodyData.id = Date.now();
                bodyData.created_at = new Date().toISOString();
                logs.push(bodyData);
                saveWorkoutLogs(currentUsername, logs);
                return Promise.resolve(new Response(JSON.stringify({ success: true })));
            }

            if (ajax === 'get_workout_logs') {
                const logs = getWorkoutLogs(currentUsername);
                const rId = parseInt(getQueryParam('routine_id', urlStr));
                const filtered = logs.filter(l => l.routine_id == rId);
                return Promise.resolve(new Response(JSON.stringify({ success: true, logs: filtered })));
            }
        }

        // Default: use original fetch
        return originalFetch.apply(this, arguments);
    };

    // Client-side execution bootstrap
    window.addEventListener('DOMContentLoaded', () => {
        // Initialize Default Demo Users and Profile if empty
        const users = getUsers();
        if (Object.keys(users).length === 0) {
            users['invitado'] = { email: 'invitado@entrenaconmax.com', password: '123', avatar: '' };
            saveUsers(users);
        }

        if (!currentUsername) {
            // Unauthenticated view
            const path = window.location.pathname;
            if (path.endsWith('app.html')) {
                // Show login state
                const outEl = document.getElementById('state-logged-out');
                if (outEl) outEl.style.display = 'block';
                const dashEl = document.getElementById('state-dashboard');
                if (dashEl) dashEl.style.display = 'none';
                const onEl = document.getElementById('state-onboarding');
                if (onEl) onEl.style.display = 'none';
            } else if (path.endsWith('routines.html') || path.endsWith('config.html')) {
                // Redirect unauthorized page views
                window.location.href = 'app.html';
            }
            return;
        }

        // Authenticated view
        const profile = getProfile(currentUsername);
        const path = window.location.pathname;

        // Set Navigation Bar avatar and elements
        const navAvatar = document.getElementById('nav-user-avatar');
        if (navAvatar) {
            navAvatar.src = localStorage.getItem('user_avatar') || 
                `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23ff2a2a'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Outfit, sans-serif' font-size='50' font-weight='800'>${currentUsername.charAt(0).toUpperCase()}</text></svg>`;
        }
        const navUserItem = document.getElementById('nav-user-item');
        if (navUserItem) navUserItem.style.display = 'block';
        const navLoginItem = document.getElementById('nav-login-item');
        if (navLoginItem) navLoginItem.style.display = 'none';

        // Setup dates
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            const today = new Date();
            dateEl.innerText = today.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        // Handle page-specific overrides
        if (path.endsWith('app.html')) {
            const outEl = document.getElementById('state-logged-out');
            if (outEl) outEl.style.display = 'none';

            if (!profile) {
                // Show Onboarding
                const onEl = document.getElementById('state-onboarding');
                if (onEl) onEl.style.display = 'block';
                const dashEl = document.getElementById('state-dashboard');
                if (dashEl) dashEl.style.display = 'none';
                
                // Override Onboarding form submit
                const obForm = document.querySelector('form[action="app.php"]');
                if (obForm) {
                    obForm.action = '#';
                    obForm.onsubmit = function(e) {
                        e.preventDefault();
                        const formData = new FormData(obForm);
                        const weight = parseFloat(formData.get('weight'));
                        const height = parseFloat(formData.get('height'));
                        const unit_weight = formData.get('unit_weight');
                        const unit_height = formData.get('unit_height');
                        const gender = formData.get('gender');
                        const age = parseInt(formData.get('age'));
                        const activity = formData.get('activity');
                        const goal = formData.get('goal');
                        const body_fat = formData.get('body_fat');
                        const target_weight = parseFloat(formData.get('target_weight'));

                        const weight_kg = (unit_weight === 'lbs') ? (weight * 0.453592) : weight;
                        const height_cm = (unit_height === 'in') ? (height * 2.54) : height;

                        let tmb = (gender === 'male') 
                            ? (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
                            : (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;

                        const multipliers = { bajo: 1.2, moderado: 1.375, alto: 1.55, muy_alto: 1.725 };
                        const mult = multipliers[activity] || 1.2;
                        const getd = tmb * mult;

                        let target_calories = getd;
                        if (goal === 'perdida_peso' || goal === 'definicion') {
                            target_calories = getd - 400;
                        } else if (goal === 'subida_peso' || goal === 'deportivo') {
                            target_calories = getd + 400;
                        }

                        let is_capped = false;
                        if (gender === 'female' && target_calories < 1200) {
                            target_calories = 1200;
                            is_capped = true;
                        } else if (gender === 'male' && target_calories < 1500) {
                            target_calories = 1500;
                            is_capped = true;
                        }

                        const protein_g = 1.8 * weight_kg;
                        const protein_kcal = protein_g * 4;
                        const fat_kcal = target_calories * 0.25;
                        const fat_g = fat_kcal / 9;
                        const carb_kcal = Math.max(0, target_calories - protein_kcal - fat_kcal);
                        const carb_g = carb_kcal / 4;

                        const profileData = {
                            weight, height, unit_weight, unit_height, gender, age, activity, goal, body_fat, target_weight,
                            tmb: Math.round(tmb), getd: Math.round(getd), target_calories: Math.round(target_calories), is_capped,
                            macros: { protein_g: Math.round(protein_g * 10) / 10, fat_g: Math.round(fat_g * 10) / 10, carb_g: Math.round(carb_g * 10) / 10 }
                        };

                        saveProfile(currentUsername, profileData);
                        
                        // Set initial weight log
                        const initialWeightLog = [{ weight, date: new Date().toISOString().split('T')[0] }];
                        saveWeightHistory(currentUsername, initialWeightLog);

                        window.location.reload();
                    };
                }
            } else {
                // Show Dashboard
                const dashEl = document.getElementById('state-dashboard');
                if (dashEl) dashEl.style.display = 'block';
                const onEl = document.getElementById('state-onboarding');
                if (onEl) onEl.style.display = 'none';

                // Set dynamic values
                document.getElementById('welcome-username').innerText = `BIENVENIDO, ${currentUsername.toUpperCase()}`;
                
                // Show/hide cap limit alert
                const capEl = document.getElementById('calorie-capped-alert');
                if (capEl) capEl.style.display = profile.is_capped ? 'flex' : 'none';
                
                const goalKcalEl = document.getElementById('goalKcal');
                if (goalKcalEl) goalKcalEl.innerText = profile.target_calories;
                
                const goalProtEl = document.getElementById('goalProt');
                if (goalProtEl) goalProtEl.innerText = profile.macros.protein_g;
                const goalCarbEl = document.getElementById('goalCarb');
                if (goalCarbEl) goalCarbEl.innerText = profile.macros.carb_g;
                const goalFatEl = document.getElementById('goalFat');
                if (goalFatEl) goalFatEl.innerText = profile.macros.fat_g;

                // Set inputs/labels for unit weight
                const newWeightVal = document.getElementById('newWeightVal');
                if (newWeightVal) newWeightVal.placeholder = profile.unit_weight;
                const evoTitle = document.getElementById('evolution-weight-title');
                if (evoTitle) evoTitle.innerText = `Evolución de Peso (${profile.unit_weight.toUpperCase()})`;

                // Highlight active row for activity
                const actRows = { bajo: 'rowActBajo', moderado: 'rowActModerado', alto: 'rowActAlto', muy_alto: 'rowActMuyAlto' };
                Object.keys(actRows).forEach(k => {
                    const row = document.getElementById(actRows[k]);
                    if (row) {
                        if (profile.activity === k) {
                            row.classList.add('active-row');
                        } else {
                            row.classList.remove('active-row');
                        }
                    }
                });

                // Compute consumed macros for today
                const meals = getMeals(currentUsername);
                let today_kcal = 0;
                let today_proteins = 0;
                let today_carbs = 0;
                let today_fats = 0;

                meals.forEach(m => {
                    today_kcal += m.calories;
                    today_proteins += m.proteins;
                    today_carbs += m.carbs;
                    today_fats += m.fats;
                });

                document.getElementById('consumedKcal').innerText = Math.round(today_kcal);
                document.getElementById('currProt').innerText = Math.round(today_proteins * 10) / 10;
                document.getElementById('currCarb').innerText = Math.round(today_carbs * 10) / 10;
                document.getElementById('currFat').innerText = Math.round(today_fats * 10) / 10;

                // Timeline message
                const netCalories = today_kcal - profile.target_calories;
                let timelineMsg = '';
                if (netCalories < -150) {
                    timelineMsg = `Estás en un déficit saludable de ${Math.abs(Math.round(netCalories))} kcal para quemar grasa.`;
                } else if (netCalories > 150) {
                    timelineMsg = `Estás en un superávit de ${Math.round(netCalories)} kcal. ¡Ideal para hipertrofia y ganar fuerza!`;
                } else {
                    timelineMsg = `Consumo equilibrado. Mantendrás tu peso metabólico óptimo de mantenimiento.`;
                }
                const timeEl = document.getElementById('timelineMessage');
                if (timeEl) timeEl.innerText = timelineMsg;

                // Expose global variables before app.js init
                window.userDataMeals = meals;
                window.userWeightHistory = getWeightHistory(currentUsername);
                window.userUnitWeight = profile.unit_weight;
            }
        }

        if (path.endsWith('routines.html')) {
            window.userRoutines = getRoutines(currentUsername);
            window.userUnitWeight = profile ? profile.unit_weight : 'kg';
        }

        if (path.endsWith('config.html')) {
            const preview = document.getElementById('avatarPreview');
            if (preview) {
                preview.src = localStorage.getItem('user_avatar') || 
                    `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23ff2a2a'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Outfit, sans-serif' font-size='50' font-weight='800'>${currentUsername.charAt(0).toUpperCase()}</text></svg>`;
            }
            
            const unameEl = document.getElementById('username');
            if (unameEl) unameEl.value = currentUsername;

            const uRec = getUsers()[currentUsername];
            const emailEl = document.getElementById('email');
            if (emailEl && uRec) emailEl.value = uRec.email;

            // Handle static file upload
            const fileInput = document.getElementById('avatar');
            if (fileInput) {
                fileInput.addEventListener('change', function(e) {
                    const file = fileInput.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(evt) {
                            if (preview) preview.src = evt.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            const configForm = document.querySelector('form');
            if (configForm) {
                configForm.action = '#';
                configForm.onsubmit = function(e) {
                    e.preventDefault();
                    const newUname = unameEl.value.trim().toLowerCase();
                    const newEmail = emailEl.value.trim().toLowerCase();
                    const avatarFile = fileInput.files[0];

                    const users = getUsers();
                    const prevData = users[currentUsername];

                    if (newUname !== currentUsername && users[newUname]) {
                        alert("El nombre de usuario ya está en uso.");
                        return;
                    }

                    // Save new avatar base64 if uploaded
                    if (avatarFile) {
                        const reader = new FileReader();
                        reader.onload = function(evt) {
                            const base64Data = evt.target.result;
                            localStorage.setItem('user_avatar', base64Data);
                            saveData();
                        };
                        reader.readAsDataURL(avatarFile);
                    } else {
                        saveData();
                    }

                    function saveData() {
                        const avatarVal = localStorage.getItem('user_avatar') || '';
                        
                        delete users[currentUsername];
                        users[newUname] = { email: newEmail, password: prevData.password, avatar: avatarVal };
                        saveUsers(users);

                        // Migrate profile and histories to new username
                        if (newUname !== currentUsername) {
                            const profileVal = localStorage.getItem('profile_' + currentUsername);
                            if (profileVal) {
                                localStorage.setItem('profile_' + newUname, profileVal);
                                localStorage.removeItem('profile_' + currentUsername);
                            }

                            const routinesVal = localStorage.getItem('routines_' + currentUsername);
                            if (routinesVal) {
                                localStorage.setItem('routines_' + newUname, routinesVal);
                                localStorage.removeItem('routines_' + currentUsername);
                            }

                            const mealsVal = localStorage.getItem('meals_' + currentUsername);
                            if (mealsVal) {
                                localStorage.setItem('meals_' + newUname, mealsVal);
                                localStorage.removeItem('meals_' + currentUsername);
                            }

                            const weightVal = localStorage.getItem('weight_history_' + currentUsername);
                            if (weightVal) {
                                localStorage.setItem('weight_history_' + newUname, weightVal);
                                localStorage.removeItem('weight_history_' + currentUsername);
                            }

                            const logsVal = localStorage.getItem('workout_logs_' + currentUsername);
                            if (logsVal) {
                                localStorage.setItem('workout_logs_' + newUname, logsVal);
                                localStorage.removeItem('workout_logs_' + currentUsername);
                            }

                            localStorage.setItem('logged_in_user', newUname);
                            currentUsername = newUname;
                        }

                        alert("¡Perfil actualizado con éxito!");
                        window.location.href = 'app.html';
                    }
                };
            }
        }
    });
})();
