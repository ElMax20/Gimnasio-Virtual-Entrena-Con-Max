-- supabase_schema.sql
-- Copia y pega este script en el editor SQL de tu panel de Supabase para configurar la base de datos.

-- 1. Crear la tabla de perfiles de usuario
create table public.user_profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    email text not null,
    profile_data jsonb default null,
    weight_history jsonb default '[]'::jsonb,
    meals jsonb default '{}'::jsonb,
    routines jsonb default '[]'::jsonb,
    workout_logs jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar seguridad de nivel de fila (Row Level Security - RLS)
alter table public.user_profiles enable row level security;

-- 3. Crear políticas RLS para controlar el acceso a los datos
-- Permitir lectura pública (select) para que el login pueda resolver el correo del usuario usando su nombre de usuario
create policy "Permitir lectura publica de perfiles"
on public.user_profiles for select
using (true);

-- Permitir inserción pública durante el registro de nuevos usuarios
create policy "Permitir insercion de nuevos perfiles"
on public.user_profiles for insert
with check (true);

-- Permitir a los usuarios modificar únicamente su propio perfil
create policy "Permitir modificacion de perfil propio"
on public.user_profiles for update
using (auth.uid() = id);

-- 4. Habilitar la replicación de perfiles automática cuando se confirme la cuenta
-- Nota: La inserción del perfil se maneja directamente desde la app en JS,
-- por lo que este script SQL es suficiente para comenzar de inmediato.
