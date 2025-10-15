-- ============================================
-- MIGRACIÓN: Sistema de Reservas Híbrida
-- Fecha: 2025-01-14
-- Descripción: Agrega sistema de reservas para pedidos
-- ============================================

USE kaliumdb;

-- ============================================
-- 1. Crear tabla EstPedidoDetalle
-- ============================================
CREATE TABLE IF NOT EXISTS EstPedidoDetalle (
  IDEstPedidoDetalle INT NOT NULL AUTO_INCREMENT,
  NombreEstDetalle VARCHAR(50) NOT NULL,
  PRIMARY KEY (IDEstPedidoDetalle)
);

-- Insertar estados
INSERT INTO EstPedidoDetalle (NombreEstDetalle) VALUES
('Pendiente'),      -- Pedido creado pero no aprobado
('Reservado'),      -- Pedido aprobado, insumos reservados
('Entregado'),      -- Ya se entregó
('Cancelado');      -- Se canceló, devolver al inventario

-- ============================================
-- 2. Agregar columna IDEstPedidoDetalle a PedidoDetalle
-- ============================================
ALTER TABLE PedidoDetalle 
ADD COLUMN IF NOT EXISTS IDEstPedidoDetalle INT NOT NULL DEFAULT 1;

-- Agregar foreign key
ALTER TABLE PedidoDetalle
ADD CONSTRAINT fk_pedido_detalle_estado 
FOREIGN KEY (IDEstPedidoDetalle) REFERENCES EstPedidoDetalle(IDEstPedidoDetalle);

-- ============================================
-- 3. Agregar estado "Reservado" a EstInsumo
-- ============================================
INSERT INTO EstInsumo (NombreEstInsumo) 
SELECT 'Reservado' 
WHERE NOT EXISTS (
    SELECT 1 FROM EstInsumo WHERE NombreEstInsumo = 'Reservado'
);

-- ============================================
-- 4. Actualizar detalles de pedidos existentes
-- ============================================
-- Marcar como "Reservado" los detalles de pedidos aprobados
UPDATE PedidoDetalle pd
INNER JOIN Pedido p ON pd.IDPedido = p.IDPedido
SET pd.IDEstPedidoDetalle = 2 -- 2 = Reservado
WHERE p.IDEstPedido = 2; -- 2 = Aprobado

-- Marcar como "Entregado" los detalles de pedidos entregados
UPDATE PedidoDetalle pd
INNER JOIN Pedido p ON pd.IDPedido = p.IDPedido
SET pd.IDEstPedidoDetalle = 3 -- 3 = Entregado
WHERE p.IDEstPedido = 4; -- 4 = Entregado

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT '✅ Migración completada exitosamente!' AS Resultado;

-- Verificar que la tabla se creó
SELECT 
    'EstPedidoDetalle' AS Tabla,
    COUNT(*) AS Registros
FROM EstPedidoDetalle;

-- Verificar que la columna se agregó
DESCRIBE PedidoDetalle;

-- Verificar estado "Reservado" en EstInsumo
SELECT * FROM EstInsumo WHERE NombreEstInsumo = 'Reservado';

-- Verificar distribución de estados en detalles
SELECT 
    e.NombreEstDetalle,
    COUNT(*) AS Cantidad
FROM PedidoDetalle pd
LEFT JOIN EstPedidoDetalle e ON pd.IDEstPedidoDetalle = e.IDEstPedidoDetalle
GROUP BY e.NombreEstDetalle;
