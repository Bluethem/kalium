-- ============================================
-- SCRIPT DE DATOS DE PRUEBA PARA KALIUM
-- Actualizado para coincidir con el nuevo esquema
-- ============================================

USE kaliumdb;
    
-- 1. Insertar Usuarios
INSERT INTO Usuario (IDUsuario, Nombre, Apellido, Correo, Contrasena) VALUES
(1, 'Juan', 'Pérez', 'juan.perez@lab.com', 'password123'),
(2, 'María', 'García', 'maria.garcia@lab.com', 'password123'),
(3, 'Carlos', 'López', 'carlos.lopez@lab.com', 'password123'),
(4, 'Ana', 'Martínez', 'ana.martinez@lab.com', 'password123');

-- 2. Insertar Administradores
INSERT INTO Administrador (IDAdministrador, IDUsuario) VALUES
(1, 1);

-- 3. Insertar Instructores
INSERT INTO Instructor (IDInstructor, IDUsuario) VALUES
(1, 2),
(2, 3);

-- 4. Insertar Categorías
INSERT INTO Categoria (IDCategoria, NombreCategoria) VALUES
(1, 'Químicos'),
(2, 'Material de Vidrio'),
(3, 'Equipos de Laboratorio'),
(4, 'Material de Seguridad');

-- 5. Insertar Unidades
INSERT INTO Unidad (IDUnidad, Unidad) VALUES
(1, 'ml'),
(2, 'g'),
(3, 'unidad'),
(4, 'kg'),
(5, 'L');

-- 6. Insertar Tipos de Insumo
INSERT INTO TipoInsumo (IDTipoInsumo, NombreTipoInsumo, Descripcion, IDCategoria, IDUnidad, EsQuimico) VALUES
(1, 'Ácido Sulfúrico', 'Ácido fuerte utilizado en múltiples reacciones químicas', 1, 1, 1),
(2, 'Hidróxido de Sodio', 'Base fuerte para neutralización y síntesis', 1, 2,1),
(3, 'Matraz Erlenmeyer', 'Matraz cónico de vidrio para mezclas', 2, 3, 0),
(4, 'Probeta Graduada', 'Instrumento para medir volúmenes de líquidos', 2, 3, 0),
(5, 'Balanza Analítica', 'Equipo de precisión para medir masas', 3, 3, 0),
(6, 'Guantes de Nitrilo', 'Protección para manos en laboratorio', 4, 3, 0),
(7, 'Etanol', 'Alcohol etílico para limpieza y reacciones', 1, 1, 1),
(8, 'Cloruro de Sodio', 'Sal común para preparación de soluciones', 1, 2, 1);

-- 7. Insertar Estados de Insumo
INSERT INTO EstInsumo (IDEstInsumo, NombreEstInsumo) VALUES
(1, 'Disponible'),
(2, 'En Uso'),
(3, 'Agotado'),
(4, 'En Mantenimiento');

-- 8. Insertar Insumos
INSERT INTO Insumo (IDInsumo, IDEstInsumo, IDTipoInsumo, FechaIngreso) VALUES
(1, 1, 3, '2025-09-10'), -- Matraz Erlenmeyer Disponible (cantida 1)
(2, 2, 4, '2025-09-10'), -- Probeta en Uso (Cantidad 1)
(3, 1, 5, '2025-09-10'), -- Balanza Disponible (Cantidad 1)
(4, 1, 6, '2025-09-10'), -- Guantes Disponibles (Cantidad 1)
(5, 1, 5, '2025-09-10'), -- Balanza Disponible (Cantidad 1)
(6, 1, 4, '2025-09-10'); -- Probeta Disponible (Cantidad 1)

-- 9. Insertar Químicos
INSERT INTO Quimico (IDQuimico, CantQuimico, IDTipoInsumo, FechaIngreso) VALUES
(1, 500.5, 1, '2025-09-10'), -- 500.5 ml de Ácido Sulfúrico
(2, 250.0, 2, '2025-09-10'), -- 250 g de Hidróxido de Sodio
(3, 1000.0, 7, '2025-09-10'), -- 1000 ml de Etanol
(4, 500.0, 8, '2025-09-10'); -- 500 g de Cloruro de Sodio

-- 10. Insertar Estudiantes
INSERT INTO Estudiante (IDEstudiante, Nombre, Apellido) VALUES
(1, 'Pedro', 'Ramírez'),
(2, 'Laura', 'Torres'),
(3, 'Miguel', 'Fernández'),
(4, 'Sofia', 'Morales');

-- 11. Insertar Estados de Pedido
INSERT INTO EstPedido (IDEstPedido, NombreEstPedido) VALUES
(1, 'Pendiente'),
(2, 'Aprobado'),
(3, 'En Preparación'),
(4, 'Entregado'),
(5, 'Cancelado');

-- 12. Insertar Cursos
INSERT INTO Curso (IDCurso, NombreCurso) VALUES
(1, 'Química General I'),
(2, 'Química Orgánica'),
(3, 'Química Analítica'),
(4, 'Bioquímica');

-- 13. Insertar Tipos de Pedido
INSERT INTO TipoPedido (IDTipoPedido, NombrePedido) VALUES
(1, 'Práctica de Laboratorio'),
(2, 'Experimento de Investigación'),
(3, 'Demostración');

-- 14. Insertar Horarios
INSERT INTO Horario (IDHorario, FechaEntrega, HoraInicio) VALUES
(1, '2025-09-10', '2025-09-10 08:00:00'),
(2, '2025-09-11', '2025-09-11 10:00:00'),
(3, '2025-09-12', '2025-09-12 14:00:00');

-- 15. Insertar Pedidos
INSERT INTO Pedido (IDPedido, FechaPedido, CantGrupos, IDInstructor, IDEstPedido, IDCurso, IDTipoPedido, IDHorario) VALUES
(1, '2025-09-05', 5, 1, 2, 1, 1, 1),
(2, '2025-09-06', 3, 2, 3, 2, 1, 2);

-- 16. Insertar Detalles de Pedido
INSERT INTO PedidoDetalle (IDPedidoDetalle, CantInsumo, IDPedido, IDTipoInsumo) VALUES
(1, 10, 1, 1), -- 10 unidades de Ácido Sulfúrico para pedido 1
(2, 5, 1, 3),  -- 5 Matraces para pedido 1
(3, 8, 2, 2),  -- 8 unidades de Hidróxido para pedido 2
(4, 3, 2, 5);  -- 3 Balanzas para pedido 2

-- 17. Insertar Entregas
INSERT INTO Entrega (IDEntrega, FechaEntrega, HoraEntrega, IDPedido, IDEstudiante) VALUES
(1, '2025-09-10', '2025-09-10 08:30:00', 1, 1),
(2, '2025-09-11', '2025-09-11 10:15:00', 2, 2);

-- 18. Insertar Entregas de Insumos
INSERT INTO EntregaInsumo (IDEntregaInsumo, IDEntrega, IDInsumo) VALUES
(1, 1, 1), -- Entrega 1 incluye Matraz
(2, 1, 3), -- Entrega 1 incluye Balanza
(3, 2, 2), -- Entrega 2 incluye Probeta
(4, 2, 5); -- Entrega 2 incluye Balanza

-- 19. Insertar Entregas de Químicos
INSERT INTO EntregaQuimico (IDEntregaQuimico, IDEntrega, IDQuimico) VALUES
(1, 1, 1), -- Entrega 1 incluye Químico 1
(2, 2, 2); -- Entrega 2 incluye Químico 2

-- 20. Insertar Estados de Devolución
INSERT INTO EstDevolucion (IDEstDevolucion, EstadoDevolucion) VALUES
(1, 'Completa'),
(2, 'Incompleta'),
(3, 'Con Daños');

-- 21. Insertar Devoluciones
INSERT INTO Devolucion (IDDevolucion, FechaDevolucion, HoraDevolucion, IDPedido, IDEstDevolucion, IDEntrega) VALUES
(1, '2025-09-10', '2025-09-10 16:00:00', 1, 1, 1),
(2, '2025-09-11', '2025-09-11 17:30:00', 2, 2, 2);

-- 22. Insertar Detalles de Devolución
INSERT INTO DevolucionDetalle (IDDevolucionDetalle, IDDevolucion, IDInsumo) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 2, 2);

-- 23. Insertar Estados de Incidente
INSERT INTO EstIncidente (IDEstIncidente, EstadoIncidente) VALUES
(1, 'Reportado'),
(2, 'En Revisión'),
(3, 'Resuelto');

-- 24. Insertar Incidentes
INSERT INTO Incidentes (IDIncidentes, Descripcion, FechaIncidente, FechaSolucion, IDDevolucion, IDEstudiante, IDEstIncidente) VALUES
(1, 'Matraz roto durante la práctica', '2025-09-10', '2025-09-11', 1, 1, 3),
(2, 'Falta de reactivo en la devolución', '2025-09-11', NULL, 2, 2, 2);

-- 25. Insertar Experimentos
INSERT INTO Experimento (IDExperimento, NombreExperimento) VALUES
(1, 'Titulación Ácido-Base'),
(2, 'Síntesis de Aspirina'),
(3, 'Destilación Simple');

-- 26. Insertar Detalles de Experimento
INSERT INTO DetalleExperimento (IDDetalleExperimento, CantInsumoExperimento, IDTipoInsumo, IDExperimento) VALUES
(1, 50, 1, 1), -- 50 ml de Ácido Sulfúrico para Titulación
(2, 25, 2, 1), -- 25 g de Hidróxido para Titulación
(3, 100, 7, 3); -- 100 ml de Etanol para Destilación

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