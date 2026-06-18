// supabase-config.js - Configuración del cliente Supabase
// Reemplaza los valores de abajo con las credenciales de tu proyecto de Supabase.
// Puedes encontrarlas en tu panel de Supabase -> Settings -> API.

const SUPABASE_URL = 'https://qawmrrbeaxehpfnsrnjf.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_2u_WLqirdSBnaSOgcCyW9A_TPEf6rrV';

// Variable global que contendrá la instancia del cliente Supabase
let supabaseClient = null;

// Inicialización segura del cliente Supabase
if (typeof supabase !== 'undefined' && 
    SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && 
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
    
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase inicializado correctamente.");
    } catch (e) {
        console.error("Error al inicializar Supabase:", e);
    }
} else {
    console.warn(
        "Supabase no configurado o script de Supabase no cargado. " + 
        "La aplicación funcionará en modo local-demostración usando LocalStorage."
    );
}
