// js/app.js - Lógica interactiva del cliente

document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    initHeaderScroll();
    initMobileMenu();
    initOnboarding();
    initDashboard();
    initRoutines();
});

// 1. Resplandor Interactivo que Sigue al Cursor
function initCursorGlow() {
    const glow = document.getElementById('bgGlow');
    if (!glow) return;
    
    // Posición inicial por defecto
    glow.style.setProperty('--mouse-x', '50%');
    glow.style.setProperty('--mouse-y', '50%');
    
    document.addEventListener('mousemove', (e) => {
        glow.style.setProperty('--mouse-x', `${e.clientX}px`);
        glow.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
}

// 2. Cabecera Fija (Sticky Navbar Transition)
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 3. Menú de Hamburguesa para Móviles
function initMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.getElementById('navLinks');
    
    if (!mobileMenu || !navLinks) return;
    
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-active');
        mobileMenu.classList.toggle('active');
        
        // Animación del botón hamburguesa
        const spans = mobileMenu.querySelectorAll('span');
        if (mobileMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// 4. Lógica de Pestañas de Login/Registro
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    if (!loginForm || !registerForm) return;
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// 5. Formulario Onboarding Paso a Paso (Stepper)
let currentStep = 1;
function initOnboarding() {
    const onboardingForm = document.getElementById('onboardingForm');
    if (!onboardingForm) return;
    
    updateActivityTexts(); // Ejecutar inicialmente
}

function selectOption(name, cardId) {
    // Desmarcar hermanos del contenedor
    const container = document.getElementById(`${name}${cardId}`).parentElement;
    const cards = container.querySelectorAll('.option-card');
    cards.forEach(card => card.classList.remove('selected'));
    
    // Seleccionar actual
    const selectedCard = document.getElementById(`${name}${cardId}`);
    selectedCard.classList.add('selected');
    
    // Marcar radio button
    const radio = selectedCard.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
}

function setUnit(type, unit) {
    const input = document.getElementById(`unit_${type}_input`);
    if (!input) return;
    
    input.value = unit;
    
    // Actualizar botones activos
    const isWeight = type === 'weight';
    const btnKg = document.getElementById('unitWeightKg');
    const btnLbs = document.getElementById('unitWeightLbs');
    const btnCm = document.getElementById('unitHeightCm');
    const btnIn = document.getElementById('unitHeightIn');
    
    if (isWeight) {
        if (unit === 'kg') {
            btnKg.classList.add('active');
            btnLbs.classList.remove('active');
            document.getElementById('weight_input').placeholder = 'KG';
        } else {
            btnLbs.classList.add('active');
            btnKg.classList.remove('active');
            document.getElementById('weight_input').placeholder = 'LBS';
        }
    } else {
        if (unit === 'cm') {
            btnCm.classList.add('active');
            btnIn.classList.remove('active');
            document.getElementById('height_input').placeholder = 'CM';
        } else {
            btnIn.classList.add('active');
            btnCm.classList.remove('active');
            document.getElementById('height_input').placeholder = 'IN';
        }
    }
}

// Adaptación dinámica de textos de actividad física según objetivo
function updateActivityTexts() {
    const goalOption = document.querySelector('input[name="goal"]:checked');
    if (!goalOption) return;
    
    const goal = goalOption.value;
    const isWeightLoss = (goal === 'perdida_peso' || goal === 'definicion');
    
    const lowDesc = document.getElementById('actBajoDesc');
    const modDesc = document.getElementById('actModeradoDesc');
    const highDesc = document.getElementById('actAltoDesc');
    const veryHighDesc = document.getElementById('actMuyAltoDesc');
    
    if (!lowDesc) return; // Si no estamos en onboarding
    
    if (isWeightLoss) {
        lowDesc.innerText = "Trabajo de escritorio, menos de 5,000 pasos al día. No entrena.";
        modDesc.innerText = "3-4 días de caminatas o cardio ligero + actividades diarias comunes.";
        highDesc.innerText = "5+ días de ejercicio (Cardio combinado con circuitos de fuerza).";
        veryHighDesc.innerText = "Atletas, entrenamientos dobles diarios o trabajo físico muy pesado.";
    } else {
        lowDesc.innerText = "Trabajo de escritorio, sin estímulo de fuerza actual.";
        modDesc.innerText = "3 días de entrenamiento de fuerza enfocado (Rutina de cuerpo completo).";
        highDesc.innerText = "4-5 días de entrenamiento de fuerza intenso (Rutinas divididas por músculos).";
        veryHighDesc.innerText = "Atletas de fuerza o culturistas en fases de volumen de alta demanda.";
    }
}

function validateStep(step) {
    const stepEl = document.getElementById(`step${step}`);
    if (!stepEl) return true;
    
    const inputs = stepEl.querySelectorAll('input[required]');
    let valid = true;
    
    inputs.forEach(input => {
        if (!input.value || input.value <= 0) {
            input.style.borderColor = 'var(--primary)';
            valid = false;
        } else {
            input.style.borderColor = 'var(--border)';
        }
    });
    
    return valid;
}

function moveStep(dir) {
    if (dir === 1 && !validateStep(currentStep)) {
        alert("Por favor rellena todos los campos con valores válidos.");
        return;
    }
    
    const currentStepEl = document.getElementById(`step${currentStep}`);
    const nextStepEl = document.getElementById(`step${currentStep + dir}`);
    
    if (!nextStepEl) {
        // Si no hay siguiente paso, enviar el formulario
        if (dir === 1) {
            const onboardingForm = document.getElementById('onboardingForm');
            if (typeof onboardingForm.requestSubmit === 'function') {
                onboardingForm.requestSubmit();
            } else {
                onboardingForm.submit();
            }
        }
        return;
    }
    
    currentStepEl.classList.remove('active');
    nextStepEl.classList.add('active');
    
    // Actualizar dots de progreso
    document.getElementById(`dot${currentStep}`).classList.remove('active');
    currentStep += dir;
    document.getElementById(`dot${currentStep}`).classList.add('active');
    
    // Actualizar visibilidad de botones
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    
    if (currentStep === 1) {
        btnPrev.style.visibility = 'hidden';
    } else {
        btnPrev.style.visibility = 'visible';
    }
    
    if (currentStep === 3) {
        btnNext.innerText = 'Guardar y Finalizar';
    } else {
        btnNext.innerText = 'Siguiente';
    }
}

// 6. Lógica de Dashboard Principal (Calorías, Comidas y Peso)
let modalSection = '';
function initDashboard() {
    if (!document.getElementById('consumedKcal')) return; // No en Dashboard
    
    renderCalorieCircle();
    renderMacrosBars();
    renderWeightChart(window.userWeightHistory);
    renderAllMeals();
    initModalEvents();
}

// Renderizar el anillo de calorías circular
function renderCalorieCircle() {
    const consumed = parseInt(document.getElementById('consumedKcal').innerText) || 0;
    const goal = parseInt(document.getElementById('goalKcal').innerText) || 2000;
    const circle = document.getElementById('calorieProgress');
    
    if (!circle) return;
    
    // Perímetro del círculo es 2 * PI * r = 2 * 3.14159 * 110 = 691.15
    const circumference = 691.15;
    const percent = Math.min(1, consumed / goal);
    const offset = circumference - (percent * circumference);
    
    circle.style.strokeDashoffset = offset;
}

// Renderizar las barras horizontales de macros
function renderMacrosBars() {
    const macroTypes = ['Prot', 'Carb', 'Fat'];
    macroTypes.forEach(type => {
        const curr = parseFloat(document.getElementById(`curr${type}`).innerText) || 0;
        const goal = parseFloat(document.getElementById(`goal${type}`).innerText) || 1;
        const fill = document.getElementById(`bar${type}`);
        if (fill) {
            const percent = Math.min(100, (curr / goal) * 100);
            fill.style.width = `${percent}%`;
        }
    });
}

// Mostrar comidas por sección
function renderAllMeals() {
    const sections = ['desayuno', 'almuerzo', 'merienda', 'agregar_comidas'];
    sections.forEach(sec => {
        const list = document.getElementById(`list${capitalize(sec)}`);
        const kcalSpan = document.getElementById(`kcalVal${capitalize(sec)}`);
        if (!list) return;
        
        list.innerHTML = '';
        let totalKcal = 0;
        
        const foods = window.userDataMeals[sec] || [];
        foods.forEach(food => {
            totalKcal += food.kcal;
            
            const li = document.createElement('li');
            li.className = 'meal-food-item';
            li.innerHTML = `
                <div>
                    <div class="food-details-name">${escapeHtml(food.name)}</div>
                    <div class="food-details-macros">P: ${food.proteins}g | C: ${food.carbs}g | G: ${food.fats}g</div>
                </div>
                <div class="food-item-right">
                    <div class="food-kcal">${food.kcal} kcal</div>
                    <button class="btn-delete-food" onclick="deleteFood('${sec}', '${food.id}')" title="Eliminar Alimento">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            list.appendChild(li);
        });
        
        kcalSpan.innerText = totalKcal;
    });
}

// Eventos de cálculo interactivo en el modal (ahora integrado con FatSecret API)
function initModalEvents() {
    // Los cálculos se manejan dinámicamente al seleccionar y cambiar cantidad
}

let currentSelectedFood = null;

let searchFoodTimeout = null;
function debouncedSearchFoodAPI() {
    clearTimeout(searchFoodTimeout);
    searchFoodTimeout = setTimeout(() => {
        searchFoodAPI(true);
    }, 300);
}

function searchFoodAPI(isAuto = false) {
    const query = document.getElementById('food_search').value.trim();
    const dropdown = document.getElementById('food_search_results');
    
    if (query.length < 2) {
        if (!isAuto) {
            alert("Escribe al menos 2 caracteres para buscar.");
        }
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
    }
    
    dropdown.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted);">Buscando...</div>';
    dropdown.style.display = 'block';
    
    fetch(`app.php?ajax=search_food&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        dropdown.innerHTML = '';
        if (data.success && data.foods && data.foods.length > 0) {
            data.foods.forEach(food => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.onclick = () => selectFoodFromSearch(food);
                
                item.innerHTML = `
                    <div class="search-result-title">${escapeHtml(food.food_name)}</div>
                    <div class="search-result-desc">${escapeHtml(food.food_description)}</div>
                `;
                dropdown.appendChild(item);
            });
        } else {
            dropdown.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted);">No se encontraron alimentos.</div>';
        }
    })
    .catch(err => {
        console.error(err);
        dropdown.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--primary);">Error en la búsqueda.</div>';
    });
}

function selectFoodFromSearch(food) {
    document.getElementById('food_search_results').style.display = 'none';
    
    currentSelectedFood = food;
    
    const desc = food.food_description;
    const caloriesMatch = desc.match(/Calories:\s*(\d+(?:\.\d+)?)/i);
    const fatMatch = desc.match(/Fat:\s*(\d+(?:\.\d+)?)/i);
    const carbsMatch = desc.match(/Carbs:\s*(\d+(?:\.\d+)?)/i);
    const proteinMatch = desc.match(/Protein:\s*(\d+(?:\.\d+)?)/i);
    
    const baseCal = caloriesMatch ? parseFloat(caloriesMatch[1]) : 0;
    const baseFat = fatMatch ? parseFloat(fatMatch[1]) : 0;
    const baseCarb = carbsMatch ? parseFloat(carbsMatch[1]) : 0;
    const baseProt = proteinMatch ? parseFloat(proteinMatch[1]) : 0;
    
    let baseQty = 100;
    let unit = 'g';
    let isServing = false;
    
    if (desc.toLowerCase().includes('per 1 serving') || desc.toLowerCase().includes('per 1 portion')) {
        baseQty = 1;
        unit = 'porción';
        isServing = true;
    } else {
        const qtyMatch = desc.match(/Per\s*(\d+)\s*(g|ml)/i);
        if (qtyMatch) {
            baseQty = parseFloat(qtyMatch[1]);
            unit = qtyMatch[2];
        }
    }
    
    currentSelectedFood.nutrition = {
        baseQty,
        unit,
        isServing,
        calories: baseCal,
        fat: baseFat,
        carbs: baseCarb,
        protein: baseProt
    };
    
    document.getElementById('selected_food_name').innerText = food.food_name;
    document.getElementById('selected_food_base_desc').innerText = `Valores base: ${desc}`;
    document.getElementById('quantity_label').innerText = `Cantidad a consumir (${unit})`;
    document.getElementById('food_quantity').value = baseQty;
    
    document.getElementById('selected_food_detail').style.display = 'block';
    
    recalculateSelectedMacros();
}

function recalculateSelectedMacros() {
    if (!currentSelectedFood || !currentSelectedFood.nutrition) return;
    
    const qtyInput = parseFloat(document.getElementById('food_quantity').value) || 0;
    const n = currentSelectedFood.nutrition;
    
    const factor = qtyInput / n.baseQty;
    
    const scaledCal = Math.round(n.calories * factor);
    const scaledCarb = parseFloat((n.carbs * factor).toFixed(1));
    const scaledProt = parseFloat((n.protein * factor).toFixed(1));
    const scaledFat = parseFloat((n.fats ?? n.fat * factor).toFixed(1));
    
    const unitText = n.isServing ? (qtyInput === 1 ? 'porción' : 'porciones') : n.unit;
    document.getElementById('food_name').value = `${currentSelectedFood.food_name} (${qtyInput} ${unitText})`;
    document.getElementById('food_carbs').value = scaledCarb;
    document.getElementById('food_proteins').value = scaledProt;
    document.getElementById('food_fats').value = scaledFat;
    
    document.getElementById('modalMacrosCalc').innerText = `P: ${scaledProt}g | C: ${scaledCarb}g | G: ${scaledFat}g`;
    document.getElementById('modalCalorieCalc').innerText = `${scaledCal} kcal`;
}

// Controladores del Modal
function openAddFoodModal(section) {
    modalSection = section;
    document.getElementById('modalSectionInput').value = section;
    document.getElementById('modalTitleText').innerText = `Añadir a ${capitalize(section)}`;
    
    document.getElementById('addFoodForm').reset();
    
    document.getElementById('food_search').value = '';
    document.getElementById('food_search_results').innerHTML = '';
    document.getElementById('food_search_results').style.display = 'none';
    document.getElementById('selected_food_detail').style.display = 'none';
    
    currentSelectedFood = null;
    
    document.getElementById('modalCalorieCalc').innerText = '0 kcal';
    document.getElementById('addFoodModal').classList.add('active');
}

function closeAddFoodModal() {
    document.getElementById('addFoodModal').classList.remove('active');
}

// Guardar Comida vía AJAX
function submitFood(e) {
    e.preventDefault();
    
    const name = document.getElementById('food_name').value;
    const carbs = parseFloat(document.getElementById('food_carbs').value) || 0;
    const proteins = parseFloat(document.getElementById('food_proteins').value) || 0;
    const fats = parseFloat(document.getElementById('food_fats').value) || 0;
    
    if (!name || name.trim() === '') {
        alert("Por favor busca y selecciona un alimento primero.");
        return;
    }
    
    const formData = new FormData();
    formData.append('section', modalSection);
    formData.append('name', name);
    formData.append('carbs', carbs);
    formData.append('proteins', proteins);
    formData.append('fats', fats);
    
    fetch('app.php?ajax=add_food', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            if (!window.userDataMeals[modalSection]) {
                window.userDataMeals[modalSection] = [];
            }
            window.userDataMeals[modalSection].push(data.food);
            
            updateStatsOnScreen();
            renderAllMeals();
            closeAddFoodModal();
        } else {
            alert(data.error || 'Ocurrió un error al guardar el alimento.');
        }
    })
    .catch(err => console.error(err));
}

// Eliminar Comida vía AJAX
function deleteFood(section, foodId) {
    if (!confirm('¿Deseas eliminar este alimento?')) return;
    
    const formData = new FormData();
    formData.append('section', section);
    formData.append('id', foodId);
    
    fetch('app.php?ajax=delete_food', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Quitar localmente
            window.userDataMeals[section] = window.userDataMeals[section].filter(f => f.id !== foodId);
            
            updateStatsOnScreen();
            renderAllMeals();
        } else {
            alert('No se pudo eliminar el alimento.');
        }
    })
    .catch(err => console.error(err));
}

// Actualizar valores calóricos y macros en pantalla de inmediato
function updateStatsOnScreen() {
    let kcal = 0;
    let carbs = 0;
    let prot = 0;
    let fats = 0;
    
    Object.keys(window.userDataMeals).forEach(sec => {
        window.userDataMeals[sec].forEach(food => {
            kcal += food.kcal;
            carbs += food.carbs;
            prot += food.proteins;
            fats += food.fats;
        });
    });
    
    document.getElementById('consumedKcal').innerText = kcal;
    document.getElementById('currProt').innerText = prot.toFixed(1);
    document.getElementById('currCarb').innerText = carbs.toFixed(1);
    document.getElementById('currFat').innerText = fats.toFixed(1);
    
    renderCalorieCircle();
    renderMacrosBars();
}

// Actualizar Peso Semanal vía AJAX
function updateWeight(e) {
    e.preventDefault();
    const weightVal = parseFloat(document.getElementById('newWeightVal').value);
    
    if (weightVal <= 0) {
        alert('Ingresa un peso válido.');
        return;
    }
    
    const formData = new FormData();
    formData.append('weight', weightVal);
    
    fetch('app.php?ajax=update_weight', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('¡Peso actualizado con éxito! Tus calorías y macronutrientes han sido recalculados.');
            
            // Actualizar datos locales y refrescar pantalla
            window.userWeightHistory = data.weight_history;
            
            // Actualizar valores de perfil en pantalla
            document.getElementById('goalKcal').innerText = data.profile.target_calories;
            document.getElementById('goalProt').innerText = data.profile.macros.protein_g;
            document.getElementById('goalCarb').innerText = data.profile.macros.carb_g;
            document.getElementById('goalFat').innerText = data.profile.macros.fat_g;
            
            // Recalcular diferencia para línea de tiempo
            const weightDiff = Math.abs(data.profile.weight - data.profile.target_weight);
            const msgEl = document.getElementById('timelineMessage');
            if (weightDiff < 0.1) {
                msgEl.innerHTML = "¡Estás en tu peso objetivo! Mantén tus calorías actuales.";
            } else {
                const weeks = (weightDiff / 0.3636).toFixed(1);
                msgEl.innerHTML = `Lograrás tu meta de <span>${data.profile.target_weight} ${data.profile.unit_weight}</span> en aproximadamente <span>${weeks} semanas</span> (tasa saludable de ~0.4 kg por semana).`;
            }
            
            // Resaltar la fila de la tabla correspondiente
            updateActivityTableRow(data.profile.activity);
            
            // Limpiar input y re-renderizar
            document.getElementById('newWeightVal').value = '';
            updateStatsOnScreen();
            renderWeightChart(window.userWeightHistory);
        } else {
            alert(data.error);
        }
    })
    .catch(err => console.error(err));
}

function updateActivityTableRow(activity) {
    const rows = ['rowActBajo', 'rowActModerado', 'rowActAlto', 'rowActMuyAlto'];
    rows.forEach(r => {
        const el = document.getElementById(r);
        if (el) el.classList.remove('active-row');
    });
    
    const activeRowName = 'rowAct' + capitalize(activity === 'muy_alto' ? 'muyAlto' : activity);
    const activeRow = document.getElementById(activeRowName);
    if (activeRow) activeRow.classList.add('active-row');
}

// Dibujar Gráfica de Peso Histórico (SVG)
function renderWeightChart(history) {
    const svg = document.getElementById('weightChartSvg');
    if (!svg) return;
    
    svg.innerHTML = '';
    
    if (!history || history.length === 0) {
        svg.innerHTML = '<text x="250" y="100" class="chart-empty-state" text-anchor="middle">Aún no hay suficientes registros de peso.</text>';
        return;
    }
    
    // Crear una copia y ordenar cronológicamente por fecha
    history = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Si solo hay un registro, duplicar para hacer línea recta
    if (history.length === 1) {
        history = [
            { date: 'Inicio', weight: history[0].weight },
            { date: 'Hoy', weight: history[0].weight }
        ];
    }
    
    // Escalar los datos del gráfico
    const weights = history.map(h => parseFloat(h.weight));
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const range = (maxW - minW) || 1;
    
    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // Generar coordenadas de puntos
    const points = [];
    history.forEach((h, i) => {
        const x = paddingLeft + (i * (chartWidth / (history.length - 1)));
        const y = height - paddingBottom - (((h.weight - minW) / range) * chartHeight);
        points.push({ x, y, label: h.weight, date: h.date });
    });
    
    // 1. Dibujar líneas de rejilla horizontales (Grid)
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
        const y = paddingTop + (i * (chartHeight / gridCount));
        const val = maxW - (i * (range / gridCount));
        
        // Eje y labels
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '30');
        text.setAttribute('y', (y + 4).toString());
        text.setAttribute('fill', 'var(--text-muted)');
        text.setAttribute('font-size', '10px');
        text.setAttribute('text-anchor', 'end');
        text.textContent = Math.round(val);
        svg.appendChild(text);
        
        // Línea horizontal
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', paddingLeft.toString());
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', (width - paddingRight).toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('class', 'chart-grid-line');
        svg.appendChild(line);
    }
    
    // 2. Dibujar Línea de Conexión del Peso (Polyline)
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('class', 'chart-line');
    svg.appendChild(path);
    
    // 3. Dibujar Puntos (Dots) y Etiquetas
    points.forEach(p => {
        // Círculo
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x.toString());
        circle.setAttribute('cy', p.y.toString());
        circle.setAttribute('r', '6');
        circle.setAttribute('class', 'chart-dot');
        
        // Tooltip básico al hacer hover
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${p.label} ${window.userUnitWeight} (${p.date})`;
        circle.appendChild(title);
        
        svg.appendChild(circle);
        
        // Etiqueta del peso arriba del punto
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', p.x.toString());
        text.setAttribute('y', (p.y - 12).toString());
        text.setAttribute('fill', 'var(--text-primary)');
        text.setAttribute('font-size', '10px');
        text.setAttribute('font-weight', '700');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = p.label;
        svg.appendChild(text);
    });
}

// 7. Utilidades Generales
function capitalize(str) {
    if (!str) return '';
    
    // Convertir de snake_case a camelCase para ids de elementos
    if (str.includes('_')) {
        const parts = str.split('_');
        return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    }
    
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// ==========================================
// 8. LÓGICA DE CENTRO DE ENTRENAMIENTO
// ==========================================

let setupExercises = [];
let activeTimerInterval = null;
let activeWorkoutStart = null;
let activeRestInterval = null;

function initRoutines() {
    if (!document.getElementById('myRoutinesGrid')) return; // No en routines.php
    
    loadRoutines();
    
    // Cerrar dropdowns de menú de 3 puntos si haces clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.routine-menu-trigger')) {
            document.querySelectorAll('.routine-menu-dropdown').forEach(d => d.style.display = 'none');
        }
    });
}

function loadRoutines() {
    fetch('routines.php?ajax=get_routines')
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.userRoutines = data.routines;
            renderRoutinesList();
        }
    })
    .catch(err => console.error("Error al cargar rutinas: ", err));
}

function renderRoutinesList() {
    const grid = document.getElementById('myRoutinesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (window.userRoutines.length === 0) {
        grid.innerHTML = `
            <div class="chart-empty-state" style="grid-column: 1 / -1; padding: 4rem 2rem; text-align: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;">
                <span style="font-size: 2.5rem; display:block; margin-bottom:1rem;">🏋️</span>
                <h4 style="color:white; margin-bottom: 0.5rem;">No tienes rutinas creadas</h4>
                <p style="color:var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">Crea una rutina personalizada para planificar tus días de entrenamiento.</p>
                <button class="btn-primary" onclick="openRoutineModal()" style="font-size:0.95rem; padding: 0.6rem 1.5rem;">Crear mi primera rutina</button>
            </div>
        `;
        return;
    }
    
    window.userRoutines.forEach(r => {
        const card = document.createElement('div');
        card.className = 'routine-card-item';
        card.style.background = 'var(--bg-card)';
        card.style.border = '1px solid var(--border)';
        card.style.borderRadius = '12px';
        card.style.padding = '1.5rem';
        card.style.position = 'relative';
        card.style.transition = 'var(--transition)';
        card.style.cursor = 'pointer';
        card.onclick = () => openRoutineDetails(r.id);
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3 class="routine-card-title-click" style="color: white; margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight:700; transition: var(--transition);">${escapeHtml(r.title)}</h3>
                
                <div class="routine-menu-container" style="position:relative;">
                    <button class="routine-menu-trigger" onclick="toggleRoutineMenu(event, ${r.id})" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size: 1.2rem; padding: 0.2rem 0.5rem;">&#8942;</button>
                    <div class="routine-menu-dropdown" id="dropdown-${r.id}" style="display:none; position:absolute; right:0; top:100%; background:var(--bg-secondary); border:1px solid var(--border); border-radius:6px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); z-index:10; min-width:140px; text-align:left;">
                        <button onclick="event.stopPropagation(); duplicateRoutine(${r.id})" style="width:100%; text-align:left; background:transparent; border:none; color:white; padding:0.6rem 1rem; cursor:pointer; font-size:0.85rem; border-bottom:1px solid var(--border);">Duplicar</button>
                        <button onclick="event.stopPropagation(); editRoutine(${r.id})" style="width:100%; text-align:left; background:transparent; border:none; color:white; padding:0.6rem 1rem; cursor:pointer; font-size:0.85rem; border-bottom:1px solid var(--border);">Editar</button>
                        <button onclick="event.stopPropagation(); deleteRoutine(${r.id})" style="width:100%; text-align:left; background:transparent; border:none; color:var(--primary); padding:0.6rem 1rem; cursor:pointer; font-size:0.85rem;">Borrar</button>
                    </div>
                </div>
            </div>
            
            <p style="color:var(--text-secondary); font-size: 0.85rem; line-height:1.4; min-height: 40px; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${escapeHtml(r.description || 'Sin descripción')}
            </p>
            
            <button class="btn-routine-start" onclick="event.stopPropagation(); startWorkout(${r.id})" style="width:100%; text-align:center; padding: 0.6rem; font-size:0.9rem; border-radius:6px; background:var(--primary); color:white; font-weight:700; border:none; cursor:pointer; transition:var(--transition);">Empezar Rutina</button>
        `;
        
        // Hover titles
        const titleEl = card.querySelector('.routine-card-title-click');
        titleEl.addEventListener('mouseenter', () => titleEl.style.color = 'var(--primary)');
        titleEl.addEventListener('mouseleave', () => titleEl.style.color = 'white');
        
        grid.appendChild(card);
    });
}

function toggleRoutineMenu(e, id) {
    e.stopPropagation();
    const dropdown = document.getElementById(`dropdown-${id}`);
    const isVisible = dropdown.style.display === 'block';
    
    document.querySelectorAll('.routine-menu-dropdown').forEach(d => d.style.display = 'none');
    
    if (!isVisible) {
        dropdown.style.display = 'block';
    }
}

// Duplicar Rutina
function duplicateRoutine(id) {
    const formData = new FormData();
    formData.append('id', id);
    
    fetch('routines.php?ajax=duplicate_routine', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadRoutines();
        } else {
            alert(data.error || 'Error al duplicar la rutina.');
        }
    })
    .catch(err => console.error(err));
}

// Borrar Rutina
function deleteRoutine(id) {
    if (!confirm('¿Seguro que deseas eliminar esta rutina? Esta acción no se puede deshacer.')) return;
    
    const formData = new FormData();
    formData.append('id', id);
    
    fetch('routines.php?ajax=delete_routine', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadRoutines();
        } else {
            alert('Error al borrar la rutina.');
        }
    })
    .catch(err => console.error(err));
}

// Modal de Creación
function openRoutineModal(editId = null) {
    document.getElementById('routineForm').reset();
    document.getElementById('routine_edit_id').value = editId || '';
    document.getElementById('setupExercisesContainer').innerHTML = '';
    setupExercises = [];
    
    hideAddExerciseSearch();
    
    if (editId) {
        document.getElementById('routineModalTitle').innerText = 'Editar Rutina';
        const r = window.userRoutines.find(item => item.id == editId);
        if (r) {
            document.getElementById('routine_title_input').value = r.title;
            r.exercises.forEach(ex => {
                const exerciseObj = {
                    name: ex.name,
                    rest_time: ex.rest_time,
                    use_discs: ex.use_discs,
                    bar_weight: ex.bar_weight,
                    sets: ex.sets.map(s => ({ set_number: s.set_number, weight: s.weight, reps: s.reps }))
                };
                setupExercises.push(exerciseObj);
            });
            renderSetupExercises();
        }
    } else {
        document.getElementById('routineModalTitle').innerText = 'Crear Rutina Nueva';
    }
    
    document.getElementById('routineModal').classList.add('active');
}

function closeRoutineModal() {
    document.getElementById('routineModal').classList.remove('active');
}

function showAddExerciseSearch() {
    document.getElementById('searchExerciseBox').style.display = 'block';
    document.getElementById('setup_exercise_search_input').focus();
}

function hideAddExerciseSearch() {
    document.getElementById('searchExerciseBox').style.display = 'none';
    document.getElementById('setup_exercise_search_input').value = '';
    document.getElementById('setup_search_results').style.display = 'none';
}

// Búsqueda de ejercicios en Setup
function searchExercisesSetup(force = false) {
    const input = document.getElementById('setup_exercise_search_input');
    const query = input.value.trim();
    const resultsDiv = document.getElementById('setup_search_results');
    
    if (!force && query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    resultsDiv.innerHTML = '<div style="padding:0.6rem; color:var(--text-muted); font-size:0.85rem;">Buscando...</div>';
    resultsDiv.style.display = 'block';
    
    fetch(`routines.php?ajax=search_exercises&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        resultsDiv.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(ex => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'setup-search-result-item';
                btn.style.width = '100%';
                btn.style.background = 'transparent';
                btn.style.border = 'none';
                btn.style.color = 'white';
                btn.style.padding = '0.6rem 1rem';
                btn.style.textAlign = 'left';
                btn.style.cursor = 'pointer';
                btn.style.fontSize = '0.85rem';
                btn.style.borderBottom = '1px solid var(--border)';
                btn.innerHTML = `<strong style="color:var(--primary); text-transform:capitalize;">${escapeHtml(ex.name)}</strong> - <span style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(ex.bodyPart || '')} / ${escapeHtml(ex.target || '')}</span>`;
                
                btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(255,42,42,0.1)');
                btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
                
                btn.onclick = () => {
                    addExerciseToSetup(ex.name);
                    hideAddExerciseSearch();
                };
                resultsDiv.appendChild(btn);
            });
        } else {
            resultsDiv.innerHTML = '<div style="padding:0.6rem; color:var(--text-muted); font-size:0.85rem;">Sin resultados.</div>';
        }
    })
    .catch(err => {
        console.error(err);
        resultsDiv.innerHTML = '<div style="padding:0.6rem; color:var(--primary); font-size:0.85rem;">Error en la búsqueda</div>';
    });
}

function addExerciseToSetup(name) {
    const exerciseObj = {
        name: name,
        rest_time: 60,
        use_discs: false,
        bar_weight: 20.00,
        sets: [
            { set_number: 1, weight: 10, reps: '10' }
        ]
    };
    setupExercises.push(exerciseObj);
    renderSetupExercises();
}

function renderSetupExercises() {
    const container = document.getElementById('setupExercisesContainer');
    container.innerHTML = '';
    
    setupExercises.forEach((ex, exIndex) => {
        const item = document.createElement('div');
        item.className = 'setup-exercise-item';
        item.style.background = 'rgba(255,255,255,0.02)';
        item.style.border = '1px solid var(--border)';
        item.style.borderRadius = '8px';
        item.style.padding = '1.2rem';
        item.style.marginBottom = '1rem';
        
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom: 1px solid var(--border); padding-bottom:0.5rem;">
                <h5 style="color:white; margin:0; font-size:1rem; text-transform:capitalize; font-weight:700;">${escapeHtml(ex.name)}</h5>
                <button type="button" class="btn-delete-food" onclick="removeExerciseSetup(${exIndex})" style="padding:0.2rem 0.5rem;" title="Eliminar Ejercicio">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
            
            <div class="setup-exercise-controls" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="form-group" style="margin:0;">
                    <label style="font-size:0.75rem; text-transform:none;">Descanso (segundos)</label>
                    <input type="number" class="form-control" style="padding:0.4rem 0.8rem; font-size:0.9rem;" value="${ex.rest_time}" onchange="updateExerciseRestTime(${exIndex}, this.value)" min="0">
                </div>
                <div class="form-group" style="margin:0; display:flex; flex-direction:column; justify-content:center;">
                    <label style="font-size:0.75rem; text-transform:none; display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                        <input type="checkbox" ${ex.use_discs ? 'checked' : ''} onchange="toggleExerciseDiscs(${exIndex}, this.checked)" style="width:16px; height:16px;">
                        ¿Es ejercicio de discos?
                    </label>
                </div>
            </div>
            
            ${ex.use_discs ? `
            <div class="form-group" style="margin-bottom:1rem;">
                <label style="font-size:0.75rem; text-transform:none;">Peso de la barra</label>
                <select class="form-control" style="padding:0.4rem 0.8rem; font-size:0.9rem; background:var(--bg-primary);" onchange="updateExerciseBarWeight(${exIndex}, this.value)">
                    <option value="20.00" ${ex.bar_weight === 20.00 ? 'selected' : ''}>Barra Estándar (20 kg)</option>
                    <option value="15.00" ${ex.bar_weight === 15.00 ? 'selected' : ''}>Barra Corta (15 kg)</option>
                    <option value="7.50" ${ex.bar_weight === 7.50 ? 'selected' : ''}>Barra EZ (7.5 kg)</option>
                    <option value="0.00" ${ex.bar_weight === 0.00 ? 'selected' : ''}>Sin barra (0 kg)</option>
                </select>
            </div>
            ` : ''}

            <!-- Tabla de Series -->
            <div style="font-size: 0.8rem; margin-bottom: 0.5rem; color: var(--text-muted); font-weight:700; display:grid; grid-template-columns: 0.5fr 1fr 1fr 0.5fr; gap:0.5rem; text-align:center;">
                <span>SERIE</span>
                <span>${ex.use_discs ? 'DISCOS (KG)' : 'KG'}</span>
                <span>REPS / RANGO</span>
                <span></span>
            </div>
            
            <div id="sets-container-${exIndex}">
                ${ex.sets.map((set, setIdx) => `
                <div style="display:grid; grid-template-columns: 0.5fr 1fr 1fr 0.5fr; gap:0.5rem; margin-bottom:0.5rem; align-items:center;">
                    <span style="color:var(--text-secondary); text-align:center; font-weight:700;">${set.set_number}</span>
                    <input type="number" step="0.1" class="form-control" style="padding:0.3rem 0.5rem; font-size:0.85rem; text-align:center;" value="${set.weight}" onchange="updateSetWeight(${exIndex}, ${setIdx}, this.value)" required>
                    <input type="text" class="form-control" style="padding:0.3rem 0.5rem; font-size:0.85rem; text-align:center;" value="${set.reps}" placeholder="Ej. 10 o 8-12" onchange="updateSetReps(${exIndex}, ${setIdx}, this.value)" required>
                    <button type="button" class="btn-delete-food" onclick="removeSetSetup(${exIndex}, ${setIdx})" style="padding:0.2rem 0.5rem; background:transparent;" title="Eliminar Serie">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                `).join('')}
            </div>
            
            <button type="button" class="btn-secondary" style="font-size:0.8rem; padding: 0.3rem 0.8rem; margin-top:0.5rem;" onclick="addSetSetup(${exIndex})">
                + Agregar Serie
            </button>
        `;
        
        container.appendChild(item);
    });
}

function removeExerciseSetup(index) {
    setupExercises.splice(index, 1);
    renderSetupExercises();
}

function updateExerciseRestTime(exIdx, val) {
    setupExercises[exIdx].rest_time = parseInt(val) || 0;
}

function toggleExerciseDiscs(exIdx, checked) {
    setupExercises[exIdx].use_discs = checked;
    if (checked) {
        setupExercises[exIdx].bar_weight = 20.00;
    } else {
        setupExercises[exIdx].bar_weight = 0.00;
    }
    renderSetupExercises();
}

function updateExerciseBarWeight(exIdx, val) {
    setupExercises[exIdx].bar_weight = parseFloat(val) || 0.00;
}

function addSetSetup(exIdx) {
    const sets = setupExercises[exIdx].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({
        set_number: sets.length + 1,
        weight: lastSet ? lastSet.weight : 10,
        reps: lastSet ? lastSet.reps : '10'
    });
    renderSetupExercises();
}

function removeSetSetup(exIdx, setIdx) {
    setupExercises[exIdx].sets.splice(setIdx, 1);
    // Reordenar números de serie
    setupExercises[exIdx].sets.forEach((set, idx) => {
        set.set_number = idx + 1;
    });
    renderSetupExercises();
}

function updateSetWeight(exIdx, setIdx, val) {
    setupExercises[exIdx].sets[setIdx].weight = parseFloat(val) || 0;
}

function updateSetReps(exIdx, setIdx, val) {
    setupExercises[exIdx].sets[setIdx].reps = val.trim();
}

// Guardar rutina
function saveRoutine(e) {
    e.preventDefault();
    const title = document.getElementById('routine_title_input').value.trim();
    const editId = document.getElementById('routine_edit_id').value;
    
    if (setupExercises.length === 0) {
        alert("Por favor agrega al menos un ejercicio a la rutina.");
        return;
    }
    
    const payload = {
        title: title,
        exercises: setupExercises
    };
    if (editId) {
        payload.id = parseInt(editId);
    }
    
    fetch('routines.php?ajax=save_routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeRoutineModal();
            loadRoutines();
        } else {
            alert(data.error || 'Error al guardar la rutina.');
        }
    })
    .catch(err => console.error(err));
}

// Editar rutina
function editRoutine(id) {
    openRoutineModal(id);
}

// Abrir detalle y evolución de rutina
function openRoutineDetails(id) {
    const r = window.userRoutines.find(item => item.id == id);
    if (!r) return;
    
    window.selectedRoutineForDetail = r;
    document.getElementById('detailRoutineTitle').innerText = r.title;
    
    // Cargar ejercicios planificados
    const list = document.getElementById('detailExercisesList');
    list.innerHTML = '';
    r.exercises.forEach(ex => {
        const item = document.createElement('div');
        item.style.background = 'rgba(255,255,255,0.02)';
        item.style.border = '1px solid var(--border)';
        item.style.borderRadius = '8px';
        item.style.padding = '0.8rem 1.2rem';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        
        // Formatear series
        const setsText = ex.sets.map(s => `${s.weight}kg x ${s.reps}`).join(', ');
        item.innerHTML = `
            <div>
                <strong style="color:white; text-transform:capitalize;">${escapeHtml(ex.name)}</strong>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-top:0.2rem;">Descanso: ${ex.rest_time}s ${ex.use_discs ? `| Barra: ${ex.bar_weight}kg` : ''}</span>
            </div>
            <div style="font-size:0.85rem; color:var(--primary); font-weight:700;">
                ${ex.sets.length} series: ${setsText}
            </div>
        `;
        list.appendChild(item);
    });
    
    // Cargar gráfica por defecto (Volumen)
    window.currentChartMetric = 'volumen';
    document.querySelectorAll('.chart-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btnChartVolumen').classList.add('active');
    
    loadAndDrawChart(id, 'volumen');
    
    document.getElementById('routineDetailsModal').classList.add('active');
}

function closeRoutineDetailsModal() {
    document.getElementById('routineDetailsModal').classList.remove('active');
}

function startWorkoutFromDetail() {
    if (window.selectedRoutineForDetail) {
        closeRoutineDetailsModal();
        startWorkout(window.selectedRoutineForDetail.id);
    }
}

// Cargar logs de entrenamientos e iniciar gráfica SVG
function loadAndDrawChart(routineId, metric) {
    const svg = document.getElementById('routineProgressChartSvg');
    if (!svg) return;
    svg.innerHTML = '<text x="250" y="100" class="chart-empty-state" text-anchor="middle" fill="var(--text-muted)">Cargando gráfica...</text>';
    
    fetch(`routines.php?ajax=get_workout_logs&routine_id=${routineId}`)
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            drawRoutineProgressChart(data.logs, metric);
        }
    })
    .catch(err => {
        console.error(err);
        svg.innerHTML = '<text x="250" y="100" class="chart-empty-state" text-anchor="middle" fill="var(--primary)">Error al cargar progreso</text>';
    });
}

function changeChartMetric(metric) {
    window.currentChartMetric = metric;
    document.querySelectorAll('.chart-tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (metric === 'volumen') document.getElementById('btnChartVolumen').classList.add('active');
    if (metric === 'repeticiones') document.getElementById('btnChartReps').classList.add('active');
    if (metric === 'duracion') document.getElementById('btnChartDuration').classList.add('active');
    
    if (window.selectedRoutineForDetail) {
        loadAndDrawChart(window.selectedRoutineForDetail.id, metric);
    }
}

function drawRoutineProgressChart(logs, metric) {
    const svg = document.getElementById('routineProgressChartSvg');
    if (!svg) return;
    
    svg.innerHTML = '';
    
    if (!logs || logs.length === 0) {
        svg.innerHTML = '<text x="250" y="100" class="chart-empty-state" text-anchor="middle" fill="var(--text-muted)">Realiza tu primer entrenamiento para ver la evolución.</text>';
        return;
    }
    
    // Si solo hay un log, duplicar
    if (logs.length === 1) {
        logs = [
            { date: 'Punto Inicial', volume: logs[0].volume, total_reps: logs[0].total_reps, duration: logs[0].duration },
            { date: 'Punto Actual', volume: logs[0].volume, total_reps: logs[0].total_reps, duration: logs[0].duration }
        ];
    }
    
    // Extraer datos Y basados en la métrica
    let yValues = [];
    let yLabel = '';
    if (metric === 'volumen') {
        yValues = logs.map(l => parseFloat(l.volume));
        yLabel = 'kg';
    } else if (metric === 'repeticiones') {
        yValues = logs.map(l => parseInt(l.total_reps));
        yLabel = 'reps';
    } else {
        // Duración (en minutos)
        yValues = logs.map(l => Math.round(l.duration / 60));
        yLabel = 'min';
    }
    
    const minY = Math.min(...yValues) * 0.9 - 1;
    const maxY = Math.max(...yValues) * 1.1 + 1;
    const rangeY = (maxY - minY) || 1;
    
    const width = 500;
    const height = 220;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 35;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // Coordenadas
    const points = [];
    logs.forEach((log, i) => {
        const x = paddingLeft + (i * (chartWidth / (logs.length - 1)));
        const y = height - paddingBottom - (((yValues[i] - minY) / rangeY) * chartHeight);
        
        let displayDate = 'Inicio';
        if (log.date) {
            const d = new Date(log.date);
            if (!isNaN(d.getTime())) {
                displayDate = `${d.getDate()}/${d.getMonth()+1}`;
            } else {
                displayDate = log.date; // "Punto Actual"
            }
        }
        points.push({ x, y, value: yValues[i], dateLabel: displayDate });
    });
    
    // Grid horizontal
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
        const y = paddingTop + (i * (chartHeight / gridCount));
        const val = maxY - (i * (rangeY / gridCount));
        
        // Eje y labels
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (paddingLeft - 8).toString());
        text.setAttribute('y', (y + 4).toString());
        text.setAttribute('fill', 'var(--text-muted)');
        text.setAttribute('font-size', '10px');
        text.setAttribute('text-anchor', 'end');
        text.textContent = Math.round(val) + yLabel;
        svg.appendChild(text);
        
        // Línea horizontal
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', paddingLeft.toString());
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', (width - paddingRight).toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('class', 'chart-grid-line');
        svg.appendChild(line);
    }
    
    // Dibujar línea del gráfico
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('class', 'chart-line');
    path.style.stroke = 'var(--primary)';
    path.style.strokeWidth = '3px';
    path.style.fill = 'none';
    svg.appendChild(path);
    
    // Dibujar puntos, tooltip y etiquetas de fecha
    points.forEach(p => {
        // Círculo
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x.toString());
        circle.setAttribute('cy', p.y.toString());
        circle.setAttribute('r', '6');
        circle.setAttribute('class', 'chart-dot');
        circle.style.fill = 'var(--bg-primary)';
        circle.style.stroke = 'var(--primary)';
        circle.style.strokeWidth = '2.5px';
        circle.style.cursor = 'pointer';
        
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${p.value} ${yLabel} (${p.dateLabel})`;
        circle.appendChild(title);
        svg.appendChild(circle);
        
        // Valor numérico arriba del punto
        const textVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textVal.setAttribute('x', p.x.toString());
        textVal.setAttribute('y', (p.y - 12).toString());
        textVal.setAttribute('fill', 'var(--text-primary)');
        textVal.setAttribute('font-size', '10px');
        textVal.setAttribute('font-weight', '700');
        textVal.setAttribute('text-anchor', 'middle');
        textVal.textContent = p.value;
        svg.appendChild(textVal);
        
        // Fecha abajo en el eje X
        const textDate = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textDate.setAttribute('x', p.x.toString());
        textDate.setAttribute('y', (height - paddingBottom + 18).toString());
        textDate.setAttribute('fill', 'var(--text-secondary)');
        textDate.setAttribute('font-size', '9px');
        textDate.setAttribute('text-anchor', 'middle');
        textDate.textContent = p.dateLabel;
        svg.appendChild(textDate);
    });
}

// ==========================================
// 9. LÓGICA DE ENTRENAMIENTO ACTIVO
// ==========================================

function startWorkout(routineId) {
    const r = window.userRoutines.find(item => item.id == routineId);
    if (!r) return;
    
    // Clonar ejercicios y series para el entrenamiento activo
    const exercisesCopy = r.exercises.map(ex => {
        return {
            name: ex.name,
            rest_time: ex.rest_time,
            use_discs: ex.use_discs,
            bar_weight: ex.bar_weight,
            active_timer_seconds: ex.rest_time,
            active_timer_running: false,
            sets: ex.sets.map(s => {
                return {
                    set_number: s.set_number,
                    planned_weight: s.weight,
                    planned_reps: s.reps,
                    weight: '',
                    reps: '',
                    completed: false
                };
            })
        };
    });
    
    window.activeWorkout = {
        routine_id: r.id,
        routine_title: r.title,
        duration: 0,
        volume: 0,
        total_sets: 0,
        total_reps: 0,
        exercises: exercisesCopy
    };
    
    // Abrir overlay inmersivo
    document.getElementById('activeWorkoutTitle').innerText = r.title;
    document.getElementById('workoutActiveOverlay').style.display = 'block';
    
    // Bloquear scroll de la página
    document.body.style.overflow = 'hidden';
    
    // Iniciar Cronómetro
    activeWorkoutStart = Date.now();
    clearInterval(activeTimerInterval);
    activeTimerInterval = setInterval(() => {
        const diff = Date.now() - activeWorkoutStart;
        window.activeWorkout.duration = Math.floor(diff / 1000);
        
        const h = Math.floor(window.activeWorkout.duration / 3600);
        const m = Math.floor((window.activeWorkout.duration % 3600) / 60);
        const s = window.activeWorkout.duration % 60;
        
        const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
        const el1 = document.getElementById('activeTimer');
        if (el1) el1.innerText = formatted;
        
        const el2 = document.getElementById('activeTimerHeader');
        if (el2) el2.innerText = formatted;
    }, 1000);
    
    updateActiveWorkoutStats();
    renderActiveExercises();
}

function updateActiveWorkoutStats() {
    let volume = 0;
    let completedSets = 0;
    let totalSets = 0;
    
    window.activeWorkout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
            totalSets++;
            if (set.completed) {
                completedSets++;
                const setWeight = ex.use_discs ? (parseFloat(ex.bar_weight) + parseFloat(set.weight)) : parseFloat(set.weight);
                volume += setWeight * set.reps;
            }
        });
    });
    
    window.activeWorkout.volume = volume;
    window.activeWorkout.total_sets = completedSets;
    
    document.getElementById('activeVolume').innerText = `${volume} kg`;
    document.getElementById('activeSetsCount').innerText = `${completedSets} / ${totalSets}`;
}

function renderActiveExercises() {
    const container = document.getElementById('activeExercisesContainer');
    container.innerHTML = '';
    
    window.activeWorkout.exercises.forEach((ex, exIdx) => {
        const card = document.createElement('div');
        card.className = 'active-exercise-card';
        card.style.background = 'var(--bg-card)';
        card.style.border = '1px solid var(--border)';
        card.style.borderRadius = '12px';
        card.style.padding = '1.5rem';
        card.style.marginBottom = '1.5rem';
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border); padding-bottom:0.5rem; flex-wrap:wrap; gap:1rem;">
                <div>
                    <h3 style="color:white; margin:0; font-size:1.15rem; text-transform:capitalize; font-weight:700;">${escapeHtml(ex.name)}</h3>
                    ${ex.use_discs ? `
                    <div style="margin-top:0.2rem; display:flex; align-items:center; gap:0.4rem;">
                        <span style="font-size:0.75rem; color:var(--text-secondary);">Barra activa:</span>
                        <select class="form-control" style="padding:0.15rem 0.4rem; font-size:0.75rem; width:auto; height:auto; background:var(--bg-primary);" onchange="updateActiveExerciseBar(${exIdx}, this.value)">
                            <option value="20.00" ${ex.bar_weight === 20.00 ? 'selected' : ''}>Estándar (20 kg)</option>
                            <option value="15.00" ${ex.bar_weight === 15.00 ? 'selected' : ''}>Corta (15 kg)</option>
                            <option value="7.50" ${ex.bar_weight === 7.50 ? 'selected' : ''}>EZ (7.5 kg)</option>
                            <option value="0.00" ${ex.bar_weight === 0.00 ? 'selected' : ''}>Sin barra (0 kg)</option>
                        </select>
                    </div>
                    ` : ''}
                </div>
                
                <div style="display:flex; align-items:center; gap:0.6rem;">
                    <div class="active-rest-display" id="restDisplay-${exIdx}" style="font-size:0.85rem; font-weight:700; color:var(--text-secondary); background:rgba(255,255,255,0.03); padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--border);">
                        Descanso: ${ex.active_timer_seconds}s
                    </div>
                    <button class="btn-secondary" style="font-size:0.75rem; padding:0.4rem 0.8rem; border-radius:6px;" onclick="toggleActiveRestTimer(${exIdx})">
                        ${ex.active_timer_running ? 'Detener' : 'Iniciar'}
                    </button>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 0.5fr 1fr 1fr 1fr 0.5fr; gap:0.5rem; text-align:center; font-size:0.8rem; color:var(--text-muted); font-weight:700; margin-bottom:0.5rem;">
                <span>SERIE</span>
                <span>PLANIFICADO</span>
                <span>${ex.use_discs ? 'DISCOS (KG)' : 'KG'}</span>
                <span>REPS</span>
                <span>CHECK</span>
            </div>
            
            <div id="active-sets-container-${exIdx}">
                ${ex.sets.map((set, setIdx) => {
                    const hasPlan = set.planned_weight !== undefined && set.planned_weight !== null && set.planned_weight !== '' && parseFloat(set.planned_weight) > 0 &&
                                    set.planned_reps !== undefined && set.planned_reps !== null && set.planned_reps !== '' && parseInt(set.planned_reps) > 0;
                    const planText = hasPlan ? `${set.planned_weight}kg x ${set.planned_reps}` : '';
                    const weightPlaceholder = hasPlan ? set.planned_weight : '0';
                    const repsPlaceholder = hasPlan ? set.planned_reps : '0';
                    return `
                    <div class="active-set-row ${set.completed ? 'completed-row' : ''}" id="row-${exIdx}-${setIdx}" style="display:grid; grid-template-columns: 0.5fr 1fr 1fr 1fr 0.5fr; gap:0.5rem; align-items:center; margin-bottom:0.5rem; padding: 4px; border-radius:6px; transition:var(--transition);">
                        <span style="color:var(--text-secondary); text-align:center; font-weight:700;">${set.set_number}</span>
                        <span style="color:var(--text-muted); text-align:center; font-size:0.8rem;">${planText}</span>
                        <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                            <input type="number" step="0.1" class="form-control" style="padding:0.3rem 0.5rem; font-size:0.85rem; text-align:center;" value="${set.weight || ''}" placeholder="${weightPlaceholder}" onchange="updateActiveSetWeight(${exIdx}, ${setIdx}, this.value)" ${set.completed ? 'disabled' : ''}>
                            ${ex.use_discs ? `<span style="font-size:0.6rem; color:var(--text-muted); position:absolute; bottom:-12px;">Total: ${(parseFloat(set.weight || 0) + parseFloat(ex.bar_weight)).toFixed(1)}kg</span>` : ''}
                        </div>
                        <input type="number" class="form-control" style="padding:0.3rem 0.5rem; font-size:0.85rem; text-align:center;" value="${set.reps || ''}" placeholder="${repsPlaceholder}" onchange="updateActiveSetReps(${exIdx}, ${setIdx}, this.value)" ${set.completed ? 'disabled' : ''}>
                        
                        <div style="display:flex; justify-content:center;">
                            <button class="active-check-btn ${set.completed ? 'checked' : ''}" onclick="toggleActiveSetCheck(${exIdx}, ${setIdx})" style="width:28px; height:28px; border-radius:50%; border: 1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; background:transparent; color:transparent; font-size: 0.8rem; transition:var(--transition); font-weight:900;">✓</button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:0.8rem;">
                <button class="btn-secondary" style="font-size:0.75rem; padding: 0.3rem 0.8rem;" onclick="addActiveSet(${exIdx})">
                    + Agregar Serie
                </button>
                <button class="btn-secondary" style="font-size:0.75rem; padding: 0.3rem 0.8rem; border-color:rgba(255,42,42,0.2); color:var(--primary);" onclick="removeActiveExercise(${exIdx})">
                    Eliminar Ejercicio
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function updateActiveExerciseBar(exIdx, val) {
    window.activeWorkout.exercises[exIdx].bar_weight = parseFloat(val) || 0.00;
    renderActiveExercises();
    updateActiveWorkoutStats();
}

function updateActiveSetWeight(exIdx, setIdx, val) {
    window.activeWorkout.exercises[exIdx].sets[setIdx].weight = parseFloat(val) || 0;
}

function updateActiveSetReps(exIdx, setIdx, val) {
    window.activeWorkout.exercises[exIdx].sets[setIdx].reps = parseInt(val) || 0;
}

function toggleActiveSetCheck(exIdx, setIdx) {
    const set = window.activeWorkout.exercises[exIdx].sets[setIdx];
    const row = document.getElementById(`row-${exIdx}-${setIdx}`);
    if (!row) return;
    const inputs = row.querySelectorAll('input');
    
    if (set.weight === '' || parseFloat(set.weight) <= 0) {
        set.weight = parseFloat(set.planned_weight) || 0;
        if (inputs.length > 0) inputs[0].value = set.planned_weight;
    }
    if (set.reps === '' || parseInt(set.reps) <= 0) {
        set.reps = parseInt(set.planned_reps) || 0;
        if (inputs.length > 1) inputs[1].value = set.planned_reps;
    }
    
    if (set.weight <= 0 || set.reps <= 0) {
        alert("Por favor ingresa un peso y repeticiones mayores a 0 antes de completar la serie.");
        return;
    }
    
    set.completed = !set.completed;
    
    const btn = row.querySelector('.active-check-btn');
    
    if (set.completed) {
        row.classList.add('completed-row');
        if (btn) {
            btn.classList.add('checked');
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--primary)';
        }
        inputs.forEach(i => i.disabled = true);
        
        if (!window.workoutSessionSettings.disableRestTimer) {
            startActiveRestTimer(exIdx);
        }
    } else {
        row.classList.remove('completed-row');
        if (btn) {
            btn.classList.remove('checked');
            btn.style.background = 'transparent';
            btn.style.color = 'transparent';
            btn.style.borderColor = 'var(--border)';
        }
        inputs.forEach(i => i.disabled = false);
    }
    
    updateActiveWorkoutStats();
}

function addActiveSet(exIdx) {
    const sets = window.activeWorkout.exercises[exIdx].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({
        set_number: sets.length + 1,
        planned_weight: lastSet ? (lastSet.planned_weight || '') : '',
        planned_reps: lastSet ? (lastSet.planned_reps || '') : '',
        weight: '',
        reps: '',
        completed: false
    });
    renderActiveExercises();
    updateActiveWorkoutStats();
}

function removeActiveExercise(exIdx) {
    if (!confirm("¿Deseas eliminar este ejercicio de tu sesión de entrenamiento actual?")) return;
    window.activeWorkout.exercises.splice(exIdx, 1);
    renderActiveExercises();
    updateActiveWorkoutStats();
}

function playBeepSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.error("Audio API error: ", e);
    }
}

function toggleActiveRestTimer(exIdx) {
    const ex = window.activeWorkout.exercises[exIdx];
    if (ex.active_timer_running) {
        stopActiveRestTimer(exIdx);
    } else {
        startActiveRestTimer(exIdx);
    }
}

function startActiveRestTimer(exIdx) {
    const ex = window.activeWorkout.exercises[exIdx];
    stopActiveRestTimer(exIdx);
    
    ex.active_timer_running = true;
    ex.active_timer_seconds = ex.rest_time;
    
    const widget = document.getElementById('restTimerWidget');
    widget.style.display = 'flex';
    document.getElementById('restTimerProgress').innerText = `Descanso (${escapeHtml(ex.name)}): ${ex.active_timer_seconds}s`;
    
    renderActiveExercises();
    
    clearInterval(activeRestInterval);
    activeRestInterval = setInterval(() => {
        ex.active_timer_seconds--;
        
        if (ex.active_timer_seconds <= 0) {
            clearInterval(activeRestInterval);
            ex.active_timer_running = false;
            ex.active_timer_seconds = ex.rest_time;
            widget.style.display = 'none';
            playBeepSound();
            alert(`¡Tiempo de descanso terminado para ${ex.name}!`);
        } else {
            document.getElementById('restTimerProgress').innerText = `Descanso (${escapeHtml(ex.name)}): ${ex.active_timer_seconds}s`;
            const display = document.getElementById(`restDisplay-${exIdx}`);
            if (display) display.innerText = `Descanso: ${ex.active_timer_seconds}s`;
        }
    }, 1000);
}

function stopActiveRestTimer(exIdx) {
    clearInterval(activeRestInterval);
    const widget = document.getElementById('restTimerWidget');
    widget.style.display = 'none';
    
    window.activeWorkout.exercises.forEach(ex => {
        ex.active_timer_running = false;
        ex.active_timer_seconds = ex.rest_time;
    });
    
    renderActiveExercises();
}

function skipRestTimer() {
    clearInterval(activeRestInterval);
    document.getElementById('restTimerWidget').style.display = 'none';
    window.activeWorkout.exercises.forEach(ex => {
        ex.active_timer_running = false;
        ex.active_timer_seconds = ex.rest_time;
    });
    renderActiveExercises();
}

function showWorkoutAddExerciseSearch() {
    document.getElementById('workoutSearchExerciseBox').style.display = 'block';
    document.getElementById('workout_exercise_search_input').focus();
}

function hideWorkoutAddExerciseSearch() {
    document.getElementById('workoutSearchExerciseBox').style.display = 'none';
    document.getElementById('workout_exercise_search_input').value = '';
    document.getElementById('workout_search_results').style.display = 'none';
}

function searchExercisesWorkout(force = false) {
    const input = document.getElementById('workout_exercise_search_input');
    const query = input.value.trim();
    const resultsDiv = document.getElementById('workout_search_results');
    
    if (!force && query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    resultsDiv.innerHTML = '<div style="padding:0.6rem; color:var(--text-muted); font-size:0.85rem;">Buscando...</div>';
    resultsDiv.style.display = 'block';
    
    fetch(`routines.php?ajax=search_exercises&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        resultsDiv.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(ex => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'setup-search-result-item';
                btn.style.width = '100%';
                btn.style.background = 'transparent';
                btn.style.border = 'none';
                btn.style.color = 'white';
                btn.style.padding = '0.6rem 1rem';
                btn.style.textAlign = 'left';
                btn.style.cursor = 'pointer';
                btn.style.fontSize = '0.85rem';
                btn.style.borderBottom = '1px solid var(--border)';
                btn.innerHTML = `<strong style="color:var(--primary); text-transform:capitalize;">${escapeHtml(ex.name)}</strong> - <span style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(ex.bodyPart || '')}</span>`;
                
                btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(255,42,42,0.1)');
                btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
                
                btn.onclick = () => {
                    addExerciseToActiveWorkout(ex.name);
                    hideWorkoutAddExerciseSearch();
                };
                resultsDiv.appendChild(btn);
            });
        } else {
            resultsDiv.innerHTML = '<div style="padding:0.6rem; color:var(--text-muted); font-size:0.85rem;">Sin resultados.</div>';
        }
    })
    .catch(err => {
        console.error(err);
        resultsDiv.innerHTML = '<div style="padding:0.6rem; color:var(--primary); font-size:0.85rem;">Error en la búsqueda</div>';
    });
}

function addExerciseToActiveWorkout(name) {
    const exerciseObj = {
        name: name,
        rest_time: 60,
        use_discs: false,
        bar_weight: 0.00,
        active_timer_seconds: 60,
        active_timer_running: false,
        sets: [
            { set_number: 1, weight: 0, reps: 0, completed: false }
        ]
    };
    window.activeWorkout.exercises.push(exerciseObj);
    renderActiveExercises();
    updateActiveWorkoutStats();
}

function openWorkoutSettings() {
    document.getElementById('settingDisableRestTimer').checked = window.workoutSessionSettings.disableRestTimer;
    document.getElementById('settingLoadPreviousValues').checked = window.workoutSessionSettings.loadPreviousValues;
    document.getElementById('workoutSettingsModal').classList.add('active');
}

function closeWorkoutSettings() {
    document.getElementById('workoutSettingsModal').classList.remove('active');
}

function saveSessionSettings() {
    window.workoutSessionSettings.disableRestTimer = document.getElementById('settingDisableRestTimer').checked;
    window.workoutSessionSettings.loadPreviousValues = document.getElementById('settingLoadPreviousValues').checked;
}

function editActiveTimer() {
    const currentVal = document.getElementById('activeTimerHeader') ? document.getElementById('activeTimerHeader').innerText : "00:00:00";
    const defaultVal = currentVal.startsWith("00:") ? currentVal.substring(3) : currentVal;
    
    const input = prompt("Introduce el nuevo tiempo de entrenamiento (formato MM:SS o número de minutos, ej: 12:30 o 15):", defaultVal);
    if (input === null) return;
    
    let totalSeconds = 0;
    if (input.includes(':')) {
        const parts = input.split(':');
        if (parts.length === 2) {
            const m = parseInt(parts[0]) || 0;
            const s = parseInt(parts[1]) || 0;
            totalSeconds = m * 60 + s;
        } else if (parts.length === 3) {
            const h = parseInt(parts[0]) || 0;
            const m = parseInt(parts[1]) || 0;
            const s = parseInt(parts[2]) || 0;
            totalSeconds = h * 3600 + m * 60 + s;
        }
    } else {
        const m = parseInt(input) || 0;
        totalSeconds = m * 60;
    }
    
    if (totalSeconds >= 0) {
        activeWorkoutStart = Date.now() - (totalSeconds * 1000);
        window.activeWorkout.duration = totalSeconds;
        
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
        const el1 = document.getElementById('activeTimer');
        if (el1) el1.innerText = formatted;
        const el2 = document.getElementById('activeTimerHeader');
        if (el2) el2.innerText = formatted;
    }
}

function performDiscardWorkout(dueToTime) {
    clearInterval(activeTimerInterval);
    clearInterval(activeRestInterval);
    
    document.getElementById('restTimerWidget').style.display = 'none';
    document.getElementById('workoutActiveOverlay').style.display = 'none';
    document.body.style.overflow = '';
    
    window.activeWorkout = null;
    if (dueToTime) {
        alert("Entrenamiento eliminado por falta de tiempo.");
    } else {
        alert("Entrenamiento descartado.");
    }
    loadRoutines();
}

function showWorkoutSummaryModal(completedSetsCount) {
    clearInterval(activeTimerInterval);
    clearInterval(activeRestInterval);
    document.getElementById('restTimerWidget').style.display = 'none';
    
    const min = Math.floor(window.activeWorkout.duration / 60);
    const sec = window.activeWorkout.duration % 60;
    
    document.getElementById('summaryDuration').innerText = `${min} min y ${sec} seg`;
    document.getElementById('summaryVolume').innerText = `${window.activeWorkout.volume} kg`;
    document.getElementById('summarySets').innerText = completedSetsCount;
    
    const summaryList = document.getElementById('summaryExerciseList');
    summaryList.innerHTML = '';
    
    window.activeWorkout.exercises.forEach(ex => {
        const completedSets = ex.sets.filter(s => s.completed);
        if (completedSets.length === 0) return;
        
        const item = document.createElement('div');
        item.style.background = 'rgba(255,255,255,0.02)';
        item.style.border = '1px solid var(--border)';
        item.style.borderRadius = '6px';
        item.style.padding = '0.8rem';
        
        const setsText = completedSets.map(s => {
            const setWeight = ex.use_discs ? (parseFloat(ex.bar_weight) + parseFloat(s.weight)) : parseFloat(s.weight);
            return `${setWeight}kg x ${s.reps}`;
        }).join(', ');
        
        item.innerHTML = `
            <strong style="color:white; text-transform:capitalize; font-size:0.9rem; display:block; margin-bottom:0.2rem;">${escapeHtml(ex.name)}</strong>
            <span style="font-size:0.8rem; color:var(--text-secondary);">${completedSets.length} series logradas: ${setsText}</span>
        `;
        summaryList.appendChild(item);
    });
    
    document.getElementById('workoutSummaryModal').classList.add('active');
}

function handleWorkoutExit(isFinishing) {
    const duration = window.activeWorkout.duration;
    const min = Math.floor(duration / 60);
    
    if (isFinishing) {
        // El usuario quiere TERMINAR el entrenamiento
        if (min < 10) {
            // Preguntar si quiere eliminarlo por falta de tiempo
            const deleteWorkout = confirm(`Tu sesión de entrenamiento ha durado menos de 10 minutos (${min} min y ${duration % 60} seg). ¿Deseas eliminar este entrenamiento por falta de tiempo?`);
            if (deleteWorkout) {
                performDiscardWorkout(true);
            } else {
                // El usuario no quiere eliminarlo (Cancela). Regresa a la sesión de ejercicio.
                return;
            }
        } else {
            // Duró más de 10 minutos, preguntar si quiere guardar o descartar
            const saveWorkout = confirm("¿Deseas GUARDAR este entrenamiento? (Haz clic en Aceptar para guardarlo en tu historial, o en Cancelar para DESCARTARLO y perder los datos)");
            if (saveWorkout) {
                proceedToSaveWorkout();
            } else {
                const confirmDiscard = confirm("¿Estás seguro de que deseas DESCARTAR este entrenamiento por completo? Todos los registros se perderán de forma permanente.");
                if (confirmDiscard) {
                    performDiscardWorkout(false);
                }
            }
        }
    } else {
        // El usuario quiere DESCARTAR directamente
        const confirmDiscard = confirm("¿Estás seguro de que deseas DESCARTAR este entrenamiento por completo? Todos los registros se perderán.");
        if (confirmDiscard) {
            performDiscardWorkout(false);
        }
    }
    
    function proceedToSaveWorkout() {
        const completedSetsCount = window.activeWorkout.exercises.reduce((count, ex) => {
            return count + ex.sets.filter(s => s.completed).length;
        }, 0);
        if (completedSetsCount === 0) {
            alert("Completa al menos una serie (marca el check) antes de terminar el entrenamiento.");
            return;
        }
        showWorkoutSummaryModal(completedSetsCount);
    }
}

function discardWorkout() {
    handleWorkoutExit(false);
}

function finishWorkout() {
    handleWorkoutExit(true);
}

function closeWorkoutSummary() {
    document.getElementById('workoutSummaryModal').classList.remove('active');
    
    activeWorkoutStart = Date.now() - (window.activeWorkout.duration * 1000);
    activeTimerInterval = setInterval(() => {
        window.activeWorkout.duration = Math.floor((Date.now() - activeWorkoutStart) / 1000);
        const h = Math.floor(window.activeWorkout.duration / 3600);
        const m = Math.floor((window.activeWorkout.duration % 3600) / 60);
        const s = window.activeWorkout.duration % 60;
        
        const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
        const el1 = document.getElementById('activeTimer');
        if (el1) el1.innerText = formatted;
        
        const el2 = document.getElementById('activeTimerHeader');
        if (el2) el2.innerText = formatted;
    }, 1000);
}

function saveWorkoutLogToDB() {
    let totalReps = 0;
    let totalSets = 0;
    
    const exercisesLog = window.activeWorkout.exercises.map(ex => {
        const completedSets = ex.sets.filter(s => s.completed).map(s => {
            totalSets++;
            totalReps += s.reps;
            const finalWeight = ex.use_discs ? (parseFloat(ex.bar_weight) + parseFloat(s.weight)) : parseFloat(s.weight);
            return {
                set_number: s.set_number,
                weight: finalWeight,
                reps: s.reps,
                completed: true
            };
        });
        
        return {
            name: ex.name,
            sets: completedSets
        };
    }).filter(ex => ex.sets.length > 0);
    
    const logPayload = {
        routine_id: window.activeWorkout.routine_id,
        routine_title: window.activeWorkout.routine_title,
        duration: window.activeWorkout.duration,
        volume: window.activeWorkout.volume,
        total_sets: totalSets,
        total_reps: totalReps,
        exercises: exercisesLog
    };
    
    // Check for added exercises and achievements
    const routineId = window.activeWorkout.routine_id;
    const r = window.userRoutines.find(item => item.id == routineId);
    let addedExercises = [];
    let achievements = [];
    let routineChanged = false;
    
    if (r) {
        // Detect new exercises
        addedExercises = window.activeWorkout.exercises.filter(ex => {
            return !r.exercises.some(origEx => origEx.name.toLowerCase().trim() === ex.name.toLowerCase().trim());
        });
        
        // Check for achievements (progressive overload records) on existing exercises
        window.activeWorkout.exercises.forEach(ex => {
            const origEx = r.exercises.find(orig => orig.name.toLowerCase().trim() === ex.name.toLowerCase().trim());
            if (origEx) {
                ex.sets.forEach(s => {
                    if (s.completed) {
                        const origSet = origEx.sets.find(os => os.set_number == s.set_number);
                        const perfWeight = parseFloat(s.weight) || 0;
                        const perfReps = parseInt(s.reps) || 0;
                        const perfVolume = perfWeight * perfReps;
                        
                        if (origSet) {
                            const planWeight = parseFloat(origSet.weight) || 0;
                            const planReps = parseInt(origSet.reps) || 0;
                            const planVolume = planWeight * planReps;
                            
                            // Si supera el volumen o si no había registro (volumen previo era 0)
                            if (perfVolume > planVolume) {
                                if (planVolume > 0) {
                                    achievements.push({
                                        exercise: ex.name,
                                        set: s.set_number,
                                        oldWeight: planWeight,
                                        oldReps: planReps,
                                        newWeight: perfWeight,
                                        newReps: perfReps
                                    });
                                }
                                origSet.weight = perfWeight;
                                origSet.reps = perfReps.toString();
                                routineChanged = true;
                            }
                        } else {
                            // Si agregaron series dinámicamente y las completaron
                            origEx.sets.push({
                                set_number: s.set_number,
                                weight: perfWeight,
                                reps: perfReps.toString()
                            });
                            routineChanged = true;
                        }
                    }
                });
            }
        });
    }
    
    let shouldSaveToRoutine = false;
    if (addedExercises.length > 0 && r) {
        shouldSaveToRoutine = confirm(`Has agregado nuevos ejercicios a esta rutina (${addedExercises.map(e => e.name).join(', ')}). ¿Deseas agregarlos permanentemente a la plantilla de tu rutina "${r.title}"?`);
        if (shouldSaveToRoutine) {
            routineChanged = true;
        }
    }
    
    fetch('routines.php?ajax=save_workout_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logPayload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            if (routineChanged && r) {
                const updatedExercises = [
                    ...r.exercises.map(origEx => {
                        return {
                            name: origEx.name,
                            rest_time: origEx.rest_time,
                            use_discs: origEx.use_discs ? 1 : 0,
                            bar_weight: origEx.bar_weight,
                            sets: origEx.sets.map(s => {
                                return {
                                    set_number: s.set_number,
                                    weight: s.weight,
                                    reps: s.reps.toString()
                                };
                            })
                        };
                    })
                ];
                
                if (shouldSaveToRoutine) {
                    addedExercises.forEach(ex => {
                        updatedExercises.push({
                            name: ex.name,
                            rest_time: ex.rest_time || 60,
                            use_discs: ex.use_discs ? 1 : 0,
                            bar_weight: ex.bar_weight || 0.00,
                            sets: ex.sets.map(s => {
                                const finalWeight = s.weight === '' ? 0 : (parseFloat(s.weight) || 0);
                                const finalReps = s.reps === '' ? '10' : s.reps.toString();
                                return {
                                    set_number: s.set_number,
                                    weight: finalWeight,
                                    reps: finalReps
                                };
                            })
                        });
                    });
                }
                
                const updatePayload = {
                    id: r.id,
                    title: r.title,
                    exercises: updatedExercises
                };
                
                fetch('routines.php?ajax=save_routine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                })
                .then(res => res.json())
                .then(updateData => {
                    if (updateData.success) {
                        let msg = "¡Entrenamiento guardado y rutina original actualizada con éxito!\n";
                        if (achievements.length > 0) {
                            msg += "\n🏆 ¡NUEVO LOGRO! Has superado tu marca de volumen en:\n";
                            achievements.forEach(a => {
                                msg += `• ${a.exercise} (Serie ${a.set}): ${a.newWeight}kg x ${a.newReps} (Antes: ${a.oldWeight}kg x ${a.oldReps})\n`;
                            });
                            msg += "\nEstos valores se han establecido como tu nuevo objetivo normal a alcanzar.";
                        }
                        alert(msg);
                    } else {
                        alert("Entrenamiento guardado, pero hubo un error al actualizar la rutina: " + updateData.error);
                    }
                    finishExitFlow();
                })
                .catch(err => {
                    console.error(err);
                    alert("Entrenamiento guardado, pero hubo un error de red al actualizar la rutina.");
                    finishExitFlow();
                });
            } else {
                alert("¡Entrenamiento guardado con éxito!");
                finishExitFlow();
            }
        } else {
            alert(data.error || 'Error al guardar el entrenamiento.');
        }
    })
    .catch(err => console.error(err));
    
    function finishExitFlow() {
        document.getElementById('workoutSummaryModal').classList.remove('active');
        document.getElementById('workoutActiveOverlay').style.display = 'none';
        document.body.style.overflow = '';
        window.activeWorkout = null;
        loadRoutines();
    }
}

// ==========================================
// 10. MODAL EXPLORAR EJERCICIOS (EXERCISEDB)
// ==========================================

function openExploreModal() {
    document.getElementById('explore_search_input').value = '';
    document.getElementById('exploreResultsList').innerHTML = '<div class="chart-empty-state">Escribe algún término para iniciar la búsqueda en ExerciseDB.</div>';
    document.getElementById('exploreModal').classList.add('active');
}

function closeExploreModal() {
    document.getElementById('exploreModal').classList.remove('active');
}

function searchExercisesExplore() {
    const input = document.getElementById('explore_search_input');
    const query = input.value.trim();
    const resultsList = document.getElementById('exploreResultsList');
    
    if (query.length < 2) {
        alert("Escribe al menos 2 caracteres para buscar.");
        return;
    }
    
    resultsList.innerHTML = '<div class="chart-empty-state">Buscando en la base de datos externa...</div>';
    
    fetch(`routines.php?ajax=search_exercises&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        resultsList.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(ex => {
                const card = document.createElement('div');
                card.style.background = 'rgba(255,255,255,0.02)';
                card.style.border = '1px solid var(--border)';
                card.style.borderRadius = '8px';
                card.style.padding = '1rem';
                
                card.innerHTML = `
                    <h4 style="color:white; margin:0 0 0.5rem 0; text-transform:capitalize; font-size:1.05rem;">${escapeHtml(ex.name)}</h4>
                    <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; gap:1rem;">
                        <span>Cuerpo: <strong style="color:var(--primary);">${escapeHtml(ex.bodyPart || 'N/A')}</strong></span>
                        <span>Músculo: <strong style="color:var(--primary);">${escapeHtml(ex.target || 'N/A')}</strong></span>
                    </div>
                `;
                resultsList.appendChild(card);
            });
        } else {
            resultsList.innerHTML = '<div class="chart-empty-state">No se encontraron ejercicios en ExerciseDB. Intenta con otro término en inglés.</div>';
        }
    })
    .catch(err => {
        console.error(err);
        resultsList.innerHTML = '<div class="chart-empty-state" style="color:var(--primary);">Error al consultar ExerciseDB</div>';
    });
}

