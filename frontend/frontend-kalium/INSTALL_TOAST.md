# 🎨 Instalación de Toast Notifications

## 1. Instalar react-hot-toast

```bash
cd frontend/frontend-kalium
npm install react-hot-toast
```

## 2. Agregar Toaster en App.jsx

**Archivo**: `src/App.jsx`

Agregar el import al inicio:
```javascript
import { Toaster } from 'react-hot-toast';
```

Agregar el componente Toaster dentro del `BrowserRouter`:
```javascript
<BrowserRouter>
  <Toaster /> {/* ← AGREGAR ESTA LÍNEA */}
  <Routes>
    <Route path="/" element={<Login />} />
    {/* ... resto de rutas */}
  </Routes>
</BrowserRouter>
```

## 3. Usar en tus componentes

### Ejemplo en NuevoInsumo.jsx:

**Antes**:
```javascript
setShowSuccess(true);
setErrorMessage(error.response?.data || error.message);
setShowError(true);
```

**Después**:
```javascript
import { useToast } from '../../hooks/useToast';

const NuevoInsumo = () => {
  const toast = useToast();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await insumoService.createInsumo(data);
      toast.success('¡Insumo creado exitosamente!');
      navigate('/insumos');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear insumo');
    }
  };
};
```

## 4. Métodos Disponibles

```javascript
const toast = useToast();

// Éxito
toast.success('¡Operación exitosa!');

// Error
toast.error('Ha ocurrido un error');

// Advertencia
toast.warning('Ten cuidado con esto');

// Información
toast.info('Información importante');

// Loading
const loadingToast = toast.loading('Procesando...');
// Cuando termine:
toast.dismiss(loadingToast);

// Promise (automático)
toast.promise(
  apiCall(),
  {
    loading: 'Guardando...',
    success: '¡Guardado!',
    error: 'Error al guardar'
  }
);
```

## 5. Ejemplos por Componente

### ListaInsumos.jsx:
```javascript
const handleDelete = async (id) => {
  if (!confirm('¿Estás seguro?')) return;
  
  try {
    await insumoService.deleteInsumo(id);
    toast.success('Insumo eliminado correctamente');
    cargarDatos();
  } catch (error) {
    toast.error('Error al eliminar insumo');
  }
};
```

### ListaPedidos.jsx:
```javascript
const handleAprobar = async (idPedido) => {
  const loadingToast = toast.loading('Aprobando pedido...');
  
  try {
    await pedidoService.cambiarEstado(idPedido, 2); // Aprobado
    toast.dismiss(loadingToast);
    toast.success('¡Pedido aprobado exitosamente!');
    cargarDatos();
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error('Error al aprobar pedido');
  }
};
```

### ListaIncidentes.jsx:
```javascript
const handleResolver = async (id) => {
  try {
    await incidenteService.resolverIncidente(id);
    toast.success('Incidente resuelto');
    cargarDatos();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error al resolver incidente');
  }
};
```

## 6. Configuración Global (Opcional)

Para personalizar el tema, puedes configurar en `App.jsx`:

```javascript
<Toaster
  position="top-right"
  reverseOrder={false}
  gutter={8}
  toastOptions={{
    // Opciones por defecto para todos los toasts
    duration: 3000,
    style: {
      background: '#363636',
      color: '#fff',
    },
    // Opciones específicas por tipo
    success: {
      duration: 3000,
      theme: {
        primary: '#2cab5b',
        secondary: 'black',
      },
    },
    error: {
      duration: 4000,
      theme: {
        primary: '#ef4444',
        secondary: 'white',
      },
    },
  }}
/>
```

## 7. Ventajas sobre tus alerts actuales

| Antes | Después |
|-------|---------|
| Estados separados (`showSuccess`, `showError`) | Un solo hook `useToast()` |
| Componentes `Alert` personalizados | Toast library profesional |
| Sin animaciones | Animaciones suaves |
| Posición fija | Configurable |
| Difícil de mantener | Fácil y consistente |

---

**¡Listo! Ahora tienes notificaciones profesionales en toda tu app.** 🎉
