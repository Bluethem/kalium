-- ============================================
-- SCRIPT DE DATOS DE PRUEBA PARA KALIUM
-- Actualizado para coincidir con el nuevo esquema
-- ============================================

USE kaliumdb;
    
-- 1. Insertar Roles
INSERT INTO Rol (IDRol, NombreRol, Descripcion) VALUES
(1, 'ADMIN_SISTEMA', 'Administrador de sistemas - Gestiona usuarios y permisos'),
(2, 'ADMIN_LABORATORIO', 'Administrador de laboratorio - Gestiona inventario, pedidos y entregas'),
(3, 'INSTRUCTOR', 'Instructor - Crea pedidos y consulta información'),
(4, 'ESTUDIANTE', 'Estudiante - Consulta entregas (futuro)');

-- 2. Insertar Usuarios
INSERT INTO Usuario (IDUsuario, Nombre, Apellido, Correo, Contrasena, IDRol) VALUES
(1, 'Juan', 'Pérez', 'juan.perez@lab.com', 'password123', 1),
(2, 'María', 'García', 'maria.garcia@lab.com', 'password123', 2),
(3, 'Carlos', 'López', 'carlos.lopez@lab.com', 'password123', 3),
(4, 'Ana', 'Martínez', 'ana.martinez@lab.com', 'password123', 3);

-- 3. Insertar Administradores
INSERT INTO Administrador (IDAdministrador, IDUsuario) VALUES
(1, 1);

-- 4. Insertar Instructores
INSERT INTO Instructor (IDInstructor, IDUsuario) VALUES
(1, 2),
(2, 3);

-- 5. Insertar Categorías
INSERT INTO Categoria (IDCategoria, NombreCategoria) VALUES
(1, 'Químicos'),
(2, 'Material de Vidrio'),
(3, 'Equipos de Laboratorio'),
(4, 'Material de Seguridad');

-- 6. Insertar Unidades
INSERT INTO Unidad (IDUnidad, Unidad) VALUES
(1, 'ml'),
(2, 'g'),
(3, 'unidad'),
(4, 'kg'),
(5, 'L');

-- 7. Insertar Tipos de Insumo
INSERT INTO TipoInsumo (IDTipoInsumo, NombreTipoInsumo, Descripcion, IDCategoria, IDUnidad, EsQuimico, stockMinimo) VALUES
(1, 'Ácido Sulfúrico', 'Ácido fuerte utilizado en múltiples reacciones químicas', 1, 1, 1, 100),
(2, 'Hidróxido de Sodio', 'Base fuerte para neutralización y síntesis', 1, 2, 1, 100),
(3, 'Matraz Erlenmeyer', 'Matraz cónico de vidrio para mezclas', 2, 3, 0, 3),
(4, 'Probeta Graduada', 'Instrumento para medir volúmenes de líquidos', 2, 3, 0, 5),
(5, 'Balanza Analítica', 'Equipo de precisión para medir masas', 3, 3, 0, 2),
(6, 'Guantes de Nitrilo', 'Protección para manos en laboratorio', 4, 3, 0, 5),
(7, 'Etanol', 'Alcohol etílico para limpieza y reacciones', 1, 1, 1, 100),
(8, 'Cloruro de Sodio', 'Sal común para preparación de soluciones', 1, 2, 1, 200);

-- 8. Insertar Estados de Insumo
INSERT INTO EstInsumo (IDEstInsumo, NombreEstInsumo) VALUES
(1, 'Disponible'),
(2, 'En Uso'),
(3, 'Agotado'),
(4, 'En Mantenimiento');

-- 9. Insertar Insumos
INSERT INTO Insumo (IDInsumo, IDEstInsumo, IDTipoInsumo, FechaIngreso) VALUES
(1, 1, 3, '2025-09-10'),
(2, 2, 4, '2025-09-10'),
(3, 1, 5, '2025-09-10'),
(4, 1, 6, '2025-09-10'),
(5, 1, 5, '2025-09-10'),
(6, 1, 4, '2025-09-10');

-- 10. Insertar Químicos
INSERT INTO Quimico (IDQuimico, CantQuimico, IDTipoInsumo, FechaIngreso) VALUES
(1, 500.5, 1, '2025-09-10'),
(2, 250.0, 2, '2025-09-10'),
(3, 1000.0, 7, '2025-09-10'),
(4, 500.0, 8, '2025-09-10');

-- 11. Insertar Estudiantes
INSERT INTO Estudiante (IDEstudiante, Nombre, Apellido) VALUES
(1, 'Pedro', 'Ramírez'),
(2, 'Laura', 'Torres'),
(3, 'Miguel', 'Fernández'),
(4, 'Sofía', 'Morales');

-- 12. Insertar Estados de Pedido
INSERT INTO EstPedido (IDEstPedido, NombreEstPedido) VALUES
(1, 'Pendiente'),
(2, 'Aprobado'),
(3, 'En Preparación'),
(4, 'Entregado'),
(5, 'Cancelado');

-- 13. Insertar Cursos
INSERT INTO Curso (IDCurso, NombreCurso) VALUES
(1, 'Química General I'),
(2, 'Química Orgánica'),
(3, 'Química Analítica'),
(4, 'Bioquímica');

-- 14. Insertar Tipos de Pedido
INSERT INTO TipoPedido (IDTipoPedido, NombrePedido) VALUES
(1, 'Práctica de Laboratorio'),
(2, 'Experimento de Investigación'),
(3, 'Demostración');

-- 15. Insertar Horarios
INSERT INTO Horario (IDHorario, FechaEntrega, HoraInicio) VALUES
(1, '2025-09-10', '2025-09-10 08:00:00'),
(2, '2025-09-11', '2025-09-11 10:00:00'),
(3, '2025-09-11', '2025-09-11 12:00:00'),
(4, '2025-09-11', '2025-09-11 14:00:00'),
(5, '2025-09-11', '2025-09-11 16:00:00'),
(6, '2025-09-11', '2025-09-11 18:00:00');

-- 16. Insertar Pedidos
INSERT INTO Pedido (IDPedido, FechaPedido, CantGrupos, IDInstructor, IDEstPedido, IDCurso, IDTipoPedido, IDHorario) VALUES
(1, '2025-09-05', 5, 1, 2, 1, 1, 1),
(2, '2025-09-06', 3, 2, 3, 2, 1, 2);

-- 17. Insertar Detalles de Pedido
INSERT INTO PedidoDetalle (IDPedidoDetalle, CantInsumo, IDPedido, IDTipoInsumo) VALUES
(1, 10, 1, 1),
(2, 5, 1, 3),
(3, 8, 2, 2),
(4, 3, 2, 5);

-- 18. Insertar Entregas
INSERT INTO Entrega (IDEntrega, FechaEntrega, HoraEntrega, IDPedido, IDEstudiante) VALUES
(1, '2025-09-10', '2025-09-10 08:30:00', 1, 1),
(2, '2025-09-11', '2025-09-11 10:15:00', 2, 2);

-- 19. Insertar Entregas de Insumos
INSERT INTO EntregaInsumo (IDEntregaInsumo, IDEntrega, IDInsumo) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 2, 2),
(4, 2, 5);

-- 20. Insertar Entregas de Químicos
INSERT INTO EntregaQuimico (IDEntregaQuimico, IDEntrega, IDQuimico) VALUES
(1, 1, 1),
(2, 2, 2);

-- 21. Insertar Estados de Devolución
INSERT INTO EstDevolucion (IDEstDevolucion, EstadoDevolucion) VALUES
(1, 'Completa'),
(2, 'Incompleta'),
(3, 'Con Daños');

-- 22. Insertar Devoluciones
INSERT INTO Devolucion (IDDevolucion, FechaDevolucion, HoraDevolucion, IDPedido, IDEstDevolucion, IDEntrega) VALUES
(1, '2025-09-10', '2025-09-10 16:00:00', 1, 1, 1),
(2, '2025-09-11', '2025-09-11 17:30:00', 2, 2, 2);

-- 23. Insertar Detalles de Devolución
INSERT INTO DevolucionDetalle (IDDevolucionDetalle, IDDevolucion, IDInsumo) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 2, 2);

-- 24. Insertar Estados de Incidente
INSERT INTO EstIncidente (IDEstIncidente, EstadoIncidente) VALUES
(1, 'Reportado'),
(2, 'En Revisión'),
(3, 'Resuelto');

-- 25. Insertar Incidentes
INSERT INTO Incidentes (IDIncidentes, Descripcion, FechaIncidente, FechaSolucion, IDDevolucion, IDEstudiante, IDEstIncidente) VALUES
(1, 'Matraz roto durante la práctica', '2025-09-10', '2025-09-11', 1, 1, 3),
(2, 'Falta de reactivo en la devolución', '2025-09-11', NULL, 2, 2, 2);

-- 26. Insertar Experimentos
INSERT INTO Experimento (IDExperimento, NombreExperimento) VALUES
(1, 'Titulación Ácido-Base'),
(2, 'Síntesis de Aspirina'),
(3, 'Destilación Simple');

-- 27. Insertar Detalles de Experimento
INSERT INTO DetalleExperimento (IDDetalleExperimento, CantInsumoExperimento, IDTipoInsumo, IDExperimento) VALUES
(1, 50, 1, 1),
(2, 25, 2, 1),
(3, 100, 7, 3);

-- 28. Insertar Notificaciones
INSERT INTO Notificacion (Titulo, Mensaje, Tipo, Leida, FechaCreacion, IDUsuario, DatosExtra) VALUES
('Stock bajo: Ácido Sulfúrico', 
 'El insumo Ácido Sulfúrico ha alcanzado el nivel mínimo de stock (500.5 ml restantes).', 
 'BAJO_STOCK', 
 0, 
 '2025-09-10 09:00:00',
 2, 
 JSON_OBJECT('idTipoInsumo', 1, 'stockRestante', 500.5)),

('Stock bajo: Hidróxido de Sodio', 
 'El insumo Hidróxido de Sodio ha alcanzado el nivel mínimo de stock (250 g restantes).', 
 'BAJO_STOCK', 
 0, 
 '2025-09-10 09:30:00',
 2, 
 JSON_OBJECT('idTipoInsumo', 2, 'stockRestante', 250)),

('Nuevo pedido pendiente', 
 'El pedido #1 de Química General I requiere aprobación.', 
 'PEDIDO_PENDIENTE', 
 0, 
 '2025-09-05 14:30:00',
 2, 
 JSON_OBJECT('idPedido', 1, 'idInstructor', 1)),

('Incidente reportado', 
 'El estudiante Pedro Ramírez reportó un matraz roto durante la práctica.', 
 'INCIDENTE', 
 0, 
 '2025-09-10 16:30:00',
 2, 
 JSON_OBJECT('idIncidente', 1, 'idEstudiante', 1)),

('Stock bajo: Matraz Erlenmeyer', 
 'El insumo Matraz Erlenmeyer está por debajo del stock mínimo (1 disponible, mínimo: 3).', 
 'BAJO_STOCK', 
 0, 
 '2025-09-10 10:00:00',
 2, 
 JSON_OBJECT('idTipoInsumo', 3, 'stockRestante', 1));


SELECT 'Datos de prueba insertados correctamente!' AS Resultado;
SELECT COUNT(*) AS TotalTiposInsumo FROM TipoInsumo;
SELECT COUNT(*) AS TotalInsumos FROM Insumo;
SELECT COUNT(*) AS TotalUsuarios FROM Usuario;

-- =========================
-- TRIGGERS PARA VALIDACION
-- =========================

-- Insumo: no permitir si TipoInsumo es quimico
CREATE TRIGGER trg_insumo_before_insert
BEFORE INSERT ON Insumo
FOR EACH ROW
BEGIN
  DECLARE vEsQuimico TINYINT DEFAULT 0;
  SELECT EsQuimico INTO vEsQuimico FROM TipoInsumo WHERE IDTipoInsumo = NEW.IDTipoInsumo;
  IF vEsQuimico = 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: TipoInsumo es quimico, no puede insertarse en Insumo';
  END IF;
END;
//

CREATE TRIGGER trg_insumo_before_update
BEFORE UPDATE ON Insumo
FOR EACH ROW
BEGIN
  DECLARE vEsQuimico TINYINT DEFAULT 0;
  SELECT EsQuimico INTO vEsQuimico FROM TipoInsumo WHERE IDTipoInsumo = NEW.IDTipoInsumo;
  IF vEsQuimico = 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: TipoInsumo es quimico, no puede asignarse en Insumo';
  END IF;
END;
//

-- Quimico: solo permitir si TipoInsumo es quimico
CREATE TRIGGER trg_quimico_before_insert
BEFORE INSERT ON Quimico
FOR EACH ROW
BEGIN
  DECLARE vEsQuimico TINYINT DEFAULT 0;
  SELECT EsQuimico INTO vEsQuimico FROM TipoInsumo WHERE IDTipoInsumo = NEW.IDTipoInsumo;
  IF vEsQuimico = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: TipoInsumo no es quimico, no puede insertarse en Quimico';
  END IF;
  IF NEW.CantQuimico < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: CantQuimico no puede ser negativa';
  END IF;
END;
//

CREATE TRIGGER trg_quimico_before_update
BEFORE UPDATE ON Quimico
FOR EACH ROW
BEGIN
  DECLARE vEsQuimico TINYINT DEFAULT 0;
  SELECT EsQuimico INTO vEsQuimico FROM TipoInsumo WHERE IDTipoInsumo = NEW.IDTipoInsumo;
  IF vEsQuimico = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: TipoInsumo no es quimico, no puede actualizarse en Quimico';
  END IF;
  IF NEW.CantQuimico < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: CantQuimico no puede ser negativa';
  END IF;
END;