-- ============================================
-- MIGRACIÓN: Cambiar "Agotado" a "No Disponible"
-- ============================================
-- Propósito: Aclarar que este estado es para insumos rotos/perdidos
-- que NO deben contar en el stock ni inventario disponible

USE kaliumdb;

-- 1. Cambiar nombre del estado 3
UPDATE EstInsumo 
SET NombreEstInsumo = 'No Disponible' 
WHERE IDEstInsumo = 3;

-- 2. Verificar cambio
SELECT * FROM EstInsumo ORDER BY IDEstInsumo;

-- Resultado esperado:
-- +-------------+------------------+
-- | IDEstInsumo | NombreEstInsumo  |
-- +-------------+------------------+
-- |           1 | Disponible       |
-- |           2 | En Uso           |
-- |           3 | No Disponible    |  ← CAMBIADO
-- |           4 | Reservado        |
-- +-------------+------------------+

-- ============================================
-- OPCIONAL: Actualizar descripciones de incidencias existentes
-- ============================================
-- Solo si tienes incidencias con "Agotado" en la descripción
-- UPDATE Incidentes 
-- SET Descripcion = REPLACE(Descripcion, 'Agotado', 'No Disponible')
-- WHERE Descripcion LIKE '%Agotado%';

-- ============================================
-- ROLLBACK (si es necesario)
-- ============================================
-- UPDATE EstInsumo SET NombreEstInsumo = 'Agotado' WHERE IDEstInsumo = 3;
