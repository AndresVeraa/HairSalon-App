# HairSalon-App

Aplicación web para Hair Style - Salón & Barbería. Centraliza servicios,
clientes, fidelización, wallet, citas, liquidaciones y reportes.

## Requisitos

- Node.js 20 o superior.
- npm.
- Un proyecto de Supabase para el modo productivo.

## Instalación

```bash
npm ci
```

## Variables de entorno

Copia `.env.example` como `.env` y completa:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
VITE_ENABLE_LOCAL_DEMO=false
```

`VITE_SUPABASE_ANON_KEY` es la única clave permitida en el frontend. Nunca
uses una clave `service_role` ni una clave secreta.

El modo local de demostración solo se habilita explícitamente con
`VITE_ENABLE_LOCAL_DEMO=true`. No lo uses en producción: no proporciona
autenticación real ni persistencia centralizada.

Después de modificar `.env`, reinicia Vite.

## Base de datos

Ejecuta en el SQL Editor de Supabase, en este orden:

1. `supabase/migrations/20261001200000_hair_style_initial_schema.sql`
2. `supabase/migrations/20261002090500_customer_email_magic_link.sql`
3. `supabase/migrations/20261002094000_seed_default_staff.sql`
4. `supabase/migrations/20261002100000_harden_appointments.sql`
5. `supabase/migrations/20261002120000_production_operations.sql`

La migración `20261001214500_customer_qr_otp.sql` pertenece al flujo anterior
basado en teléfono/OTP. El flujo vigente utiliza correo y magic link; no
ejecutes ambas alternativas en una instalación nueva.

Después de ejecutar las migraciones:

- Configura la URL de redirección de Supabase Auth.
- Crea o invita los usuarios administrativos.
- Asocia cada usuario con una fila en `profiles` con rol `admin`.
- Verifica las políticas RLS usando usuarios cliente y administrador.

## Ejecución

```bash
npm run dev
```

Rutas principales:

- `/`: acceso y Wallet del cliente.
- `/admin`: acceso administrativo.
- `/?registro=1`: onboarding público mediante QR/NFC.

## Verificación local

Ejecuta antes de crear un Pull Request:

```bash
npm run lint
npm test -- --run
npm run build
```

El pipeline de GitHub Actions ejecuta automáticamente los mismos pasos en
cada push a `main` y en cada Pull Request.

## Seguridad operativa

- No subas `.env` al repositorio.
- No compartas claves `service_role`.
- Usa RLS como control de autorización real; ocultar botones no es seguridad.
- El administrador debe utilizar `/admin`.
- Los tokens QR/NFC identifican una tarjeta, pero no reemplazan la
  autenticación del cliente.
- Revisa los logs y errores de Supabase sin incluir datos sensibles.
- Ejecuta las migraciones en un entorno de prueba antes de producción.

## Reglas de negocio críticas

- El bono de bienvenida vigente es de 10 puntos.
- Los estados de cita válidos son `Pendiente`, `Confirmada`, `Rechazada`,
  `Cancelada` y `Completada`.
- Las citas deben ser futuras, de lunes a sábado, entre 08:00 y 20:00,
  hora de Colombia.
- PostgreSQL valida la fecha, el horario y los conflictos de citas.
- Las citas incluyen duración y estilista opcional; PostgreSQL evita
  solapamientos de citas activas.
- Los ajustes de puntos solo se realizan mediante la función administrativa
  auditada `adjust_customer_points`.
- Los cambios de servicios y citas quedan registrados en
  `admin_audit_log`.
- Los puntos de servicios productivos deben provenir del flujo centralizado
  de Supabase; el frontend no debe considerarse una fuente de verdad.

## Estructura principal

```text
src/components/       Componentes visuales por módulo
src/services/         Integraciones con Supabase y Auth
src/utils/            Reglas de dominio, cálculos y persistencia de demo
supabase/migrations/  Migraciones reproducibles de base de datos
.github/workflows/    Integración continua
```

## Limitaciones conocidas del MVP

- Web NFC no está disponible en todos los navegadores, especialmente en
  iPhone; QR es la alternativa compatible.
- La disponibilidad actual valida conflictos por instante exacto. Modelar
  múltiples sucursales y calendarios por recurso es una evolución necesaria.

## Pruebas de integración con Supabase

Las pruebas unitarias no necesitan credenciales. Las pruebas reales de
Supabase se ejecutan solo cuando se solicitan explícitamente:

```powershell
$env:RUN_SUPABASE_INTEGRATION='true'
$env:VITE_SUPABASE_URL='https://tu-proyecto.supabase.co'
$env:VITE_SUPABASE_ANON_KEY='tu-clave-anon'
npm test -- --run src/services/supabase.integration.test.js
```

Estas pruebas usan únicamente la clave anon y verifican que un cliente
anónimo no lea servicios ni cree citas. No uses una `service_role` key en
pruebas del frontend.
- Apple Wallet y Google Wallet nativos requieren backend, certificados y
  credenciales de emisor.

## Definition of Done

Una tarea no se considera terminada hasta que:

1. Cumple los criterios de aceptación.
2. No expone secretos.
3. Tiene pruebas para sus reglas críticas.
4. Pasa lint, tests y build.
5. Mantiene o actualiza la documentación relacionada.
6. Ha sido revisada antes de fusionarse a `main`.
