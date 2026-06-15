# Diseño: Gmail OAuth2 Admin Login para OneKey Setter AI

**Fecha:** 2026-06-14  
**Autor:** Claude Code  
**Estado:** Diseño Aprobado

---

## Propósito

Reemplazar el sistema de ADMIN_SECRET simple por un login profesional con Gmail OAuth2, permitiendo:
- Múltiples admins (2-3 inicial, escalable)
- Autoinvitación entre admins
- Dos roles: Admin (full access) y Ejecutivo (lectura + sesiones)
- Control de acceso por dominio de email (@lupchile.com, @onekeybroker.com, @lupar.cl)

---

## Arquitectura General

```
Google OAuth2
     ↓
Frontend (popup OAuth)
     ↓
Backend valida email & dominio
     ↓
JWT token → localStorage
     ↓
Admin/Ejecutivo accede a sistema
```

---

## Base de Datos

### Tabla: `admin_users`

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  role VARCHAR(50) DEFAULT 'ejecutivo', -- 'admin' | 'ejecutivo'
  estado VARCHAR(50) DEFAULT 'activo', -- 'activo' | 'inactivo'
  invitado_por VARCHAR(255), -- email de quién lo invitó (solo admins)
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  
  -- Validaciones
  CONSTRAINT valid_role CHECK (role IN ('admin', 'ejecutivo')),
  CONSTRAINT valid_estado CHECK (estado IN ('activo', 'inactivo')),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@(lupchile\.com|onekeybroker\.com|lupar\.cl)$')
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_estado ON admin_users(estado);
```

### RLS Policies

```
SELECT: Público (is_active=true)
INSERT: Solo backend (service role)
UPDATE: Solo backend (service role)
DELETE: Solo backend (service role)
```

---

## Flujo de Autenticación

### 1. Login Inicial (con Gmail)

```
Usuario → Click "🔐 Login con Gmail"
    ↓
Frontend abre popup Google OAuth
    ↓
Usuario autoriza en Google
    ↓
Google redirige a: /auth/google/callback?code=AUTH_CODE
    ↓
Backend intercambia code por Google token
    ↓
Backend extrae email de Google
    ↓
Validar dominio: @lupchile.com || @onekeybroker.com || @lupar.cl
    ↓
¿Email en admin_users?
    ├─ SÍ → Usar role almacenado
    └─ NO → Crear registro con role: "ejecutivo"
    ↓
Generar JWT propio
    ↓
Frontend guarda en localStorage
    ↓
Redirige a Station 1
```

### 2. JWT Token

**Payload:**
```json
{
  "email": "user@lupchile.com",
  "role": "admin",
  "adminId": "uuid-xxx",
  "iat": 1700000000,
  "exp": 1700604800
}
```

**Propiedades:**
- Expira en: 7 días
- Firma: HS256 con `process.env.JWT_SECRET`
- Almacenado en: `localStorage.getItem('adminToken')`

### 3. Invitación de Nuevo Admin

```
Admin → Click "Invitar nuevo admin"
    ↓
Ingresa email (ej: newadmin@lupchile.com)
    ↓
Backend valida:
    - Email en dominio permitido
    - Email no existe en admin_users
    ↓
Crea registro con role: "admin"
    ↓
Envía email con link: /auth/invite?email=xxx&token=yyy
    ↓
Nuevo admin recibe email → Click link → Auto-login
    ↓
Sesión creada, puede subir proyectos
```

---

## Endpoints Backend

### `POST /auth/google/callback`

**Propósito:** Intercambiar Google auth code por JWT propio

**Request:**
```json
{
  "code": "4/0AY-...",
  "clientId": "xxx.apps.googleusercontent.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "jwt": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@lupchile.com",
  "nombre": "Rodrigo Callejón",
  "role": "admin"
}
```

**Errors:**
- `401`: Email no en dominio permitido
- `400`: Code inválido o expirado
- `500`: Error al validar con Google

---

### `POST /auth/invite`

**Propósito:** Admin invita a otro admin

**Headers:**
```
Authorization: Bearer [JWT]
```

**Request:**
```json
{
  "email": "newadmin@lupchile.com",
  "nombre": "Nombre Completo"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email de invitación enviado a newadmin@lupchile.com"
}
```

**Errors:**
- `401`: JWT inválido o expirado
- `403`: Solo admins pueden invitar
- `400`: Email ya existe en admin_users
- `400`: Email no en dominio permitido

---

### `GET /auth/verify-token`

**Propósito:** Verificar que JWT es válido (frontend lo usa al recargar página)

**Headers:**
```
Authorization: Bearer [JWT]
```

**Response (200):**
```json
{
  "valid": true,
  "email": "user@lupchile.com",
  "role": "admin"
}
```

**Errors:**
- `401`: Token expirado
- `401`: Token inválido

---

### `POST /auth/logout`

**Propósito:** Limpiar sesión (principalmente frontend)

**Headers:**
```
Authorization: Bearer [JWT]
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada"
}
```

---

## Frontend Changes

### Station 1 (Apertura)

**Reemplazar:**
```javascript
// Viejo: botón 🔐 con ADMIN_SECRET
e('button', {
  onClick: () => { setAdminMode(true); }
}, '🔐')
```

**Por:**
```javascript
// Nuevo: botón con login Gmail
e('button', {
  onClick: () => {
    // Abre popup Google OAuth
    window.location.href = '/auth/google/login';
  }
}, '🔐 Login con Gmail')
```

### Manejo de Token

**Al cargar página:**
```javascript
React.useEffect(() => {
  const jwt = localStorage.getItem('adminToken');
  if (jwt) {
    // Verificar que token sigue válido
    fetch('/auth/verify-token', {
      headers: { 'Authorization': `Bearer ${jwt}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data.valid) {
        setAdminEmail(data.email);
        setAdminRole(data.role);
        setAdminMode(true);
      } else {
        localStorage.removeItem('adminToken');
      }
    });
  }
}, []);
```

**Botón Cerrar Sesión:**
```javascript
e('button', {
  onClick: () => {
    localStorage.removeItem('adminToken');
    setAdminMode(false);
    setAdminEmail(null);
    setAdminRole(null);
    window.location.href = '/';
  }
}, 'Cerrar sesión')
```

### Permisos en UI

**Para Ejecutivos:**
- Pueden ver catálogo ✓
- Pueden seleccionar proyectos ✓
- Pueden hacer sesiones ✓
- NO pueden acceder a modo admin ✗
- NO pueden subir proyectos ✗
- NO pueden ver botón 🔐 ✗

**Para Admins:**
- Todo lo de ejecutivos ✓
- Modo admin (🔐) ✓
- Subir/editar/eliminar proyectos ✓
- Invitar nuevos admins ✓

---

## Seguridad

### Variables de Entorno

```env
# Backend (.env)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=yyy
JWT_SECRET=secret-muy-largo-y-seguro
JWT_EXPIRES_IN=7d

# Frontend (ya está configurado)
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Validaciones

1. **Dominio:** Solo @lupchile.com, @onekeybroker.com, @lupar.cl
2. **Token:** Verificar firma HS256
3. **Expiración:** Rechazar si exp < ahora
4. **Role:** Solo admin puede invitar
5. **CORS:** Restringido a localhost:3000 + dominio de Railway

### Manejo de Errores

| Error | Causa | Acción |
|-------|-------|--------|
| 401 Unauthorized | Token expirado | Pedir login nuevamente |
| 403 Forbidden | Dominio no permitido | Mostrar: "Usa correo de la empresa" |
| 403 Forbidden | No es admin | Rechazar acceso admin |
| 400 Bad Request | Email ya existe | Mostrar: "Este admin ya existe" |

---

## Testing (Manual)

1. **Login ejecutivo:** @lupchile.com → Acceso lectura ✓
2. **Login admin:** @lupchile.com → Acceso admin ✓
3. **Login dominio no permitido:** @gmail.com → 403 ✓
4. **Admin invita ejecutivo:** Envío email ✓
5. **Token expiración:** 7 días → Recarga pide login ✓
6. **Cerrar sesión:** Remove localStorage ✓

---

## Decisiones de Diseño

| Decisión | Razón |
|----------|-------|
| OAuth2 popup | Seguro, estándar industria, no guardamos contraseñas |
| JWT 7 días | Balance entre seguridad y conveniencia |
| Auto-crear ejecutivo | Permite acceso inmediato a cualquier correo de empresa |
| Dominio whitelist | Control de quién puede entrar |
| localStorage | Persistencia entre sesiones |

---

## Scope & Futuros

**Fase 1 (ahora):**
- Login con Gmail ✓
- Dos roles (admin/ejecutivo) ✓
- Invitaciones de admin ✓

**Fase 2 (futuro):**
- Desactivar/reactivar usuarios
- Audit log de acciones
- Email de confirmación de invitación
- Dashboard admin (quién subió qué, cuándo)

---

## Dependencias Externas

- `@react-oauth/google` (frontend)
- `google-auth-library` (backend)
- `jsonwebtoken` (backend)

