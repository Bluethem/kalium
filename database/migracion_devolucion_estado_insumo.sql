-- ============================================
-- MIGRACIÓN: Agregar Estado de Insumo a DevolucionDetalle
-- ============================================
-- Esta migración agrega un campo para indicar si un insumo 
-- fue devuelto en buen estado o con daños.

USE kaliumdb;

-- Agregar columna EstadoInsumoDevuelto
ALTER TABLE DevolucionDetalle 
ADD COLUMN EstadoInsumoDevuelto VARCHAR(50) NULL COMMENT 'OK, Dañado, Perdido';

-- Agregar columna Observaciones (opcional)
ALTER TABLE DevolucionDetalle 
ADD COLUMN Observaciones VARCHAR(255) NULL COMMENT 'Observaciones sobre el estado del insumo';

-- Actualizar registros existentes a 'OK' por defecto
UPDATE DevolucionDetalle 
SET EstadoInsumoDevuelto = 'OK' 
WHERE EstadoInsumoDevuelto IS NULL;

-- Hacer el campo NOT NULL después de actualizar
ALTER TABLE DevolucionDetalle 
MODIFY COLUMN EstadoInsumoDevuelto VARCHAR(50) NOT NULL DEFAULT 'OK';

-- Verificar cambios
DESCRIBE DevolucionDetalle;

-- ============================================
-- ROLLBACK (si es necesario)
-- ============================================
-- ALTER TABLE DevolucionDetalle DROP COLUMN EstadoInsumoDevuelto;
-- ALTER TABLE DevolucionDetalle DROP COLUMN Observaciones;
