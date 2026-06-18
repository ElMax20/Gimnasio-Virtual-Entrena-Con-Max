// github-pages-compat.js - Client-side LocalStorage DB for GitHub Pages Compatibility
(function() {
    // Always run in static mode since we are working directly on GitHub/statically (no PHP)
    const isStatic = true;

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

    // Sync cache data to Supabase in the background
    async function syncToSupabase(column, val) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
        const userId = localStorage.getItem('logged_in_user_id');
        if (!userId) return;
        
        try {
            const updateData = {};
            updateData[column] = val;
            const { error } = await supabaseClient
                .from('user_profiles')
                .update(updateData)
                .eq('id', userId);
            if (error) {
                console.error(`Error syncing ${column} to Supabase:`, error);
            }
        } catch (err) {
            console.error(`Exception syncing ${column} to Supabase:`, err);
        }
    }

    function getProfile(username) {
        return JSON.parse(localStorage.getItem('profile_' + username) || 'null');
    }
    function saveProfile(username, profile) {
        localStorage.setItem('profile_' + username, JSON.stringify(profile));
        syncToSupabase('profile_data', profile);
    }

    function getRoutines(username) {
        return JSON.parse(localStorage.getItem('routines_' + username) || '[]');
    }
    function saveRoutines(username, routines) {
        localStorage.setItem('routines_' + username, JSON.stringify(routines));
        syncToSupabase('routines', routines);
    }

    function getMeals(username) {
        return JSON.parse(localStorage.getItem('meals_' + username) || '{}');
    }
    function saveMeals(username, meals) {
        localStorage.setItem('meals_' + username, JSON.stringify(meals));
        syncToSupabase('meals', meals);
    }
    function getMealsForDate(username, dateStr) {
        const allMeals = getMeals(username);
        if (!allMeals[dateStr]) {
            allMeals[dateStr] = {
                desayuno: [],
                almuerzo: [],
                merienda: [],
                agregar_comidas: []
            };
        }
        return allMeals[dateStr];
    }
    function saveMealsForDate(username, dateStr, dayMeals) {
        const allMeals = getMeals(username);
        allMeals[dateStr] = dayMeals;
        saveMeals(username, allMeals);
    }
    function getLocalDateString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getWeightHistory(username) {
        return JSON.parse(localStorage.getItem('weight_history_' + username) || '[]');
    }
    function saveWeightHistory(username, history) {
        localStorage.setItem('weight_history_' + username, JSON.stringify(history));
        syncToSupabase('weight_history', history);
    }

    function getWorkoutLogs(username) {
        return JSON.parse(localStorage.getItem('workout_logs_' + username) || '[]');
    }
    function saveWorkoutLogs(username, logs) {
        localStorage.setItem('workout_logs_' + username, JSON.stringify(logs));
        syncToSupabase('workout_logs', logs);
    }

    // --- FatSecret API Helpers ---
    function extractFoods(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.foods && Array.isArray(data.foods.food)) return data.foods.food;
        if (data.foods && typeof data.foods.food === 'object') return [data.foods.food];
        if (data.foods_search && data.foods_search.results && Array.isArray(data.foods_search.results.food)) {
            return data.foods_search.results.food;
        }
        if (data.foods_search && data.foods_search.results && typeof data.foods_search.results.food === 'object') {
            return [data.foods_search.results.food];
        }
        return [];
    }

    async function getFatSecretToken() {
        const cachedToken = localStorage.getItem('fatsecret_token');
        const expiresAt = localStorage.getItem('fatsecret_expires_at');
        
        if (cachedToken && expiresAt && parseInt(expiresAt) > Date.now()) {
            return cachedToken;
        }
        
        const clientId = '856d7ec06200498f9b5679923ddab29d';
        const clientSecret = 'dee3aa9884a5458dad637464f0d2c8ad';
        const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
        const bodyParams = new URLSearchParams({
            'grant_type': 'client_credentials',
            'scope': 'basic'
        });

        let response = null;
        try {
            // Direct request
            response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: bodyParams
            });
        } catch (directErr) {
            console.warn("Direct token fetch failed (likely CORS). Trying AllOrigins proxy...", directErr);
            try {
                // AllOrigins proxy
                const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(tokenUrl);
                response = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                    },
                    body: bodyParams
                });
            } catch (proxyErr) {
                console.warn("AllOrigins proxy token fetch failed. Trying corsproxy.io proxy...", proxyErr);
                try {
                    // corsproxy.io proxy
                    const proxyUrl2 = 'https://corsproxy.io/?' + encodeURIComponent(tokenUrl);
                    response = await fetch(proxyUrl2, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                        },
                        body: bodyParams
                    });
                } catch (proxy2Err) {
                    console.warn("Proxy token retrieval failed. Reading fatsecret_token.txt fallback...", proxy2Err);
                    try {
                        const fileRes = await fetch('fatsecret_token.txt');
                        if (fileRes.ok) {
                            const fileData = await fileRes.json();
                            if (fileData.access_token) {
                                localStorage.setItem('fatsecret_token', fileData.access_token);
                                const exp = Date.now() + (parseInt(fileData.expires_in || 3600) * 1000) - 60000;
                                localStorage.setItem('fatsecret_expires_at', exp.toString());
                                return fileData.access_token;
                            }
                        }
                    } catch (fileErr) {
                        console.error("Local token file fallback also failed:", fileErr);
                    }
                    return null;
                }
            }
        }

        if (response && response.ok) {
            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('fatsecret_token', data.access_token);
                const expiresTime = Date.now() + (parseInt(data.expires_in || 3600) * 1000) - 60000;
                localStorage.setItem('fatsecret_expires_at', expiresTime.toString());
                return data.access_token;
            }
        }
        return null;
    }

    async function searchFatSecretFood(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }
        
        const q = query.trim().toLowerCase();
        
        const getMockMatches = () => {
            return MOCK_FOODS.filter(f => f.name.includes(q)).map((f, i) => ({
                food_id: 'mock_' + i + '_' + Date.now(),
                food_name: f.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                food_description: `Per 100g - Calories: ${f.calories}kcal | Fat: ${f.fats.toFixed(2)}g | Carbs: ${f.carbs.toFixed(2)}g | Protein: ${f.proteins.toFixed(2)}g`
            }));
        };

        try {
            const token = await getFatSecretToken();
            if (!token) {
                console.warn("No FatSecret token. Falling back to local mock search.");
                return getMockMatches();
            }

            const apiUrl = 'https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=' + encodeURIComponent(q) + '&format=json&max_results=10';
            
            let data = null;
            try {
                // Try direct first
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                if (response.ok) {
                    data = await response.json();
                } else {
                    throw new Error("Direct search failed: " + response.statusText);
                }
            } catch (directErr) {
                console.warn("Direct search failed. Trying AllOrigins proxy...", directErr);
                try {
                    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(apiUrl);
                    const response = await fetch(proxyUrl, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (response.ok) {
                        data = await response.json();
                    } else {
                        throw new Error("AllOrigins proxy search failed");
                    }
                } catch (proxyErr) {
                    console.warn("AllOrigins search failed. Trying corsproxy.io...", proxyErr);
                    try {
                        const proxyUrl2 = 'https://corsproxy.io/?' + encodeURIComponent(apiUrl);
                        const response2 = await fetch(proxyUrl2, {
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        if (response2.ok) {
                            data = await response2.json();
                        } else {
                            throw new Error("corsproxy.io failed");
                        }
                    } catch (proxy2Err) {
                        console.error("All search requests failed:", proxy2Err);
                        return getMockMatches();
                    }
                }
            }

            const foods = extractFoods(data);
            if (foods && foods.length > 0) {
                return foods.map(f => ({
                    food_id: f.food_id || String(Math.random()),
                    food_name: f.food_name,
                    food_description: f.food_description || `Per 100g - Calories: 0kcal | Fat: 0.00g | Carbs: 0.00g | Protein: 0.00g`
                }));
            } else {
                console.warn("FatSecret API returned no results. Using local mock fallback.");
                return getMockMatches();
            }
        } catch (err) {
            console.error("FatSecret API error. Using local mock fallback.", err);
            return getMockMatches();
        }
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

                    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                        return (async () => {
                            try {
                                const { data: existing, error: checkErr } = await supabaseClient
                                    .from('user_profiles')
                                    .select('username')
                                    .eq('username', username);
                                
                                if (checkErr) {
                                    return new Response(JSON.stringify({ success: false, error: "Error al validar usuario: " + checkErr.message }));
                                }
                                if (existing && existing.length > 0) {
                                    return new Response(JSON.stringify({ success: false, error: "El nombre de usuario ya existe" }));
                                }

                                const redirectUrl = window.location.origin + window.location.pathname.replace(/app\.html|config\.html|routines\.html|index\.html/, '') + 'app.html?verified=true';
                                const { data: signUpData, error: signUpErr } = await supabaseClient.auth.signUp({
                                    email: email,
                                    password: password,
                                    options: {
                                        emailRedirectTo: redirectUrl
                                    }
                                });

                                if (signUpErr) {
                                    return new Response(JSON.stringify({ success: false, error: signUpErr.message }));
                                }

                                const { error: profileErr } = await supabaseClient
                                    .from('user_profiles')
                                    .insert({
                                        id: signUpData.user.id,
                                        username: username,
                                        email: email,
                                        profile_data: null,
                                        weight_history: [],
                                        meals: {},
                                        routines: [],
                                        workout_logs: []
                                    });

                                if (profileErr) {
                                    return new Response(JSON.stringify({ success: false, error: "Error al crear perfil de usuario: " + profileErr.message }));
                                }

                                // If email confirmation is disabled in Supabase panel, session is populated immediately
                                if (signUpData.session) {
                                    localStorage.setItem('logged_in_user', username);
                                    localStorage.setItem('logged_in_user_id', signUpData.user.id);
                                    localStorage.setItem('logged_in_user_email', email);

                                    return new Response(JSON.stringify({
                                        success: true,
                                        message: "¡Registro exitoso! Iniciando sesión...",
                                        autoLogin: true
                                    }));
                                }

                                return new Response(JSON.stringify({ 
                                    success: true, 
                                    message: "Se ha enviado un correo electrónico de confirmación a " + email + ". Por favor, confirma tu cuenta para poder iniciar sesión." 
                                }));
                            } catch (err) {
                                return new Response(JSON.stringify({ success: false, error: err.message || "Error inesperado" }));
                            }
                        })();
                    } else {
                        const users = getUsers();
                        if (users[username]) {
                            return Promise.resolve(new Response(JSON.stringify({ success: false, error: "El usuario ya existe" })));
                        }

                        users[username] = { email, password, avatar: '' };
                        saveUsers(users);
                        
                        return Promise.resolve(new Response(JSON.stringify({ success: true, message: "Registro completado con éxito. Ahora inicia sesión." })));
                    }
                }

                if (activeAction === 'forgot_password') {
                    const email = bodyData.email.trim().toLowerCase();
                    if (!email) {
                        return Promise.resolve(new Response(JSON.stringify({ success: false, error: "El correo es requerido" })));
                    }

                    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                        return (async () => {
                            try {
                                const redirectUrl = window.location.origin + window.location.pathname;
                                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                                    redirectTo: redirectUrl
                                });
                                if (error) {
                                    return new Response(JSON.stringify({ success: false, error: error.message }));
                                }
                                return new Response(JSON.stringify({ success: true, message: "Se ha enviado un enlace de recuperación a tu correo electrónico." }));
                            } catch (err) {
                                return new Response(JSON.stringify({ success: false, error: err.message || "Error inesperado" }));
                            }
                        })();
                    } else {
                        const users = getUsers();
                        const foundUser = Object.keys(users).find(uname => users[uname].email === email);
                        if (!foundUser) {
                            return Promise.resolve(new Response(JSON.stringify({ success: false, error: "No existe ninguna cuenta con ese correo electrónico." })));
                        }
                        return Promise.resolve(new Response(JSON.stringify({ success: true, message: "Modo Local: Enlace de recuperación simulado enviado a " + email })));
                    }
                }

                if (activeAction === 'reset_password') {
                    const password = bodyData.password;
                    if (!password) {
                        return Promise.resolve(new Response(JSON.stringify({ success: false, error: "La contraseña es requerida" })));
                    }

                    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                        return (async () => {
                            try {
                                const { error } = await supabaseClient.auth.updateUser({
                                    password: password
                                });
                                if (error) {
                                    return new Response(JSON.stringify({ success: false, error: error.message }));
                                }
                                return new Response(JSON.stringify({ success: true }));
                            } catch (err) {
                                return new Response(JSON.stringify({ success: false, error: err.message || "Error inesperado" }));
                            }
                        })();
                    } else {
                        const users = getUsers();
                        if (users['invitado']) {
                            users['invitado'].password = password;
                        }
                        if (users['max']) {
                            users['max'].password = password;
                        }
                        saveUsers(users);
                        return Promise.resolve(new Response(JSON.stringify({ success: true })));
                    }
                }

                if (activeAction === 'login') {
                    const usernameOrEmail = bodyData.username.trim().toLowerCase();
                    const password = bodyData.password;

                    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                        return (async () => {
                            try {
                                let targetEmail = usernameOrEmail;
                                let resolvedUsername = '';

                                if (!usernameOrEmail.includes('@')) {
                                    const { data: profileRows, error: findErr } = await supabaseClient
                                        .from('user_profiles')
                                        .select('email, username')
                                        .eq('username', usernameOrEmail);

                                    if (findErr) {
                                        return new Response(JSON.stringify({ success: false, error: "Error al buscar usuario: " + findErr.message }));
                                    }
                                    if (!profileRows || profileRows.length === 0) {
                                        return new Response(JSON.stringify({ success: false, error: "Usuario o contraseña incorrectos" }));
                                    }
                                    targetEmail = profileRows[0].email;
                                    resolvedUsername = profileRows[0].username;
                                } else {
                                    const { data: profileRows } = await supabaseClient
                                        .from('user_profiles')
                                        .select('username')
                                        .eq('email', usernameOrEmail);
                                    if (profileRows && profileRows.length > 0) {
                                        resolvedUsername = profileRows[0].username;
                                    } else {
                                        resolvedUsername = usernameOrEmail.split('@')[0];
                                    }
                                }

                                const { data: signInData, error: signInErr } = await supabaseClient.auth.signInWithPassword({
                                    email: targetEmail,
                                    password: password
                                });

                                if (signInErr) {
                                    let errorMsg = signInErr.message;
                                    if (errorMsg.toLowerCase().includes("email not confirmed")) {
                                        errorMsg = "Por favor confirma tu cuenta haciendo clic en el enlace enviado a tu correo antes de iniciar sesión.";
                                    } else if (errorMsg.toLowerCase().includes("invalid login credentials")) {
                                        errorMsg = "Usuario o contraseña incorrectos";
                                    }
                                    return new Response(JSON.stringify({ success: false, error: errorMsg }));
                                }

                                const { data: profileRow } = await supabaseClient
                                    .from('user_profiles')
                                    .select('*')
                                    .eq('id', signInData.user.id)
                                    .single();

                                if (profileRow) {
                                    localStorage.setItem('logged_in_user', resolvedUsername);
                                    localStorage.setItem('logged_in_user_id', signInData.user.id);
                                    localStorage.setItem('logged_in_user_email', targetEmail);
                                    localStorage.setItem('user_avatar', (profileRow.profile_data && profileRow.profile_data.avatar) || '');
                                    
                                    if (profileRow.profile_data) {
                                        localStorage.setItem('profile_' + resolvedUsername, JSON.stringify(profileRow.profile_data));
                                    } else {
                                        localStorage.removeItem('profile_' + resolvedUsername);
                                    }
                                    localStorage.setItem('weight_history_' + resolvedUsername, JSON.stringify(profileRow.weight_history || []));
                                    localStorage.setItem('meals_' + resolvedUsername, JSON.stringify(profileRow.meals || {}));
                                    localStorage.setItem('routines_' + resolvedUsername, JSON.stringify(profileRow.routines || []));
                                    localStorage.setItem('workout_logs_' + resolvedUsername, JSON.stringify(profileRow.workout_logs || []));
                                }

                                currentUsername = resolvedUsername;
                                setTimeout(() => { window.location.href = 'app.html'; }, 500);
                                return new Response(JSON.stringify({ success: true, username: resolvedUsername }));
                            } catch (err) {
                                return new Response(JSON.stringify({ success: false, error: err.message || "Error inesperado" }));
                            }
                        })();
                    } else {
                        const username = usernameOrEmail;
                        const users = getUsers();
                        const user = users[username];
                        
                        if (!user || user.password !== password) {
                            return Promise.resolve(new Response(JSON.stringify({ success: false, error: "Usuario o contraseña incorrectos" })));
                        }

                        localStorage.setItem('logged_in_user', username);
                        localStorage.setItem('user_avatar', user.avatar || '');
                        currentUsername = username;
                        
                        setTimeout(() => { window.location.href = 'app.html'; }, 500);
                        return Promise.resolve(new Response(JSON.stringify({ success: true, username })));
                    }
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
                    const todayStr = getLocalDateString();
                    const allMeals = getMeals(currentUsername);
                    const section = bodyData.section;
                    
                    const carbs = parseFloat(bodyData.carbs) || 0;
                    const proteins = parseFloat(bodyData.proteins) || 0;
                    const fats = parseFloat(bodyData.fats) || 0;
                    const kcal = Math.round((proteins * 4) + (carbs * 4) + (fats * 9));
                    
                    const newFood = {
                        id: String(Date.now()),
                        name: bodyData.name,
                        carbs: carbs,
                        proteins: proteins,
                        fats: fats,
                        kcal: kcal
                    };
                    
                    if (!allMeals[todayStr]) {
                        allMeals[todayStr] = {
                            desayuno: [],
                            almuerzo: [],
                            merienda: [],
                            agregar_comidas: []
                        };
                    }
                    if (!allMeals[todayStr][section]) {
                        allMeals[todayStr][section] = [];
                    }
                    allMeals[todayStr][section].push(newFood);
                    saveMeals(currentUsername, allMeals);
                    
                    return Promise.resolve(new Response(JSON.stringify({ success: true, food: newFood })));
                }

                if (ajax === 'delete_food') {
                    const todayStr = getLocalDateString();
                    const allMeals = getMeals(currentUsername);
                    const section = bodyData.section;
                    const foodId = bodyData.id;
                    
                    if (allMeals[todayStr] && allMeals[todayStr][section]) {
                        allMeals[todayStr][section] = allMeals[todayStr][section].filter(m => String(m.id) !== String(foodId));
                    }
                    
                    saveMeals(currentUsername, allMeals);
                    return Promise.resolve(new Response(JSON.stringify({ success: true })));
                }

                if (ajax === 'update_weight') {
                    const weightVal = parseFloat(bodyData.weight);
                    if (!weightVal || isNaN(weightVal)) {
                        return Promise.resolve(new Response(JSON.stringify({ success: false, error: "Peso inválido" })));
                    }
                    
                    const profile = getProfile(currentUsername);
                    if (!profile) {
                        return Promise.resolve(new Response(JSON.stringify({ success: false, error: "Perfil no encontrado" })));
                    }

                    // Recalcular perfil
                    profile.weight = weightVal;
                    
                    const weight_kg = (profile.unit_weight === 'lbs') ? (weightVal * 0.453592) : weightVal;
                    const height_cm = (profile.unit_height === 'in') ? (profile.height * 2.54) : profile.height;

                    let tmb = (profile.gender === 'male') 
                        ? (10 * weight_kg) + (6.25 * height_cm) - (5 * profile.age) + 5
                        : (10 * weight_kg) + (6.25 * height_cm) - (5 * profile.age) - 161;

                    const multipliers = { bajo: 1.2, moderado: 1.375, alto: 1.55, muy_alto: 1.725 };
                    const mult = multipliers[profile.activity] || 1.2;
                    const getd = tmb * mult;

                    let target_calories = getd;
                    if (profile.goal === 'perdida_peso' || profile.goal === 'definicion') {
                        target_calories = getd - 400;
                    } else if (profile.goal === 'subida_peso' || profile.goal === 'deportivo') {
                        target_calories = getd + 400;
                    }

                    let is_capped = false;
                    if (profile.gender === 'female' && target_calories < 1200) {
                        target_calories = 1200;
                        is_capped = true;
                    } else if (profile.gender === 'male' && target_calories < 1500) {
                        target_calories = 1500;
                        is_capped = true;
                    }

                    const protein_g = 1.8 * weight_kg;
                    const protein_kcal = protein_g * 4;
                    const fat_kcal = target_calories * 0.25;
                    const fat_g = fat_kcal / 9;
                    const carb_kcal = Math.max(0, target_calories - protein_kcal - fat_kcal);
                    const carb_g = carb_kcal / 4;

                    profile.tmb = Math.round(tmb);
                    profile.getd = Math.round(getd);
                    profile.target_calories = Math.round(target_calories);
                    profile.is_capped = is_capped;
                    profile.macros = {
                        protein_g: Math.round(protein_g * 10) / 10,
                        fat_g: Math.round(fat_g * 10) / 10,
                        carb_g: Math.round(carb_g * 10) / 10
                    };

                    saveProfile(currentUsername, profile);

                    const history = getWeightHistory(currentUsername);
                    history.push({
                        weight: weightVal,
                        date: getLocalDateString()
                    });
                    saveWeightHistory(currentUsername, history);

                    return Promise.resolve(new Response(JSON.stringify({
                        success: true,
                        weight_history: history,
                        profile: profile
                    })));
                }
            }

            // GET actions
            if (activeAction === 'logout') {
                localStorage.removeItem('logged_in_user');
                localStorage.removeItem('logged_in_user_id');
                localStorage.removeItem('user_avatar');
                currentUsername = null;
                if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                    return (async () => {
                        await supabaseClient.auth.signOut();
                        window.location.href = 'app.html';
                        return new Response(JSON.stringify({ success: true }));
                    })();
                } else {
                    window.location.href = 'app.html';
                    return Promise.resolve(new Response(JSON.stringify({ success: true })));
                }
            }

            if (ajax === 'search_food') {
                const query = getQueryParam('q', urlStr);
                return searchFatSecretFood(query)
                    .then(foods => {
                        return new Response(JSON.stringify({
                            success: true,
                            foods: foods
                        }));
                    })
                    .catch(err => {
                        console.error("FatSecret API search error:", err);
                        return new Response(JSON.stringify({
                            success: false,
                            error: err.message || "Error al buscar alimento"
                        }));
                    });
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
                bodyData.date = new Date().toISOString();
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
        // Define global showAuthForm
        window.showAuthForm = function(formId) {
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const forgotForm = document.getElementById('forgotPasswordForm');
            const resetForm = document.getElementById('resetPasswordForm');
            const tabs = document.querySelector('.auth-tabs');

            if (tabs) {
                if (formId === 'login' || formId === 'register') {
                    tabs.style.display = 'flex';
                } else {
                    tabs.style.display = 'none';
                }
            }

            if (loginForm) loginForm.style.display = formId === 'login' ? 'block' : 'none';
            if (registerForm) registerForm.style.display = formId === 'register' ? 'block' : 'none';
            if (forgotForm) forgotForm.style.display = formId === 'forgot' ? 'block' : 'none';
            if (resetForm) resetForm.style.display = formId === 'reset' ? 'block' : 'none';

            const tabBtns = document.querySelectorAll('.auth-tab');
            if (tabBtns.length >= 2) {
                if (formId === 'login') {
                    tabBtns[0].classList.add('active');
                    tabBtns[1].classList.remove('active');
                } else if (formId === 'register') {
                    tabBtns[0].classList.remove('active');
                    tabBtns[1].classList.add('active');
                }
            }
        };

        window.switchAuthTab = function(tab) {
            window.showAuthForm(tab);
        };

        // Parse hash params for recovery flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.get('type') === 'recovery' || window.location.hash.includes('type=recovery')) {
            setTimeout(() => {
                if (typeof window.showAuthForm === 'function') {
                    window.showAuthForm('reset');
                }
            }, 100);
        }

        // Intercept client-side URL action=logout
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'logout') {
            localStorage.removeItem('logged_in_user');
            localStorage.removeItem('logged_in_user_id');
            localStorage.removeItem('user_avatar');
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                supabaseClient.auth.signOut().then(() => {
                    window.location.href = 'app.html';
                });
            } else {
                window.location.href = 'app.html';
            }
            return;
        }

        if (urlParams.get('verified') === 'true') {
            setTimeout(() => {
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    const successDiv = document.createElement('div');
                    successDiv.className = 'auth-alert success';
                    successDiv.style.display = 'block';
                    successDiv.innerText = '¡Correo confirmado con éxito! Ya puedes iniciar sesión.';
                    loginForm.insertBefore(successDiv, loginForm.firstChild);
                }
            }, 100);
        }

        // Initialize Default Demo Users and Profile if empty or missing
        const users = getUsers();
        let usersUpdated = false;
        if (!users['invitado']) {
            users['invitado'] = { email: 'invitado@entrenaconmax.com', password: '123', avatar: '' };
            usersUpdated = true;
        }
        if (!users['max']) {
            users['max'] = { email: 'max@entrenaconmax.com', password: 'admin', avatar: '' };
            usersUpdated = true;
        }
        if (usersUpdated) {
            saveUsers(users);
        }

        // Initialize default profiles if they don't exist
        if (!getProfile('invitado')) {
            const profileData = {
                weight: 75,
                height: 175,
                unit_weight: 'kg',
                unit_height: 'cm',
                gender: 'male',
                age: 25,
                activity: 'moderado',
                goal: 'mantenimiento',
                body_fat: '13-15%',
                target_weight: 75,
                tmb: 1700,
                getd: 2338,
                target_calories: 2338,
                is_capped: false,
                macros: { protein_g: 135, fat_g: 65, carb_g: 300 }
            };
            saveProfile('invitado', profileData);
            saveWeightHistory('invitado', [
                { weight: 77.2, date: '2026-06-01' },
                { weight: 76.5, date: '2026-06-08' },
                { weight: 75.0, date: getLocalDateString() }
            ]);
        }

        if (!getProfile('max')) {
            const profileData = {
                weight: 80,
                height: 180,
                unit_weight: 'kg',
                unit_height: 'cm',
                gender: 'male',
                age: 28,
                activity: 'alto',
                goal: 'subida_peso',
                body_fat: '11-12%',
                target_weight: 85,
                tmb: 1820,
                getd: 2821,
                target_calories: 3221,
                is_capped: false,
                macros: { protein_g: 160, fat_g: 90, carb_g: 440 }
            };
            saveProfile('max', profileData);
            saveWeightHistory('max', [
                { weight: 78.5, date: '2026-06-01' },
                { weight: 79.2, date: '2026-06-08' },
                { weight: 80.0, date: getLocalDateString() }
            ]);
        }

        // Initialize default routines and sample logs
        if (getRoutines('invitado').length === 0) {
            const routines = [
                {
                    id: 100001,
                    title: 'Fuerza General Inicial',
                    description: 'sentadilla con barra (squats), press militar con barra',
                    exercises: [
                        {
                            name: 'sentadilla con barra (squats)',
                            rest_time: 120,
                            use_discs: true,
                            bar_weight: 20,
                            sets: [
                                { set_number: 1, weight: 40, reps: '12' },
                                { set_number: 2, weight: 50, reps: '10' }
                            ]
                        },
                        {
                            name: 'press militar con barra',
                            rest_time: 90,
                            use_discs: true,
                            bar_weight: 15,
                            sets: [
                                { set_number: 1, weight: 25, reps: '10' },
                                { set_number: 2, weight: 30, reps: '8' }
                            ]
                        }
                    ]
                }
            ];
            saveRoutines('invitado', routines);
            
            const logs = [
                {
                    id: 200001,
                    routine_id: 100001,
                    routine_title: 'Fuerza General Inicial',
                    duration: 2400,
                    volume: 1320,
                    total_sets: 4,
                    total_reps: 40,
                    created_at: '2026-06-10T10:00:00.000Z',
                    date: '2026-06-10T10:00:00.000Z',
                    exercises: []
                },
                {
                    id: 200002,
                    routine_id: 100001,
                    routine_title: 'Fuerza General Inicial',
                    duration: 2300,
                    volume: 1450,
                    total_sets: 4,
                    total_reps: 40,
                    created_at: '2026-06-14T10:00:00.000Z',
                    date: '2026-06-14T10:00:00.000Z',
                    exercises: []
                },
                {
                    id: 200003,
                    routine_id: 100001,
                    routine_title: 'Fuerza General Inicial',
                    duration: 2200,
                    volume: 1560,
                    total_sets: 4,
                    total_reps: 40,
                    created_at: new Date().toISOString(),
                    date: new Date().toISOString(),
                    exercises: []
                }
            ];
            saveWorkoutLogs('invitado', logs);
        }

        if (getRoutines('max').length === 0) {
            const routines = [
                {
                    id: 100002,
                    title: 'Pecho y Tríceps Leyenda',
                    description: 'banca con barra (bench press), extensiones de tríceps en polea',
                    exercises: [
                        {
                            name: 'banca con barra (bench press)',
                            rest_time: 90,
                            use_discs: true,
                            bar_weight: 20,
                            sets: [
                                { set_number: 1, weight: 60, reps: '12' },
                                { set_number: 2, weight: 80, reps: '10' },
                                { set_number: 3, weight: 100, reps: '8' }
                            ]
                        },
                        {
                            name: 'extensiones de tríceps en polea',
                            rest_time: 60,
                            use_discs: false,
                            bar_weight: 0,
                            sets: [
                                { set_number: 1, weight: 25, reps: '15' },
                                { set_number: 2, weight: 30, reps: '12' },
                                { set_number: 3, weight: 35, reps: '10' }
                            ]
                        }
                    ]
                },
                {
                    id: 100003,
                    title: 'Espalda y Bíceps Brutal',
                    description: 'remo con barra, curl de biceps con barra',
                    exercises: [
                        {
                            name: 'remo con barra',
                            rest_time: 90,
                            use_discs: true,
                            bar_weight: 20,
                            sets: [
                                { set_number: 1, weight: 50, reps: '12' },
                                { set_number: 2, weight: 60, reps: '10' },
                                { set_number: 3, weight: 70, reps: '8' }
                            ]
                        },
                        {
                            name: 'curl de biceps con barra',
                            rest_time: 60,
                            use_discs: true,
                            bar_weight: 7.5,
                            sets: [
                                { set_number: 1, weight: 27.5, reps: '12' },
                                { set_number: 2, weight: 32.5, reps: '10' }
                            ]
                        }
                    ]
                }
            ];
            saveRoutines('max', routines);

            const logs = [
                {
                    id: 200004,
                    routine_id: 100002,
                    routine_title: 'Pecho y Tríceps Leyenda',
                    duration: 3200,
                    volume: 2450,
                    total_sets: 6,
                    total_reps: 67,
                    created_at: '2026-06-08T18:00:00.000Z',
                    date: '2026-06-08T18:00:00.000Z',
                    exercises: []
                },
                {
                    id: 200005,
                    routine_id: 100002,
                    routine_title: 'Pecho y Tríceps Leyenda',
                    duration: 3100,
                    volume: 2680,
                    total_sets: 6,
                    total_reps: 67,
                    created_at: '2026-06-12T18:00:00.000Z',
                    date: '2026-06-12T18:00:00.000Z',
                    exercises: []
                },
                {
                    id: 200006,
                    routine_id: 100002,
                    routine_title: 'Pecho y Tríceps Leyenda',
                    duration: 3000,
                    volume: 2900,
                    total_sets: 6,
                    total_reps: 67,
                    created_at: new Date().toISOString(),
                    date: new Date().toISOString(),
                    exercises: []
                }
            ];
            saveWorkoutLogs('max', logs);
        }

        if (!currentUsername) {
            // Toggle navbar links
            document.querySelectorAll('.nav-auth-only').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.nav-guest-only').forEach(el => el.style.display = 'block');

            // Unauthenticated view
            const path = window.location.pathname.toLowerCase();
            if (path.includes('app.html')) {
                // Show login state
                const outEl = document.getElementById('state-logged-out');
                if (outEl) outEl.style.display = 'block';
                const dashEl = document.getElementById('state-dashboard');
                if (dashEl) dashEl.style.display = 'none';
                const onEl = document.getElementById('state-onboarding');
                if (onEl) onEl.style.display = 'none';

                // Intercept Login Form
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    const handleLogin = async () => {
                        const formData = new FormData(loginForm);
                        // Remove existing alerts
                        const alerts = loginForm.parentElement.querySelectorAll('.auth-alert');
                        alerts.forEach(al => al.remove());

                        try {
                            const res = await fetch('app.php', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.success) {
                                const successDiv = document.createElement('div');
                                successDiv.className = 'auth-alert success';
                                successDiv.innerText = 'Sesión iniciada con éxito. Redirigiendo...';
                                loginForm.insertBefore(successDiv, loginForm.firstChild);
                                setTimeout(() => { window.location.href = 'app.html'; }, 1000);
                            } else {
                                const errDiv = document.createElement('div');
                                errDiv.className = 'auth-alert error';
                                errDiv.innerText = data.error || 'Usuario o contraseña incorrectos';
                                loginForm.insertBefore(errDiv, loginForm.firstChild);
                            }
                        } catch (err) {
                            console.error("Login error:", err);
                        }
                    };

                    loginForm.onsubmit = function(e) {
                        e.preventDefault();
                        handleLogin();
                    };
                    loginForm.submit = function() {
                        handleLogin();
                    };
                    loginForm.requestSubmit = function() {
                        handleLogin();
                    };
                }

                // Intercept Register Form
                const registerForm = document.getElementById('registerForm');
                if (registerForm) {
                    const handleRegister = async () => {
                        const formData = new FormData(registerForm);
                        // Remove existing alerts
                        const alerts = registerForm.parentElement.querySelectorAll('.auth-alert');
                        alerts.forEach(al => al.remove());

                        try {
                            const res = await fetch('app.php', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.success) {
                                const successDiv = document.createElement('div');
                                successDiv.className = 'auth-alert success';
                                successDiv.innerText = data.message || 'Registro completado con éxito. Ahora inicia sesión.';
                                registerForm.insertBefore(successDiv, registerForm.firstChild);

                                if (data.autoLogin) {
                                    // If auto-logged in, redirect directly to app.html
                                    setTimeout(() => { window.location.href = 'app.html'; }, 1500);
                                } else {
                                    setTimeout(() => {
                                        if (typeof switchAuthTab === 'function') {
                                            switchAuthTab('login');
                                        } else {
                                            const lForm = document.getElementById('loginForm');
                                            const rForm = document.getElementById('registerForm');
                                            const tabs = document.querySelectorAll('.auth-tab');
                                            if (lForm && rForm) {
                                                lForm.classList.add('active');
                                                rForm.classList.remove('active');
                                                if (tabs.length >= 2) {
                                                    tabs[0].classList.add('active');
                                                    tabs[1].classList.remove('active');
                                                }
                                            }
                                        }
                                    }, 3000);
                                }
                            } else {
                                const errDiv = document.createElement('div');
                                errDiv.className = 'auth-alert error';
                                errDiv.innerText = data.error || 'El usuario ya existe';
                                registerForm.insertBefore(errDiv, registerForm.firstChild);
                            }
                        } catch (err) {
                            console.error("Register error:", err);
                        }
                    };

                    registerForm.onsubmit = function(e) {
                        e.preventDefault();
                        handleRegister();
                    };
                    registerForm.submit = function() {
                        handleRegister();
                    };
                    registerForm.requestSubmit = function() {
                        handleRegister();
                    };
                }

                // Intercept Forgot Password Form
                const forgotForm = document.getElementById('forgotPasswordForm');
                if (forgotForm) {
                    const handleForgot = async () => {
                        const formData = new FormData(forgotForm);
                        // Remove existing alerts
                        const alerts = forgotForm.parentElement.querySelectorAll('.auth-alert');
                        alerts.forEach(al => al.remove());

                        try {
                            const res = await fetch('app.php', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.success) {
                                const successDiv = document.createElement('div');
                                successDiv.className = 'auth-alert success';
                                successDiv.innerText = data.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
                                forgotForm.insertBefore(successDiv, forgotForm.firstChild);
                            } else {
                                const errDiv = document.createElement('div');
                                errDiv.className = 'auth-alert error';
                                errDiv.innerText = data.error || 'Ocurrió un error al enviar el correo.';
                                forgotForm.insertBefore(errDiv, forgotForm.firstChild);
                            }
                        } catch (err) {
                            console.error("Forgot password error:", err);
                        }
                    };

                    forgotForm.onsubmit = function(e) {
                        e.preventDefault();
                        handleForgot();
                    };
                }

                // Intercept Reset Password Form
                const resetForm = document.getElementById('resetPasswordForm');
                if (resetForm) {
                    const handleReset = async () => {
                        const formData = new FormData(resetForm);
                        // Remove existing alerts
                        const alerts = resetForm.parentElement.querySelectorAll('.auth-alert');
                        alerts.forEach(al => al.remove());

                        try {
                            const res = await fetch('app.php', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.success) {
                                const successDiv = document.createElement('div');
                                successDiv.className = 'auth-alert success';
                                successDiv.innerText = 'Contraseña actualizada con éxito. Redirigiendo...';
                                resetForm.insertBefore(successDiv, resetForm.firstChild);

                                setTimeout(() => {
                                    window.location.hash = '';
                                    window.location.href = 'app.html';
                                }, 1500);
                            } else {
                                const errDiv = document.createElement('div');
                                errDiv.className = 'auth-alert error';
                                errDiv.innerText = data.error || 'Ocurrió un error al actualizar la contraseña.';
                                resetForm.insertBefore(errDiv, resetForm.firstChild);
                            }
                        } catch (err) {
                            console.error("Reset password error:", err);
                        }
                    };

                    resetForm.onsubmit = function(e) {
                        e.preventDefault();
                        handleReset();
                    };
                }
            } else if (path.includes('routines.html') || path.includes('config.html')) {
                // Redirect unauthorized page views
                window.location.href = 'app.html';
            }
            return;
        }

        // Authenticated view
        const profile = getProfile(currentUsername);
        const path = window.location.pathname.toLowerCase();

        // Toggle navbar links
        document.querySelectorAll('.nav-auth-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.nav-guest-only').forEach(el => el.style.display = 'none');

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
        if (path.includes('app.html')) {
            const outEl = document.getElementById('state-logged-out');
            if (outEl) outEl.style.display = 'none';

            if (!profile) {
                // Show Onboarding
                const onEl = document.getElementById('state-onboarding');
                if (onEl) onEl.style.display = 'block';
                const dashEl = document.getElementById('state-dashboard');
                if (dashEl) dashEl.style.display = 'none';
                
                // Override Onboarding form submit
                const obForm = document.getElementById('onboardingForm');
                if (obForm) {
                    obForm.action = '#';
                    const handleOnboardingSubmit = () => {
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

                    obForm.onsubmit = function(e) {
                        e.preventDefault();
                        handleOnboardingSubmit();
                    };
                    obForm.submit = function() {
                        handleOnboardingSubmit();
                    };
                    obForm.requestSubmit = function() {
                        handleOnboardingSubmit();
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
                const todayStr = getLocalDateString();
                const allMeals = getMeals(currentUsername);
                if (!allMeals[todayStr]) {
                    allMeals[todayStr] = {
                        desayuno: [],
                        almuerzo: [],
                        merienda: [],
                        agregar_comidas: []
                    };
                }
                const mealsToday = allMeals[todayStr];

                let today_kcal = 0;
                let today_proteins = 0;
                let today_carbs = 0;
                let today_fats = 0;

                Object.keys(mealsToday).forEach(sec => {
                    mealsToday[sec].forEach(m => {
                        today_kcal += m.kcal || 0;
                        today_proteins += m.proteins || 0;
                        today_carbs += m.carbs || 0;
                        today_fats += m.fats || 0;
                    });
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
                window.userDataMeals = mealsToday;
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
            if (emailEl) {
                emailEl.value = localStorage.getItem('logged_in_user_email') || (uRec && uRec.email) || '';
            }

            // Handle static file upload
            const fileInput = document.getElementById('avatarInput') || document.getElementById('avatar');
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
                    const avatarFile = fileInput ? fileInput.files[0] : null;

                    const users = getUsers();
                    const prevData = users[currentUsername] || { password: '' };

                    // Pre-check username uniqueness in Supabase if active
                    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                        (async () => {
                            if (newUname !== currentUsername) {
                                try {
                                    const { data: existing } = await supabaseClient
                                        .from('user_profiles')
                                        .select('id')
                                        .eq('username', newUname);
                                    if (existing && existing.length > 0) {
                                        alert("El nombre de usuario ya está en uso.");
                                        return;
                                    }
                                } catch (err) {
                                    console.error("Error checking username uniqueness:", err);
                                }
                            }
                            proceedToSave();
                        })();
                    } else {
                        if (newUname !== currentUsername && users[newUname]) {
                            alert("El nombre de usuario ya está en uso.");
                            return;
                        }
                        proceedToSave();
                    }

                    function proceedToSave() {
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
                    }

                    async function saveData() {
                        const avatarVal = localStorage.getItem('user_avatar') || '';
                        
                        delete users[currentUsername];
                        users[newUname] = { email: newEmail, password: prevData.password, avatar: avatarVal };
                        saveUsers(users);
                        localStorage.setItem('logged_in_user_email', newEmail);

                        // Save changes to Supabase in the background if active
                        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                            const userId = localStorage.getItem('logged_in_user_id');
                            if (userId) {
                                try {
                                    const { error } = await supabaseClient
                                        .from('user_profiles')
                                        .update({ username: newUname, email: newEmail })
                                        .eq('id', userId);
                                    if (error) {
                                        console.error("Error updating profile in Supabase:", error);
                                    }
                                } catch (err) {
                                    console.error("Exception updating profile in Supabase:", err);
                                }
                            }
                        }

                        // Migrate profile and histories to new username in localStorage
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
