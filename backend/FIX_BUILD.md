# 🔧 Solución al Error de Build

## ❌ Error Original:
```
Fatal error compiling: java.lang.ExceptionInInitializerError: 
com.sun.tools.javac.code.TypeTag :: UNKNOWN
```

## ✅ Solución Aplicada:

### 1. Actualización de versiones en `pom.xml`:
- **Maven Compiler Plugin**: 3.13.0 → 3.11.0
- **Lombok**: 1.18.30 → 1.18.34
- **Removido**: parámetro `release` que causaba conflicto

### 2. Pasos para compilar:

#### Opción A - Desde NetBeans:
1. **Limpiar proyecto**:
   - Clic derecho en el proyecto → `Clean`
   
2. **Construir proyecto**:
   - Clic derecho en el proyecto → `Clean and Build`

#### Opción B - Desde Terminal:
```bash
cd backend

# 1. Limpiar todo (importante)
mvn clean

# 2. Instalar dependencias y compilar
mvn clean install -U

# 3. Si todo compila bien, ejecutar
mvn spring-boot:run
```

### 3. Si aún da error:

#### A. Limpiar cache de NetBeans:
```bash
# Cerrar NetBeans
# Ir a: C:\Users\TU_USUARIO\AppData\Local\NetBeans\Cache
# Eliminar la carpeta de tu versión (ej: 17, 18, etc.)
# Abrir NetBeans de nuevo
```

#### B. Verificar versión de Java:
```bash
java -version
# Debe ser Java 17

javac -version
# Debe ser Java 17
```

#### C. Si tienes múltiples versiones de Java:
En NetBeans:
1. Tools → Java Platforms
2. Verifica que esté usando JDK 17
3. Tools → Options → Java → Maven
4. Verifica que "Java Home" apunte a JDK 17

### 4. Reiniciar NetBeans:
A veces NetBeans necesita reiniciarse después de cambios en `pom.xml`.

---

## 🎯 Verificación:

Si compila exitosamente verás:
```
BUILD SUCCESS
Total time: X s
```

Luego podrás ejecutar:
```bash
mvn spring-boot:run
```

Y el backend arrancará en: `http://localhost:8080`

---

## 🔍 Por qué ocurrió:

El error `TypeTag :: UNKNOWN` ocurre por incompatibilidad entre:
- Maven Compiler Plugin 3.13.0 (muy reciente)
- Lombok 1.18.30 (desactualizado)
- Configuración con `release=17`

La solución usa versiones más estables y compatibles.

---

## ✅ Siguiente paso:

Una vez que compile exitosamente:

```bash
cd backend
mvn spring-boot:run
```

Luego en otra terminal:
```bash
cd frontend/frontend-kalium
npm run dev
```

¡Y listo! 🚀
