-- ============================================
-- MIGRACIÓN: IDEstudiante nullable en Entrega
-- Fecha: 2025-01-14
-- Descripción: Permite crear entregas sin estudiante asignado
-- ============================================

USE kaliumdb;

-- Modificar columna IDEstudiante para que sea nullable
ALTER TABLE Entrega 
MODIFY COLUMN IDEstudiante INT NULL 
COMMENT 'Nullable: Se asigna después de generar la entrega';

-- Verificación
DESCRIBE Entrega;

SELECT '✅ Migración completada: IDEstudiante ahora es nullable' AS Resultado;
