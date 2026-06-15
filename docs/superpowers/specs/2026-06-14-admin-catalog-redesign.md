# Admin Catalog Redesign Specification

> **For agentic workers:** Use superpowers:writing-plans to create the implementation plan.

**Goal:** Redesign the admin catalog management screen with a professional sidebar layout, project cards with images, editable projects, and admin invitation functionality.

**Architecture:** 
- Sidebar-based navigation with expandable forms (Nuevo Proyecto, Invitar Admin)
- Grid of project cards with images, complete information, and actions (edit/delete)
- Separate edit page for project modification
- Consistent color scheme (dark blue #1f2937, grays, whites)

**Tech Stack:** React (vanilla), Supabase (PUT endpoint for edits), existing OAuth/JWT auth

---

## 1. Layout & Navigation

**Sidebar (280px, fixed, dark blue #1f2937):**
- Logo "onekey" at top
- Title "CATÁLOGO"
- Two main buttons: "Nuevo Proyecto" and "Invitar Admin" (expandable forms)
- Stats section showing: total projects, last updated, admin count
- "Volver" button at bottom (returns to Station 1)

**Main Content Area:**
- White header bar with "Catálogo de Proyectos" title
- Responsive grid of project cards (3 columns on desktop, 2 on tablet, 1 on mobile)
- Empty state: "No hay proyectos aún. Crea el primero con el botón Nuevo Proyecto"

---

## 2. Project Cards

Each card displays:

**Image Section (160px height):**
- Shows first image from `image_urls` array
- Placeholder if no image: gradient background with project name centered
- Used image aspect ratio: cover (center crop)

**Content Section (below image):**
- **Header:** Project name + Location (Comuna)
- **Divider line**
- **Pricing row:** 
  - Precio: [amount] UF (large, bold)
  - Estado: [badge with color] 
    - Blanco → light blue (#dbeafe)
    - Verde → light green (#dcfce7)
    - Entrega inmediata → light amber (#fef3c7)
- **Amenities:** 2-3 main amenities as bullet points
- **Actions row:** "Editar" button (dark) + "Eliminar" button (red)

Card dimensions: 320px width, 400px height, 12px border radius

---

## 3. Expandable Form: Nuevo Proyecto

**When collapsed:**
- Button shows "+ Nuevo Proyecto" with background #374151

**When expanded:**
- Form appears inside sidebar below button
- Fields shown: Nombre, Estado (dropdown), Comuna
- "Guardar" button (#10b981) + "Cancelar" button (#4b5563)
- On save:
  - Validates required fields (project_name, comuna, address must exist)
  - POSTs to `/api/admin/catalog` with JWT token
  - Resets form and collapses
  - Reloads catalog grid
- On cancel: collapses form, clears fields

**Visible fields in sidebar form (simplified):**
- Nombre del Proyecto
- Estado (dropdown: Blanco, Verde, Entrega inmediata)
- Comuna

**Full form fields (for reference):**
- project_name, project_state, comuna, address, gmaps_link, price_from_uf, local_rent_uf, appreciation_percent, amenities, typologies, description, image_urls

---

## 4. Expandable Form: Invitar Admin

**When collapsed:**
- Button shows "👤 Invitar Admin" with background #374151

**When expanded:**
- Form appears inside sidebar below button
- Fields: Email, Nombre
- "Enviar" button (#10b981) + "Cancelar" button (#4b5563)
- On send:
  - Validates email format
  - Checks domain: only @onekeybroker.com, @lupchile.com, @lupar.cl allowed
  - POSTs to `/auth/invite` with JWT token + {email, nombre}
  - Shows success message: "Invitación enviada a [email]"
  - Resets form and collapses
  - Updates stats (admin count increments)
- On cancel: collapses form, clears fields

---

## 5. Edit Project Page

**Route:** `/admin/projects/edit/:projectId`

**Layout:**
- Header with "Editar Proyecto: [Name]" title
- Back button to return to catalog
- Same form structure as "Nuevo Proyecto" but with ALL fields (name, state, comuna, address, maps link, pricing, amenities, typologies, description, images)
- Pre-populated with project data from `adminCatalog`
- Button text: "Guardar Cambios" instead of "Guardar"
- On save:
  - PUTs to `/api/admin/catalog/:projectId` with JWT token
  - Shows "✅ Proyecto actualizado" message
  - Navigates back to catalog after 1 second

---

## 6. Delete Action

- Each card has "Eliminar" button (red #ef4444)
- On click: confirmation dialog "¿Eliminar este proyecto del catálogo?"
- On confirm:
  - DELETEs `/api/admin/catalog/:projectId` with JWT token
  - Removes card from grid
  - Shows "✅ Proyecto eliminado" message
- On cancel: dialog closes, no action

---

## 7. Color System

**Sidebar & Buttons:**
- Sidebar background: #1f2937 (dark blue-gray)
- Expanded form button: #10b981 (green)
- Collapsed buttons: #374151 (lighter gray)
- Cancel/Secondary: #4b5563 (medium gray)
- Delete button: #ef4444 (red)
- Text: #fff (white) on dark, #1f2937 on white

**Project States (Card Headers):**
- Blanco: #dbeafe (light blue background)
- Verde: #dcfce7 (light green background)
- Entrega inmediata: #fef3c7 (light amber background)

**Badges/Text:**
- Primary: #1f2937 (dark blue-gray)
- Secondary: #6b7280 (medium gray)
- Tertiary: #9ca3af (light gray)

---

## 8. State Management

**Frontend state variables:**
- `adminCatalog` - array of projects (exists)
- `adminNewProject` - form state for new project (exists)
- `formExpandedNewProject` - boolean, whether "Nuevo Proyecto" form is expanded
- `formExpandedInviteAdmin` - boolean, whether "Invitar Admin" form is expanded
- `inviteAdminForm` - {email, nombre} for invite form
- `editingProjectId` - projectId when in edit mode (for routing)

**Backend endpoints (already exist):**
- `POST /api/admin/catalog` - create project (needs JWT validation)
- `PUT /api/admin/catalog/:projectId` - edit project (needs JWT validation)
- `DELETE /api/admin/catalog/:projectId` - delete project (needs JWT validation)
- `POST /auth/invite` - invite admin (needs JWT validation)
- `GET /api/admin/catalog` - list projects (needs JWT validation)

---

## 9. Error Handling

- Network errors: Show "Error: [message]" in red banner
- Validation errors: Show field-level error messages
- Auth errors (401): Clear token, redirect to login
- Duplicate email on invite: "Este email ya está registrado"
- Invalid domain: "El email debe ser de @onekeybroker.com, @lupchile.com o @lupar.cl"

---

## 10. Responsive Design

- **Desktop (≥1024px):** 3-column grid, sidebar always visible
- **Tablet (768-1023px):** 2-column grid, sidebar can collapse/expand
- **Mobile (<768px):** 1-column grid, sidebar collapses to hamburger menu

---

## 11. Image Handling

- Each project can have multiple images in `image_urls` array
- Card displays: first image in array (`image_urls[0]`)
- If no images: placeholder with gradient background + project name
- Image dimensions: 320px width × 160px height, cover fit (center crop)
- Supported formats: JPG, PNG, WebP

---

## 12. Accessibility & UX

- All buttons have clear labels (no icon-only)
- Form validation messages shown inline
- Expandable forms don't require page navigation
- Back button clearly visible on edit page
- Success messages displayed for 3 seconds
- Confirmations required before destructive actions (delete)

---

## Summary of Changes

| Feature | Status | Notes |
|---------|--------|-------|
| Sidebar layout | New | Fixed 280px sidebar with dark theme |
| Project cards with images | New | 320×400px cards, 3-column grid |
| Expandable form: Nuevo Proyecto | Existing + UI | Move form to sidebar, make expandable |
| Expandable form: Invitar Admin | New | Add invite admin form to sidebar |
| Edit project page | New | Create separate edit route/screen |
| Delete project action | Existing | Keep current logic, improve UI |
| Image display on cards | New | Show first image with fallback |
| Color system | Update | Unified palette (dark blue, grays, status colors) |
