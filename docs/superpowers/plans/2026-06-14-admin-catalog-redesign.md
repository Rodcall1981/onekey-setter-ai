# Admin Catalog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign admin catalog management screen with sidebar navigation, project cards with images, editable projects, and admin invitation functionality.

**Architecture:** 
- Sidebar-based layout with expandable forms (Nuevo Proyecto, Invitar Admin)
- Grid of project cards with images, complete project info, and action buttons
- Separate edit project page accessed from card
- State management for form expansion and edit mode
- Unified color scheme (dark blue sidebar, status-colored cards)

**Tech Stack:** React (vanilla), Supabase, JWT auth (existing)

---

## File Structure

**Files to modify:**
- `src/frontend/app.js` - Main app component
  - Add state variables for form expansion
  - Add handlers: `handleEditProject`, `handleInviteAdmin`, `handleUpdateProject`
  - Rewrite screen `admin_projects` with sidebar + cards layout
  - Create new screen `admin_edit_project`
  - Update handlers: `handleAdminSaveProject`, `handleAdminDeleteProject` to use JWT

---

## Task 1: Add State Variables for Form Expansion

**Files:**
- Modify: `src/frontend/app.js:300-325`

- [ ] **Step 1: Locate state initialization section**

Find the line where OAuth state is initialized (around line 311). After `const [adminRole, setAdminRole] = useState(null);`, add form expansion states.

- [ ] **Step 2: Add form expansion state variables**

```javascript
  // Form expansion states for admin sidebar
  const [formExpandedNewProject, setFormExpandedNewProject] = useState(false);
  const [formExpandedInviteAdmin, setFormExpandedInviteAdmin] = useState(false);
  const [inviteAdminForm, setInviteAdminForm] = useState({ email: '', nombre: '' });
```

Insert these three lines after line 313 (after `setAdminRole` declaration).

- [ ] **Step 3: Commit**

```bash
git add src/frontend/app.js
git commit -m "feat: add state for expandable admin forms"
```

---

## Task 2: Add Handler for Inviting Admins

**Files:**
- Modify: `src/frontend/app.js:1000-1150`

- [ ] **Step 1: Locate admin handlers section**

Find where `handleAdminSaveProject` is defined (around line 1034). Add `handleInviteAdmin` after `handleAdminDeleteProject`.

- [ ] **Step 2: Add inviteAdmin handler**

```javascript
  // ADMIN: Invitar nuevo admin
  const handleInviteAdmin = async () => {
    const { email, nombre } = inviteAdminForm;

    if (!email.trim() || !nombre.trim()) {
      setError('Email y nombre son obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    const allowedDomains = ['onekeybroker.com', 'lupchile.com', 'lupar.cl'];
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      setError('El email debe ser de @onekeybroker.com, @lupchile.com o @lupar.cl');
      return;
    }

    try {
      const resp = await fetch('/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ email, nombre })
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || 'Error al invitar');
      }

      setError(null);
      alert(`✅ Invitación enviada a ${email}`);
      setInviteAdminForm({ email: '', nombre: '' });
      setFormExpandedInviteAdmin(false);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };
```

Insert after the `handleAdminDeleteProject` function (after line 1150 or so).

- [ ] **Step 3: Commit**

```bash
git add src/frontend/app.js
git commit -m "feat: add handleInviteAdmin function"
```

---

## Task 3: Add Handler for Editing Projects

**Files:**
- Modify: `src/frontend/app.js:1155-1220`

- [ ] **Step 1: Add handleEditProject function**

```javascript
  // ADMIN: Ir a pantalla de edición
  const handleEditProject = (projectId) => {
    setStep('admin_edit_project');
    // Store the project ID in a ref or state for the edit screen to access
    window.editingProjectId = projectId;
  };
```

Insert after `handleInviteAdmin` function.

- [ ] **Step 2: Add handleUpdateProject function**

```javascript
  // ADMIN: Guardar cambios en proyecto
  const handleUpdateProject = async () => {
    const projectId = window.editingProjectId;
    
    if (!projectId) {
      setError('No project selected');
      return;
    }

    if (!adminNewProject.project_name || !adminNewProject.comuna || !adminNewProject.address) {
      setError('Campos obligatorios: nombre, comuna, dirección');
      return;
    }

    if (!adminToken) {
      setError('Debes estar autenticado');
      return;
    }

    setAdminUploadingImages(true);
    setError(null);

    try {
      const resp = await fetch(`/api/admin/catalog/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(adminNewProject)
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.message || 'Error al guardar');
      }

      const data = await resp.json();
      
      // Update catalog
      setAdminCatalog(adminCatalog.map(p => p.id === projectId ? data.project : p));
      
      alert('✅ Proyecto actualizado');
      setAdminNewProject({
        project_name: '', project_state: '', comuna: '', address: '', gmaps_link: '',
        amenities: '', typologies: '', price_from_uf: '', local_rent_uf: '',
        appreciation_percent: '', description: '', image_urls: []
      });
      
      setTimeout(() => setStep('admin_projects'), 1000);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setAdminUploadingImages(false);
    }
  };
```

Insert after `handleEditProject`.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/app.js
git commit -m "feat: add handleEditProject and handleUpdateProject functions"
```

---

## Task 4: Rewrite Admin Projects Screen with Sidebar and Cards

**Files:**
- Modify: `src/frontend/app.js:1989-2200` (entire admin_projects screen)

- [ ] **Step 1: Locate the admin_projects screen**

Find `if (step === 'admin_projects' && adminToken && adminRole === 'admin')` around line 1989.

- [ ] **Step 2: Replace entire admin screen with new sidebar + cards layout**

Delete from line 1989 to the end of that screen block, and replace with:

```javascript
  if (step === 'admin_projects' && adminToken && adminRole === 'admin') {
    return e('div', { style: { display: 'flex', minHeight: '100vh', background: '#f3f4f6' } },
      // SIDEBAR
      e('div', { style: { width: '280px', background: '#1f2937', color: '#fff', padding: '20px', overflowY: 'auto', flexShrink: 0 } },
        e('div', { style: { fontSize: '24px', fontWeight: '300', letterSpacing: '2px', marginBottom: '20px' } }, 'onekey'),
        e('div', { style: { fontSize: '12px', fontWeight: '600', color: '#9ca3af', marginBottom: '20px' } }, 'CATÁLOGO'),

        // NUEVO PROYECTO BUTTON
        e('button', {
          onClick: () => {
            setFormExpandedNewProject(!formExpandedNewProject);
            setFormExpandedInviteAdmin(false);
            if (!formExpandedNewProject) {
              setAdminNewProject({ project_name: '', project_state: '', comuna: '', address: '', gmaps_link: '', amenities: '', typologies: '', price_from_uf: '', local_rent_uf: '', appreciation_percent: '', description: '', image_urls: [] });
            }
          },
          style: { width: '100%', padding: '12px', background: formExpandedNewProject ? '#10b981' : '#374151', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', transition: 'background 0.3s' }
        }, '+ Nuevo Proyecto'),

        // NUEVO PROYECTO FORM
        formExpandedNewProject && e('div', { style: { background: '#374151', padding: '16px', borderRadius: '8px', marginBottom: '16px' } },
          e('div', { style: { marginBottom: '12px' } },
            e('label', { style: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '6px' } }, 'NOMBRE'),
            e('input', {
              value: adminNewProject.project_name,
              onChange: (evt) => setAdminNewProject({ ...adminNewProject, project_name: evt.target.value }),
              placeholder: 'Nombre del proyecto',
              style: { width: '100%', padding: '8px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', background: '#2d3748', color: '#fff' }
            })
          ),
          e('div', { style: { marginBottom: '12px' } },
            e('label', { style: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '6px' } }, 'ESTADO'),
            e('select', {
              value: adminNewProject.project_state,
              onChange: (evt) => setAdminNewProject({ ...adminNewProject, project_state: evt.target.value }),
              style: { width: '100%', padding: '8px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', background: '#2d3748', color: '#fff' }
            },
              e('option', { value: '' }, 'Selecciona...'),
              e('option', { value: 'Blanco' }, 'Blanco'),
              e('option', { value: 'Verde' }, 'Verde'),
              e('option', { value: 'Entrega inmediata' }, 'Entrega inmediata')
            )
          ),
          e('div', { style: { marginBottom: '12px' } },
            e('label', { style: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '6px' } }, 'COMUNA'),
            e('input', {
              value: adminNewProject.comuna,
              onChange: (evt) => setAdminNewProject({ ...adminNewProject, comuna: evt.target.value }),
              placeholder: 'Comuna',
              style: { width: '100%', padding: '8px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', background: '#2d3748', color: '#fff' }
            })
          ),
          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
            e('button', {
              onClick: () => {
                setFormExpandedNewProject(false);
                setAdminNewProject({ project_name: '', project_state: '', comuna: '', address: '', gmaps_link: '', amenities: '', typologies: '', price_from_uf: '', local_rent_uf: '', appreciation_percent: '', description: '', image_urls: [] });
              },
              style: { padding: '8px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
            }, 'Cancelar'),
            e('button', {
              onClick: handleAdminSaveProject,
              style: { padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
            }, 'Guardar')
          )
        ),

        // INVITAR ADMIN BUTTON
        e('button', {
          onClick: () => {
            setFormExpandedInviteAdmin(!formExpandedInviteAdmin);
            setFormExpandedNewProject(false);
            if (!formExpandedInviteAdmin) {
              setInviteAdminForm({ email: '', nombre: '' });
            }
          },
          style: { width: '100%', padding: '12px', background: formExpandedInviteAdmin ? '#10b981' : '#374151', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', transition: 'background 0.3s' }
        }, '👤 Invitar Admin'),

        // INVITAR ADMIN FORM
        formExpandedInviteAdmin && e('div', { style: { background: '#374151', padding: '16px', borderRadius: '8px', marginBottom: '16px' } },
          e('div', { style: { marginBottom: '12px' } },
            e('label', { style: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '6px' } }, 'EMAIL'),
            e('input', {
              value: inviteAdminForm.email,
              onChange: (evt) => setInviteAdminForm({ ...inviteAdminForm, email: evt.target.value }),
              placeholder: 'admin@onekeybroker.com',
              style: { width: '100%', padding: '8px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', background: '#2d3748', color: '#fff' }
            })
          ),
          e('div', { style: { marginBottom: '12px' } },
            e('label', { style: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '6px' } }, 'NOMBRE'),
            e('input', {
              value: inviteAdminForm.nombre,
              onChange: (evt) => setInviteAdminForm({ ...inviteAdminForm, nombre: evt.target.value }),
              placeholder: 'Nombre completo',
              style: { width: '100%', padding: '8px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', background: '#2d3748', color: '#fff' }
            })
          ),
          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
            e('button', {
              onClick: () => {
                setFormExpandedInviteAdmin(false);
                setInviteAdminForm({ email: '', nombre: '' });
              },
              style: { padding: '8px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
            }, 'Cancelar'),
            e('button', {
              onClick: handleInviteAdmin,
              style: { padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
            }, 'Enviar')
          )
        ),

        // DIVIDER
        e('div', { style: { borderTop: '1px solid #374151', margin: '16px 0' } }),

        // STATS
        e('div', { style: { fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' } }, 'ESTADÍSTICAS'),
        e('div', { style: { background: '#374151', padding: '12px', borderRadius: '6px', marginBottom: '24px' } },
          e('div', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '6px' } }, 'Proyectos: ', e('span', { style: { fontWeight: '600', color: '#fff' } }, adminCatalog.length)),
          e('div', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '6px' } }, 'Última actualización: ', e('span', { style: { fontWeight: '600', color: '#fff' } }, 'Hoy')),
          e('div', { style: { fontSize: '12px', color: '#9ca3af' } }, 'Admins: ', e('span', { style: { fontWeight: '600', color: '#fff' } }, '3'))
        ),

        // VOLVER BUTTON
        e('button', {
          onClick: () => setStep('apertura'),
          style: { width: '100%', padding: '12px', background: '#666', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: 'auto' }
        }, '← Volver')
      ),

      // MAIN CONTENT
      e('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
        // HEADER
        e('div', { style: { background: '#fff', padding: '20px', borderBottom: '1px solid #e5e7eb' } },
          e('h1', { style: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' } }, 'Catálogo de Proyectos')
        ),

        // CARDS GRID
        e('div', { style: { flex: 1, overflow: 'auto', padding: '24px' } },
          adminCatalog.length === 0 ?
            e('div', { style: { textAlign: 'center', color: '#6b7280', paddingTop: '60px' } },
              e('p', { style: { fontSize: '16px', fontWeight: '600', marginBottom: '8px' } }, 'No hay proyectos aún'),
              e('p', { style: { fontSize: '14px' } }, 'Crea el primero con el botón "Nuevo Proyecto" en el sidebar')
            )
          :
            e('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' } },
              adminCatalog.map(project => {
                const stateColor = project.project_state === 'Blanco' ? '#dbeafe' : 
                                   project.project_state === 'Verde' ? '#dcfce7' : '#fef3c7';
                const stateTextColor = project.project_state === 'Blanco' ? '#0369a1' : 
                                       project.project_state === 'Verde' ? '#15803d' : '#d97706';
                const imageUrl = project.image_urls && project.image_urls.length > 0 ? project.image_urls[0] : null;

                return e('div', { key: project.id, style: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' } },
                  // Image
                  imageUrl ?
                    e('img', { src: imageUrl, style: { width: '100%', height: '160px', objectFit: 'cover' } })
                  :
                    e('div', { style: { width: '100%', height: '160px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                      e('span', { style: { fontSize: '14px', fontWeight: '600', color: '#fff', opacity: 0.8 } }, project.project_name)
                    ),
                  
                  // Content
                  e('div', { style: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' } },
                    e('h3', { style: { margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#1f2937' } }, project.project_name),
                    e('p', { style: { margin: '0 0 12px', fontSize: '12px', color: '#6b7280' } }, `${project.comuna} • ${project.project_state}`),
                    
                    e('div', { style: { borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginBottom: '12px' } }),
                    
                    // Price & State
                    e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' } },
                      e('div', null,
                        e('p', { style: { margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: '#6b7280' } }, 'PRECIO'),
                        e('p', { style: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' } }, `${project.price_from_uf || '—'} UF`)
                      ),
                      e('div', null,
                        e('p', { style: { margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: '#6b7280' } }, 'ESTADO'),
                        e('div', { style: { background: stateColor, color: stateTextColor, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', display: 'inline-block' } }, project.project_state)
                      )
                    ),
                    
                    // Amenities
                    e('div', { style: { marginBottom: '12px' } },
                      e('p', { style: { margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: '#6b7280' } }, 'AMENITIES'),
                      e('p', { style: { margin: 0, fontSize: '11px', color: '#4b5563' } }, 
                        project.amenities ? 
                          project.amenities.split(',').slice(0, 3).map(a => `• ${a.trim()}`).join(' ') 
                        : 'Sin amenities'
                      )
                    ),

                    e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' } },
                      e('button', {
                        onClick: () => handleEditProject(project.id),
                        style: { padding: '8px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
                      }, 'Editar'),
                      e('button', {
                        onClick: () => handleAdminDeleteProject(project.id),
                        style: { padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
                      }, 'Eliminar')
                    )
                  )
                );
              })
            )
        )
      )
    );
  }
```

This replaces the entire old admin_projects screen.

- [ ] **Step 3: Verify rendering**

After making changes, the sidebar should be visible with expandable forms when you click the buttons.

- [ ] **Step 4: Commit**

```bash
git add src/frontend/app.js
git commit -m "feat: redesign admin catalog screen with sidebar and cards"
```

---

## Task 5: Create Edit Project Screen

**Files:**
- Modify: `src/frontend/app.js` (add new screen before admin_projects)

- [ ] **Step 1: Add edit project screen**

Find the admin_projects screen (line ~1989) and BEFORE it, add this new screen:

```javascript
  // ADMIN: EDIT PROJECT SCREEN
  if (step === 'admin_edit_project' && adminToken && adminRole === 'admin') {
    const projectId = window.editingProjectId;
    const editingProject = adminCatalog.find(p => p.id === projectId);

    // Auto-populate form when entering edit mode
    React.useEffect(() => {
      if (editingProject && adminNewProject.project_name === '') {
        setAdminNewProject({
          project_name: editingProject.project_name || '',
          project_state: editingProject.project_state || '',
          comuna: editingProject.comuna || '',
          address: editingProject.address || '',
          gmaps_link: editingProject.gmaps_link || '',
          price_from_uf: editingProject.price_from_uf || '',
          local_rent_uf: editingProject.local_rent_uf || '',
          appreciation_percent: editingProject.appreciation_percent || '',
          amenities: editingProject.amenities || '',
          typologies: editingProject.typologies || '',
          description: editingProject.description || '',
          image_urls: editingProject.image_urls || []
        });
      }
    }, [step]);

    return e('div', { style: { background: '#f3f4f6', minHeight: '100vh', padding: '24px' } },
      e('div', { style: { maxWidth: '800px', margin: '0 auto' } },
        e('div', { style: { marginBottom: '24px' } },
          e('button', {
            onClick: () => {
              setStep('admin_projects');
              setAdminNewProject({ project_name: '', project_state: '', comuna: '', address: '', gmaps_link: '', amenities: '', typologies: '', price_from_uf: '', local_rent_uf: '', appreciation_percent: '', description: '', image_urls: [] });
            },
            style: { padding: '8px 16px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
          }, '← Volver al Catálogo')
        ),

        e('div', { style: { background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } },
          e('h1', { style: { margin: '0 0 24px', fontSize: '24px', fontWeight: '700', color: '#1f2937' } }, `Editar: ${editingProject?.project_name || 'Proyecto'}`),

          // FORM FIELDS
          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' } },
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Nombre del Proyecto'),
              e('input', {
                type: 'text',
                placeholder: 'Nombre proyecto',
                value: adminNewProject.project_name,
                onChange: (evt) => setAdminNewProject({ ...adminNewProject, project_name: evt.target.value }),
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            ),
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Estado'),
              e('select', {
                value: adminNewProject.project_state,
                onChange: (evt) => setAdminNewProject({ ...adminNewProject, project_state: evt.target.value }),
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              },
                e('option', { value: '' }, 'Selecciona...'),
                e('option', null, 'Blanco'),
                e('option', null, 'Verde'),
                e('option', null, 'Entrega inmediata')
              )
            )
          ),

          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' } },
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Comuna'),
              e('input', {
                type: 'text',
                placeholder: 'Comuna',
                value: adminNewProject.comuna,
                onChange: (evt) => setAdminNewProject({ ...adminNewProject, comuna: evt.target.value }),
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            ),
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Dirección'),
              e('input', {
                type: 'text',
                placeholder: 'Dirección',
                value: adminNewProject.address,
                onChange: (evt) => setAdminNewProject({ ...adminNewProject, address: evt.target.value }),
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            )
          ),

          e('div', { style: { marginBottom: '16px' } },
            e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Google Maps link'),
            e('input', {
              type: 'text',
              placeholder: 'Google Maps link',
              value: adminNewProject.gmaps_link,
              onChange: (evt) => setAdminNewProject({ ...adminNewProject, gmaps_link: evt.target.value }),
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
            })
          ),

          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' } },
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Precio desde UF'),
              e('input', {
                type: 'number',
                placeholder: 'Precio desde UF',
                value: adminNewProject.price_from_uf,
                onChange: (evt) => setAdminNewProject({ ...adminNewProject, price_from_uf: evt.target.value }),
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            ),
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Arriendo zona UF'),
              e('input', {
                type: 'number',
                placeholder: 'Arriendo zona UF',
                value: adminNewProject.local_rent_uf,
                onChange: (evt) => setAdminNewProject({ ...adminNewProject, local_rent_uf: evt.target.value }),
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            ),
            e('div', null,
              e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Plusvalía %'),
              e('input', {
                type: 'number',
                placeholder: 'Plusvalía %',
                value: adminNewProject.appreciation_percent,
                onChange: (evt) => setAdminNewProject({ ...adminNewProject, appreciation_percent: evt.target.value }),
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }
              })
            )
          ),

          e('div', { style: { marginBottom: '16px' } },
            e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Amenities (separadas por coma)'),
            e('textarea', {
              placeholder: 'Piscina, Gym, Spa, ...',
              value: adminNewProject.amenities,
              onChange: (evt) => setAdminNewProject({ ...adminNewProject, amenities: evt.target.value }),
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }
            })
          ),

          e('div', { style: { marginBottom: '16px' } },
            e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Tipologías'),
            e('textarea', {
              placeholder: 'Estudio, 1 dormitorio, ...',
              value: adminNewProject.typologies,
              onChange: (evt) => setAdminNewProject({ ...adminNewProject, typologies: evt.target.value }),
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', minHeight: '60px', boxSizing: 'border-box' }
            })
          ),

          e('div', { style: { marginBottom: '16px' } },
            e('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' } }, 'Descripción'),
            e('textarea', {
              placeholder: 'Descripción del proyecto',
              value: adminNewProject.description,
              onChange: (evt) => setAdminNewProject({ ...adminNewProject, description: evt.target.value }),
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', minHeight: '80px', boxSizing: 'border-box' }
            })
          ),

          // ERROR MESSAGE
          error && e('div', { style: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' } }, '⚠️ ' + error),

          // BUTTONS
          e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            e('button', {
              onClick: () => {
                setStep('admin_projects');
                setAdminNewProject({ project_name: '', project_state: '', comuna: '', address: '', gmaps_link: '', amenities: '', typologies: '', price_from_uf: '', local_rent_uf: '', appreciation_percent: '', description: '', image_urls: [] });
              },
              style: { padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }
            }, 'Cancelar'),
            e('button', {
              onClick: handleUpdateProject,
              disabled: adminUploadingImages,
              style: { padding: '12px', background: adminUploadingImages ? '#d1d5db' : '#1f2937', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: adminUploadingImages ? 'not-allowed' : 'pointer' }
            }, adminUploadingImages ? '⏳ Guardando...' : '✅ Guardar Cambios')
          )
        )
      )
    );
  }
```

Insert this BEFORE the `if (step === 'admin_projects'...)` line.

- [ ] **Step 2: Commit**

```bash
git add src/frontend/app.js
git commit -m "feat: add edit project screen"
```

---

## Task 6: Update Save/Delete Handlers to Use JWT

**Files:**
- Modify: `src/frontend/app.js:1034-1150` (handleAdminSaveProject and handleAdminDeleteProject)

- [ ] **Step 1: Verify handlers use JWT**

Verify that `handleAdminSaveProject` (line ~1034) and `handleAdminDeleteProject` (line ~1128) are using `Authorization: Bearer ${adminToken}` headers. They should already be correct from previous fixes, but double-check.

Expected in handleAdminSaveProject:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${adminToken}`
}
```

Expected in handleAdminDeleteProject:
```javascript
headers: {
  'Authorization': `Bearer ${adminToken}`
}
```

- [ ] **Step 2: Verify and Commit**

If already correct, just run:
```bash
git status
```

Should show no changes. If there are changes, commit them:
```bash
git add src/frontend/app.js
git commit -m "verify: handlers use JWT authentication"
```

---

## Task 7: Manual Testing

**Files:** None (testing only)

- [ ] **Step 1: Start the app locally**

```bash
npm start
# App should start on http://localhost:3001
```

- [ ] **Step 2: Test login flow**

1. Navigate to setup screen
2. Click "Continuar con Google"
3. Authenticate with a valid email (@onekeybroker.com or @lupchile.com)
4. Verify you're logged in and taken to Station 1

- [ ] **Step 3: Test admin catalog access**

1. From Station 1, click "🔐 Catálogo de Proyectos" button (only visible for admins)
2. Verify sidebar appears on the left with "Nuevo Proyecto" and "Invitar Admin" buttons
3. Verify project cards display in the main area with:
   - Image (or placeholder)
   - Project name, location
   - Price and status
   - Amenities
   - Edit/Delete buttons
   - No errors in console

- [ ] **Step 4: Test create new project via sidebar**

1. Click "Nuevo Proyecto" button in sidebar
2. Form should expand with Name, State, Comuna fields
3. Fill in: Name="Test Project", State="Blanco", Comuna="Providencia"
4. Click "Guardar"
5. Verify: Form collapses, new card appears in grid, no error
6. Check browser console: should show POST request to `/api/admin/catalog` with 201 response

- [ ] **Step 5: Test edit project**

1. Click "Editar" button on any card
2. Verify: Page navigates to edit screen, form pre-populated with project data
3. Change one field (e.g., price)
4. Click "Guardar Cambios"
5. Verify: Message shows "✅ Proyecto actualizado", page returns to catalog
6. Verify card shows updated data
7. Check console: PUT request to `/api/admin/catalog/:id` with 200 response

- [ ] **Step 6: Test delete project**

1. Click "Eliminar" button on a card
2. Confirm dialog should appear: "¿Eliminar este proyecto del catálogo?"
3. Click OK
4. Verify: Card disappears, alert shows "✅ Proyecto eliminado"
5. Check console: DELETE request to `/api/admin/catalog/:id` with 204 response

- [ ] **Step 7: Test invite admin**

1. Click "Invitar Admin" button in sidebar
2. Form should expand with Email and Nombre fields
3. Fill in: Email="newadmin@onekeybroker.com", Nombre="New Admin"
4. Click "Enviar"
5. Verify: Success message "✅ Invitación enviada a newadmin@onekeybroker.com"
6. Check console: POST request to `/auth/invite` with 200 response

- [ ] **Step 8: Test error handling**

1. Try to invite with invalid email: "notanemail"
   - Should show: "Email inválido"
2. Try to invite with wrong domain: "admin@gmail.com"
   - Should show: "El email debe ser de @onekeybroker.com, @lupchile.com o @lupar.cl"
3. Try to save project without required fields
   - Should show: "Campos obligatorios: nombre, comuna, dirección"

- [ ] **Step 9: Test responsive design**

1. Resize browser to tablet (768px width)
2. Sidebar should still be visible
3. Grid should show 2 columns
4. Resize to mobile (375px width)
5. Grid should show 1 column
6. Forms should be fully accessible

- [ ] **Step 10: Verify no console errors**

1. Open DevTools (F12)
2. Go to Console tab
3. Navigate through all screens and actions
4. Verify no red errors appear (warnings are OK)

---

## Spec Coverage Checklist

- [ ] Sidebar navigation with dark theme (#1f2937) ✓
- [ ] Expandable "Nuevo Proyecto" form ✓
- [ ] Expandable "Invitar Admin" form ✓
- [ ] Project cards with images ✓
- [ ] Project cards with complete information ✓
- [ ] Edit button navigates to edit page ✓
- [ ] Delete button with confirmation ✓
- [ ] Edit project page with pre-populated form ✓
- [ ] Invite admin with email validation ✓
- [ ] JWT authentication on all API calls ✓
- [ ] Color system (status badges, buttons) ✓
- [ ] Error handling and messages ✓
- [ ] Responsive grid layout ✓
- [ ] Empty state message ✓

---

## Summary

This plan implements the complete admin catalog redesign with:
1. **Sidebar** (280px, dark, fixed)
2. **Expandable forms** for Nuevo Proyecto and Invitar Admin
3. **Project cards** with images, complete info, and actions
4. **Edit page** for modifying projects
5. **Admin invitation** system with validation
6. **Professional styling** matching the login screen
7. **Full JWT authentication** on all operations

Total changes: ~500 lines in app.js (mostly new UI, some refactored)
