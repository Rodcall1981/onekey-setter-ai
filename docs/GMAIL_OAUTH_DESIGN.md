# Diseño: Gmail OAuth2 Admin Login para OneKey Setter AI

**Fecha:** 2026-06-14  
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
  
  CONSTRAINT valid_role CHECK (role IN ('admin', 'ejecutivo')),
  CONSTRAINT valid_estado CHECK (estado IN ('activo', 'inactivo')),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@(lupchile\.com|onekeybroker\.com|lupar\.cl)$')
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_estado ON admin_users(estado);
```

---

## Flujo de Autenticación

### 1. Login con Gmail

```
Usuario → Click "🔐 Login con Gmail"
    ↓
Frontend abre popup Google OAuth
    ↓
Usuario autoriza en Google
    ↓
Google devuelve auth code
    ↓
Backend intercambia code por Google token
    ↓
Backend extrae email
    ↓
Validar dominio: @lupchile.com || @onekeybroker.com || @lupar.cl
    ↓
¿Email en admin_users?
    ├─ SÍ → Usar role almacenado
    └─ NO → Crear registro con role: "ejecutivo"
    ↓
Generar JWT propio (expira en 7 días)
    ↓
Frontend guarda en localStorage
    ↓
Acceso al sistema
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

---

## Backend Endpoints

### `POST /auth/google/callback`

Intercambiar Google auth code por JWT propio

**Request:**
```json
{
  "code": "4/0AY-...",
  "clientId": "xxx.apps.googleusercontent.com"
}
```

**Response:**
```json
{
  "success": true,
  "jwt": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@lupchile.com",
  "nombre": "Rodrigo",
  "role": "admin"
}
```

---

### `POST /auth/invite`

Admin invita a otro admin

**Headers:** `Authorization: Bearer [JWT]`

**Request:**
```json
{
  "email": "newadmin@lupchile.com",
  "nombre": "Nombre"
}
```

**Errors:**
- `403`: Solo admins pueden invitar
- `400`: Email ya existe
- `400`: Email no en dominio permitido

---

### `GET /auth/verify-token`

Verificar que JWT es válido (al recargar página)

**Headers:** `Authorization: Bearer [JWT]`

**Response:**
```json
{
  "valid": true,
  "email": "user@lupchile.com",
  "role": "admin"
}
```

---

### `POST /auth/logout`

Limpiar sesión

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada"
}
```

---

## Frontend Changes

### Station 1 - Reemplazar botón admin

**Viejo:**
```javascript
e('button', { onClick: () => setAdminMode(true) }, '🔐')
```

**Nuevo:**
```javascript
e('button', {
  onClick: () => {
    window.location.href = '/auth/google/login';
  }
}, '🔐 Login con Gmail')
```

### Verificar token al cargar

```javascript
React.useEffect(() => {
  const jwt = localStorage.getItem('adminToken');
  if (jwt) {
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

---

## Permisos

**Ejecutivos:**
- ✓ Ver catálogo de proyectos
- ✓ Seleccionar proyectos
- ✓ Hacer sesiones
- ✗ No pueden acceder a modo admin
- ✗ No pueden subir/editar proyectos

**Admins:**
- ✓ Todo lo de ejecutivos
- ✓ Modo admin (🔐)
- ✓ Subir/editar/eliminar proyectos
- ✓ Invitar nuevos admins

---

## Seguridad

**Variables de entorno requeridas:**
```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=yyy
JWT_SECRET=secret-muy-largo-y-seguro
JWT_EXPIRES_IN=7d
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

**Validaciones:**
1. Dominio: Solo @lupchile.com, @onekeybroker.com, @lupar.cl
2. Token: Verificar firma HS256
3. Expiración: Rechazar si expiró
4. Role: Solo admin puede invitar

---

## Fases

**Fase 1 (ahora):**
- ✓ Login con Gmail
- ✓ Dos roles (admin/ejecutivo)
- ✓ Invitaciones

**Fase 2 (futuro):**
- Desactivar/reactivar usuarios
- Audit log
- Dashboard admin

---

## ¿Ok?

¿Está todo claro? Si quieres cambios, avísame. Una vez aprobado, te doy el paso a paso detallado "para dummies" de implementación.
