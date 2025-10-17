-- ============================================
-- KALIUM - CATÁLOGOS + ESTADOS + HORARIOS + PARÁMETROS
-- (SIN MODIFICAR LA TABLA Pedido)
-- ============================================

USE kaliumdb;

-- --------------------------------------------
-- Unicidad de cada bloque de Horario (no toca Pedido)
-- --------------------------------------------
ALTER TABLE Horario
  ADD UNIQUE KEY uq_horario_dia_hora (FechaEntrega, HoraInicio);

-- ============================================
-- 1. ROLES
-- ============================================
INSERT INTO Rol (NombreRol, Descripcion) VALUES
('ADMIN_SISTEMA', 'Administrador de sistemas - Gestiona usuarios y permisos'),
('ADMIN_LABORATORIO', 'Administrador de laboratorio - Gestiona inventario, pedidos y entregas'),
('INSTRUCTOR', 'Instructor - Crea pedidos y consulta información'),
('ESTUDIANTE', 'Estudiante - Consulta entregas (futuro)');

-- ============================================
-- 2. USUARIOS
-- ============================================
INSERT INTO Usuario (Nombre, Apellido, Correo, Contrasena, IDRol) VALUES
('Juan', 'Pérez', 'juan.perez@lab.com', 'password123', 1),
('María', 'García', 'maria.garcia@lab.com', 'password123', 2),
('Carlos', 'López', 'carlos.lopez@lab.com', 'password123', 3),
('Ana', 'Martínez', 'ana.martinez@lab.com', 'password123', 3);

-- ============================================
-- 3. ADMINISTRADORES
-- ============================================
INSERT INTO Administrador (IDUsuario) VALUES (1);

-- ============================================
-- 4. INSTRUCTORES
-- ============================================
INSERT INTO Instructor (IDUsuario) VALUES (2), (3);

-- ============================================
-- 5. CATEGORÍAS
-- ============================================
INSERT INTO Categoria (NombreCategoria) VALUES
('Reactivos'),
('Material de precisión'),
('Equipos e instrumental'),
('PPE/seguridad'),
('Consumibles generales'),
('Soluciones'),
('Gases');

-- ============================================
-- 6. UNIDADES
-- ============================================
INSERT INTO Unidad (Unidad) VALUES
('ml'),
('g'),
('unid'),
('kg'),
('L'),
('mmol'),
('mol');

-- ============================================
-- 7. TIPOS DE INSUMO
-- ============================================
INSERT INTO TipoInsumo (NombreTipoInsumo, Descripcion, IDCategoria, IDUnidad, EsQuimico, stockMinimo) VALUES
('Ácido Sulfúrico', 'Ácido fuerte utilizado en múltiples reacciones químicas', 1, 1, 1, 100),
('Hidróxido de Sodio', 'Base fuerte para neutralización y síntesis', 1, 2, 1, 100),
('Matraz Erlenmeyer', 'Matraz cónico de vidrio para mezclas', 2, 3, 0, 3),
('Probeta Graduada', 'Instrumento para medir volúmenes de líquidos', 2, 3, 0, 5),
('Balanza Analítica', 'Equipo de precisión para medir masas', 3, 3, 0, 2),
('Guantes de Nitrilo', 'Protección para manos en laboratorio', 4, 3, 0, 50),
('Etanol', 'Alcohol etílico para limpieza y reacciones', 1, 1, 1, 500),
('Cloruro de Sodio', 'Sal común para preparación de soluciones', 1, 2, 1, 200);

-- ============================================
-- 8. ESTADOS DE INSUMO (sin "Reservado")
-- ============================================
INSERT INTO EstInsumo (NombreEstInsumo) VALUES
('Disponible'),
('En Uso'),
('En Mantenimiento'),
('No Disponible');

-- ============================================
-- 9. ESTADOS DE PEDIDO (exactos)
-- 1=pendiente, 2=aprobado, 3=no aprobado,
-- 4=Cancelado(por Vencimiento), 5=Cancelado(por el instructor),
-- 6=Entregado, 7=Preparado
-- ============================================
INSERT INTO EstPedido (NombreEstPedido) VALUES
('pendiente'),
('aprobado'),
('no aprobado'),
('Cancelado(por Vencimiento)'),
('Cancelado(por el instructor)'),
('Entregado'),
('Preparado');

-- ============================================
-- 10. ESTADOS DE PEDIDO DETALLE (sin “Reservado”)
-- 1=Pendiente, 2=Listo, 3=Faltante, 4=Cancelado, 5=Entregado
-- ============================================
INSERT INTO EstPedidoDetalle (NombreEstDetalle) VALUES
('Pendiente'),
('Listo'),
('Faltante'),
('Cancelado'),
('Entregado');

-- ============================================
-- 11. INSUMOS FÍSICOS (ejemplo)
-- ============================================
INSERT INTO Insumo (IDEstInsumo, IDTipoInsumo, FechaIngreso) VALUES
(1, 3, '2024-01-10'),
(1, 4, '2024-01-10'),
(1, 4, '2024-01-15'),
(1, 4, '2024-01-20'),
(1, 4, '2024-02-01'),
(1, 4, '2024-02-05'),
(1, 5, '2024-01-10'),
(1, 5, '2024-01-15'),
(1, 6, '2024-03-01'),
(1, 6, '2024-03-01'),
(1, 6, '2024-03-01'),
(1, 6, '2024-03-01'),
(1, 6, '2024-03-01');

-- ============================================
-- 12. QUÍMICOS
-- ============================================
INSERT INTO Quimico (CantQuimico, IDTipoInsumo, FechaIngreso) VALUES
(500.5, 1, '2024-01-10'),
(250.0, 2, '2024-01-10'),
(1000.0, 7, '2024-01-15'),
(500.0, 8, '2024-01-15');

-- ============================================
-- 13. ESTUDIANTES
-- ============================================
INSERT INTO Estudiante (Nombre, Apellido) VALUES
('Pedro', 'Ramírez'),
('Laura', 'Torres'),
('Miguel', 'Fernández'),
('Sofía', 'Morales');

-- ============================================
-- 14. CURSOS
-- ============================================
INSERT INTO Curso (NombreCurso) VALUES
('Química General I'),
('Química Orgánica'),
('Química Analítica'),
('Bioquímica');

-- ============================================
-- 15. TIPOS DE PEDIDO
-- ============================================
INSERT INTO TipoPedido (NombrePedido) VALUES
('Práctica de Laboratorio'),
('Experimento de Investigación'),
('Demostración');

-- ============================================
-- 16. HORARIOS (20 bloques L–V 08/10/12/14 h)
-- ============================================
INSERT INTO Horario (FechaEntrega, HoraInicio) VALUES
('2025-01-13', '2025-01-13 08:00:00'),
('2025-01-13', '2025-01-13 10:00:00'),
('2025-01-13', '2025-01-13 12:00:00'),
('2025-01-13', '2025-01-13 14:00:00'),
('2025-01-14', '2025-01-14 08:00:00'),
('2025-01-14', '2025-01-14 10:00:00'),
('2025-01-14', '2025-01-14 12:00:00'),
('2025-01-14', '2025-01-14 14:00:00'),
('2025-01-15', '2025-01-15 08:00:00'),
('2025-01-15', '2025-01-15 10:00:00'),
('2025-01-15', '2025-01-15 12:00:00'),
('2025-01-15', '2025-01-15 14:00:00'),
('2025-01-16', '2025-01-16 08:00:00'),
('2025-01-16', '2025-01-16 10:00:00'),
('2025-01-16', '2025-01-16 12:00:00'),
('2025-01-16', '2025-01-16 14:00:00'),
('2025-01-17', '2025-01-17 08:00:00'),
('2025-01-17', '2025-01-17 10:00:00'),
('2025-01-17', '2025-01-17 12:00:00'),
('2025-01-17', '2025-01-17 14:00:00');

-- ============================================
-- 17. PARÁMETROS DE INVENTARIO (tablas nuevas, no tocan Pedido)
-- ============================================
CREATE TABLE IF NOT EXISTS ParametroInventarioCategoria (
  IDParametroCategoria INT NOT NULL AUTO_INCREMENT,
  IDCategoria INT NOT NULL,
  z DECIMAL(4,2) NOT NULL DEFAULT 1.65,
  ventana_horas INT NOT NULL DEFAULT 6,
  merma_alpha DECIMAL(4,3) NOT NULL DEFAULT 0.03,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (IDParametroCategoria),
  UNIQUE KEY uq_param_cat (IDCategoria),
  CONSTRAINT fk_param_cat_categoria FOREIGN KEY (IDCategoria) REFERENCES Categoria(IDCategoria),
  CONSTRAINT chk_param_cat_z CHECK (z BETWEEN 0.50 AND 3.50),
  CONSTRAINT chk_param_cat_vent CHECK (ventana_horas BETWEEN 1 AND 48),
  CONSTRAINT chk_param_cat_alpha CHECK (merma_alpha BETWEEN 0 AND 0.50)
);

CREATE TABLE IF NOT EXISTS ParametroInventarioTipo (
  IDParametroTipo INT NOT NULL AUTO_INCREMENT,
  IDTipoInsumo INT NOT NULL,
  z DECIMAL(4,2) NOT NULL DEFAULT 1.65,
  ventana_horas INT NOT NULL DEFAULT 6,
  merma_alpha DECIMAL(4,3) NOT NULL DEFAULT 0.03,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (IDParametroTipo),
  UNIQUE KEY uq_param_tipo (IDTipoInsumo),
  CONSTRAINT fk_param_tipo_tipo FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo),
  CONSTRAINT chk_param_tipo_z CHECK (z BETWEEN 0.50 AND 3.50),
  CONSTRAINT chk_param_tipo_vent CHECK (ventana_horas BETWEEN 1 AND 48),
  CONSTRAINT chk_param_tipo_alpha CHECK (merma_alpha BETWEEN 0 AND 0.50)
);

CREATE OR REPLACE VIEW v_parametro_inventario_resuelto AS
SELECT
  ti.IDTipoInsumo,
  ti.NombreTipoInsumo,
  c.IDCategoria,
  c.NombreCategoria,
  COALESCE(pt.z, pic.z)                         AS z,
  COALESCE(pt.ventana_horas, pic.ventana_horas) AS ventana_horas,
  COALESCE(pt.merma_alpha, pic.merma_alpha)      AS merma_alpha
FROM TipoInsumo ti
JOIN Categoria c ON c.IDCategoria = ti.IDCategoria
LEFT JOIN ParametroInventarioCategoria pic ON pic.IDCategoria = c.IDCategoria
LEFT JOIN ParametroInventarioTipo pt ON pt.IDTipoInsumo = ti.IDTipoInsumo;

INSERT INTO ParametroInventarioCategoria (IDCategoria, z, ventana_horas, merma_alpha)
VALUES
  (1, 1.90, 6, 0.040),
  (2, 1.65, 6, 0.030),
  (3, 1.65, 6, 0.030),
  (4, 1.65, 6, 0.025),
  (5, 1.65, 6, 0.030),
  (6, 1.90, 6, 0.040),
  (7, 1.90, 6, 0.040)
ON DUPLICATE KEY UPDATE
  z=VALUES(z), ventana_horas=VALUES(ventana_horas), merma_alpha=VALUES(merma_alpha);

INSERT INTO ParametroInventarioTipo (IDTipoInsumo, z, ventana_horas, merma_alpha)
SELECT IDTipoInsumo, 2.05, 6, 0.050 FROM TipoInsumo WHERE NombreTipoInsumo='Etanol'
ON DUPLICATE KEY UPDATE z=VALUES(z), ventana_horas=VALUES(ventana_horas), merma_alpha=VALUES(merma_alpha);

-- ============================================
-- 18. MOTIVOS (tablas nuevas, SIN FK a Pedido)
-- ============================================
CREATE TABLE IF NOT EXISTS MotivoNoAprobado (
  IDMotivoNoAprobado INT NOT NULL AUTO_INCREMENT,
  Descripcion VARCHAR(120) NOT NULL UNIQUE,
  PRIMARY KEY (IDMotivoNoAprobado)
);

CREATE TABLE IF NOT EXISTS MotivoCancelacion (
  IDMotivoCancelacion INT NOT NULL AUTO_INCREMENT,
  Descripcion VARCHAR(120) NOT NULL UNIQUE,
  PRIMARY KEY (IDMotivoCancelacion)
);

INSERT INTO MotivoNoAprobado (Descripcion) VALUES
('No cumple seguridad'),
('No hay stock suficiente'),
('Solicitud duplicada'),
('Fuera de política')
ON DUPLICATE KEY UPDATE Descripcion=VALUES(Descripcion);

INSERT INTO MotivoCancelacion (Descripcion) VALUES
('Cancelado por el instructor'),
('Cancelado por vencimiento'),
('Dependencia logística'),
('Reprogramado a otro horario')
ON DUPLICATE KEY UPDATE Descripcion=VALUES(Descripcion);

-- ============================================
-- 19. PEDIDOS (coherentes con Horario 1..3)  **SIN tocar schema**
-- ============================================
INSERT INTO Pedido (FechaPedido, CantGrupos, IDInstructor, IDEstPedido, IDCurso, IDTipoPedido, IDHorario)
VALUES
('2025-01-05', 5, 1, 1, 1, 1, 1), -- pendiente
('2025-01-06', 3, 2, 2, 2, 1, 2), -- aprobado
('2025-01-07', 4, 1, 7, 1, 1, 3); -- Preparado

-- ============================================
-- 20. DETALLES DE PEDIDO (sin “Reservado”)
-- ============================================
INSERT INTO PedidoDetalle (CantInsumo, IDPedido, IDTipoInsumo, IDEstPedidoDetalle) VALUES
(10, 1, 1, 1),
(5,  1, 3, 1),
(8,  2, 2, 1),
(3,  2, 5, 1),
(15, 3, 7, 2),
(2,  3, 4, 2);

-- ============================================
-- 21. Triggers SOLO para exclusividad de Horario (no tocan schema ni motivos)
-- ============================================
DELIMITER $$

DROP TRIGGER IF EXISTS trg_pedido_estado_bi $$
CREATE TRIGGER trg_pedido_estado_bi
BEFORE INSERT ON Pedido
FOR EACH ROW
BEGIN
  DECLARE id_no_aprobado INT;
  DECLARE id_cancel_venc INT;
  DECLARE id_cancel_instr INT;
  DECLARE ocupados INT DEFAULT 0;

  SELECT IDEstPedido INTO id_no_aprobado
    FROM EstPedido WHERE NombreEstPedido = 'no aprobado' LIMIT 1;
  SELECT IDEstPedido INTO id_cancel_venc
    FROM EstPedido WHERE NombreEstPedido = 'Cancelado(por Vencimiento)' LIMIT 1;
  SELECT IDEstPedido INTO id_cancel_instr
    FROM EstPedido WHERE NombreEstPedido = 'Cancelado(por el instructor)' LIMIT 1;

  -- En estados activos (no cancelados / no aprobado), el bloque debe estar libre
  IF NEW.IDHorario IS NOT NULL
     AND NEW.IDEstPedido NOT IN (id_no_aprobado, id_cancel_venc, id_cancel_instr) THEN
    SELECT COUNT(*) INTO ocupados
    FROM Pedido p
    WHERE p.IDHorario = NEW.IDHorario
      AND p.IDEstPedido NOT IN (id_no_aprobado, id_cancel_venc, id_cancel_instr);
    IF ocupados > 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El bloque de Horario ya está ocupado por otro pedido activo.';
    END IF;
  END IF;
END $$

DROP TRIGGER IF EXISTS trg_pedido_estado_bu $$
CREATE TRIGGER trg_pedido_estado_bu
BEFORE UPDATE ON Pedido
FOR EACH ROW
BEGIN
  DECLARE id_no_aprobado INT;
  DECLARE id_cancel_venc INT;
  DECLARE id_cancel_instr INT;
  DECLARE ocupados INT DEFAULT 0;

  SELECT IDEstPedido INTO id_no_aprobado
    FROM EstPedido WHERE NombreEstPedido = 'no aprobado' LIMIT 1;
  SELECT IDEstPedido INTO id_cancel_venc
    FROM EstPedido WHERE NombreEstPedido = 'Cancelado(por Vencimiento)' LIMIT 1;
  SELECT IDEstPedido INTO id_cancel_instr
    FROM EstPedido WHERE NombreEstPedido = 'Cancelado(por el instructor)' LIMIT 1;

  -- Validación de exclusividad (no se modifica ningún campo)
  IF NEW.IDHorario IS NOT NULL
     AND NEW.IDEstPedido NOT IN (id_no_aprobado, id_cancel_venc, id_cancel_instr) THEN
    SELECT COUNT(*) INTO ocupados
    FROM Pedido p
    WHERE p.IDHorario = NEW.IDHorario
      AND p.IDPedido <> OLD.IDPedido
      AND p.IDEstPedido NOT IN (id_no_aprobado, id_cancel_venc, id_cancel_instr);
    IF ocupados > 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El bloque de Horario ya está ocupado por otro pedido activo.';
    END IF;
  END IF;
END $$

DELIMITER ;

-- Vista de horarios libres (no cuenta cancelados / no aprobado como ocupación)
CREATE OR REPLACE VIEW v_horarios_libres AS
SELECT h.*
FROM Horario h
WHERE NOT EXISTS (
  SELECT 1
  FROM Pedido p
  JOIN EstPedido e ON e.IDEstPedido = p.IDEstPedido
  WHERE p.IDHorario = h.IDHorario
    AND e.NombreEstPedido NOT IN ('no aprobado', 'Cancelado(por Vencimiento)', 'Cancelado(por el instructor)')
);

-- ============================================
-- 22. NOTIFICACIONES (ejemplo)
-- ============================================
INSERT INTO Notificacion (Titulo, Mensaje, Tipo, Leida, FechaCreacion, IDUsuario, DatosExtra) VALUES
('Stock bajo: Matraz Erlenmeyer', 
 'El insumo Matraz Erlenmeyer está por debajo del stock mínimo (1 disponible, mínimo: 3).', 
 'BAJO_STOCK', 0, '2025-01-10 10:00:00', 2, 
 JSON_OBJECT('idTipoInsumo', 3, 'stockRestante', 1, 'stockMinimo', 3)),
('Stock bajo: Guantes de Nitrilo', 
 'El insumo Guantes de Nitrilo está por debajo del stock mínimo (5 disponibles, mínimo: 50).', 
 'BAJO_STOCK', 0, '2025-01-10 10:05:00', 2, 
 JSON_OBJECT('idTipoInsumo', 6, 'stockRestante', 5, 'stockMinimo', 50)),
('Nuevo pedido pendiente', 
 'El pedido de Química General I del instructor María García requiere aprobación.', 
 'PEDIDO_PENDIENTE', 0, '2025-01-05 14:30:00', 2, 
 JSON_OBJECT('idPedido', 1, 'idInstructor', 1, 'nombreInstructor', 'María García')),
('Incidente reportado', 
 'El estudiante Pedro Ramírez reportó: Matraz roto durante la práctica.', 
 'INCIDENTE', 0, '2025-01-16 18:30:00', 2, 
 JSON_OBJECT('idIncidente', 1, 'idEstudiante', 1, 'nombreEstudiante', 'Pedro Ramírez'));

-- ============================================
-- 23. VERIFICACIÓN
-- ============================================
SELECT '✅ Datos de prueba insertados correctamente!' AS Resultado;

SELECT 
    'Roles' AS Tabla, COUNT(*) AS Total FROM Rol
UNION ALL SELECT 'Usuarios', COUNT(*) FROM Usuario
UNION ALL SELECT 'Categorías', COUNT(*) FROM Categoria
UNION ALL SELECT 'Unidades', COUNT(*) FROM Unidad
UNION ALL SELECT 'Tipos de Insumo', COUNT(*) FROM TipoInsumo
UNION ALL SELECT 'Insumos Físicos', COUNT(*) FROM Insumo
UNION ALL SELECT 'Químicos', COUNT(*) FROM Quimico
UNION ALL SELECT 'Estudiantes', COUNT(*) FROM Estudiante
UNION ALL SELECT 'Pedidos', COUNT(*) FROM Pedido
UNION ALL SELECT 'Detalles de Pedido', COUNT(*) FROM PedidoDetalle
UNION ALL SELECT 'Horarios', COUNT(*) FROM Horario
UNION ALL SELECT 'ParamInvCategoria', COUNT(*) FROM ParametroInventarioCategoria
UNION ALL SELECT 'ParamInvTipo', COUNT(*) FROM ParametroInventarioTipo
UNION ALL SELECT 'MotivoNoAprobado', COUNT(*) FROM MotivoNoAprobado
UNION ALL SELECT 'MotivoCancelacion', COUNT(*) FROM MotivoCancelacion
UNION ALL SELECT 'Notificaciones', COUNT(*) FROM Notificacion;

-- Stock actual vs mínimo
SELECT 
    ti.NombreTipoInsumo,
    ti.EsQuimico,
    CASE 
        WHEN ti.EsQuimico = 1 THEN COALESCE(SUM(q.CantQuimico), 0)
        ELSE COUNT(i.IDInsumo)
    END AS StockActual,
    ti.stockMinimo AS StockMinimo,
    CASE 
        WHEN ti.EsQuimico = 1 THEN 
            CASE WHEN COALESCE(SUM(q.CantQuimico), 0) < ti.stockMinimo THEN '⚠️ BAJO' ELSE '✅ OK' END
        ELSE 
            CASE WHEN COUNT(i.IDInsumo) < ti.stockMinimo THEN '⚠️ BAJO' ELSE '✅ OK' END
    END AS Estado,
    u.Unidad AS Unidad
FROM TipoInsumo ti
LEFT JOIN Quimico q ON ti.IDTipoInsumo = q.IDTipoInsumo AND ti.EsQuimico = 1
LEFT JOIN Insumo i ON ti.IDTipoInsumo = i.IDTipoInsumo AND ti.EsQuimico = 0
LEFT JOIN Unidad u ON ti.IDUnidad = u.IDUnidad
GROUP BY ti.IDTipoInsumo, ti.NombreTipoInsumo, ti.EsQuimico, ti.stockMinimo, u.Unidad
ORDER BY ti.NombreTipoInsumo;

-- Parámetros efectivos por tipo
SELECT * FROM v_parametro_inventario_resuelto ORDER BY NombreCategoria, NombreTipoInsumo;

-- Horarios libres (bloques no ocupados por estados activos)
SELECT * FROM v_horarios_libres ORDER BY FechaEntrega, HoraInicio;
