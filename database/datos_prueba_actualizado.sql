-- ============================================
-- SCRIPT DE DATOS DE PRUEBA PARA KALIUM
-- CORREGIDO - Sin IDs manuales, usa AUTO_INCREMENT
-- ============================================

USE kaliumdb;

-- Limpiar datos existentes (opcional, solo si quieres empezar desde cero)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE Notificacion;
-- TRUNCATE TABLE DetalleExperimento;
-- TRUNCATE TABLE Experimento;
-- TRUNCATE TABLE Incidentes;
-- TRUNCATE TABLE EstIncidente;
-- TRUNCATE TABLE DevolucionDetalle;
-- TRUNCATE TABLE Devolucion;
-- TRUNCATE TABLE EstDevolucion;
-- TRUNCATE TABLE EntregaQuimico;
-- TRUNCATE TABLE EntregaInsumo;
-- TRUNCATE TABLE Entrega;
-- TRUNCATE TABLE Quimico;
-- TRUNCATE TABLE Insumo;
-- TRUNCATE TABLE EstInsumo;
-- TRUNCATE TABLE PedidoDetalle;
-- TRUNCATE TABLE Pedido;
-- TRUNCATE TABLE Horario;
-- TRUNCATE TABLE TipoPedido;
-- TRUNCATE TABLE Curso;
-- TRUNCATE TABLE EstPedido;
-- TRUNCATE TABLE Estudiante;
-- TRUNCATE TABLE TipoInsumo;
-- TRUNCATE TABLE Unidad;
-- TRUNCATE TABLE Categoria;
-- TRUNCATE TABLE Instructor;
-- TRUNCATE TABLE Administrador;
-- TRUNCATE TABLE Usuario;
-- TRUNCATE TABLE Rol;
-- SET FOREIGN_KEY_CHECKS = 1;

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
-- Nota: Las contraseñas están en texto plano por ahora
-- Después implementaremos BCrypt
INSERT INTO Usuario (Nombre, Apellido, Correo, Contrasena, IDRol) VALUES
('Juan', 'Pérez', 'juan.perez@lab.com', 'password123', 1),
('María', 'García', 'maria.garcia@lab.com', 'password123', 2),
('Carlos', 'López', 'carlos.lopez@lab.com', 'password123', 3),
('Ana', 'Martínez', 'ana.martinez@lab.com', 'password123', 3);

-- ============================================
-- 3. ADMINISTRADORES
-- ============================================
-- Insertar administradores (IDUsuario 1 = Juan Pérez)
INSERT INTO Administrador (IDUsuario) VALUES (1);

-- ============================================
-- 4. INSTRUCTORES
-- ============================================
-- Insertar instructores (IDUsuario 2 y 3 = María García y Carlos López)
INSERT INTO Instructor (IDUsuario) VALUES (2), (3);

-- ============================================
-- 5. CATEGORÍAS
-- ============================================
INSERT INTO Categoria (NombreCategoria) VALUES
('Químicos'),
('Material de Vidrio'),
('Equipos de Laboratorio'),
('Material de Seguridad');

-- ============================================
-- 6. UNIDADES
-- ============================================
INSERT INTO Unidad (Unidad) VALUES
('ml'),
('g'),
('unidad'),
('kg'),
('L');

-- ============================================
-- 7. TIPOS DE INSUMO
-- ============================================
-- Nota: IDCategoria y IDUnidad dependen del orden de inserción
-- 1=Químicos, 2=Vidrio, 3=Equipos, 4=Seguridad
-- 1=ml, 2=g, 3=unidad, 4=kg, 5=L
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
-- 8. ESTADOS DE INSUMO
-- ============================================
INSERT INTO EstInsumo (NombreEstInsumo) VALUES
('Disponible'),
('En Uso'),
('Agotado'),
('En Mantenimiento');

-- ============================================
-- 9. INSUMOS FÍSICOS
-- ============================================
-- Solo para TipoInsumo donde EsQuimico=0 (IDs 3,4,5,6)
-- Los triggers validarán que no se inserten químicos aquí
INSERT INTO Insumo (IDEstInsumo, IDTipoInsumo, FechaIngreso) VALUES
-- Matraz Erlenmeyer (IDTipoInsumo=3, necesita mínimo 3)
(1, 3, '2024-01-10'),

-- Probeta Graduada (IDTipoInsumo=4, necesita mínimo 5)
(1, 4, '2024-01-10'),
(1, 4, '2024-01-15'),
(1, 4, '2024-01-20'),
(1, 4, '2024-02-01'),
(1, 4, '2024-02-05'),

-- Balanza Analítica (IDTipoInsumo=5, necesita mínimo 2)
(1, 5, '2024-01-10'),
(1, 5, '2024-01-15'),

-- Guantes de Nitrilo (IDTipoInsumo=6, necesita mínimo 50)
(1, 6, '2024-03-01'),
(1, 6, '2024-03-01'),
(1, 6, '2024-03-01'),
(1, 6, '2024-03-01'),
(1, 6, '2024-03-01');

-- ============================================
-- 10. QUÍMICOS
-- ============================================
-- Solo para TipoInsumo donde EsQuimico=1 (IDs 1,2,7,8)
-- Los triggers validarán que solo se inserten químicos aquí
INSERT INTO Quimico (CantQuimico, IDTipoInsumo, FechaIngreso) VALUES
-- Ácido Sulfúrico (IDTipoInsumo=1, necesita mínimo 100ml)
(500.5, 1, '2024-01-10'),

-- Hidróxido de Sodio (IDTipoInsumo=2, necesita mínimo 100g)
(250.0, 2, '2024-01-10'),

-- Etanol (IDTipoInsumo=7, necesita mínimo 500ml)
(1000.0, 7, '2024-01-15'),

-- Cloruro de Sodio (IDTipoInsumo=8, necesita mínimo 200g)
(500.0, 8, '2024-01-15');

-- ============================================
-- 11. ESTUDIANTES
-- ============================================
INSERT INTO Estudiante (Nombre, Apellido) VALUES
('Pedro', 'Ramírez'),
('Laura', 'Torres'),
('Miguel', 'Fernández'),
('Sofía', 'Morales');

-- ============================================
-- 12. ESTADOS DE PEDIDO
-- ============================================
INSERT INTO EstPedido (NombreEstPedido) VALUES
('Pendiente'),
('Aprobado'),
('En Preparación'),
('Entregado'),
('Cancelado');

-- ============================================
-- 13. CURSOS
-- ============================================
INSERT INTO Curso (NombreCurso) VALUES
('Química General I'),
('Química Orgánica'),
('Química Analítica'),
('Bioquímica');

-- ============================================
-- 14. TIPOS DE PEDIDO
-- ============================================
INSERT INTO TipoPedido (NombrePedido) VALUES
('Práctica de Laboratorio'),
('Experimento de Investigación'),
('Demostración');

-- ============================================
-- 15. HORARIOS
-- ============================================
INSERT INTO Horario (FechaEntrega, HoraInicio) VALUES
('2025-01-15', '2025-01-15 08:00:00'),
('2025-01-16', '2025-01-16 10:00:00'),
('2025-01-17', '2025-01-17 14:00:00'),
('2025-01-18', '2025-01-18 16:00:00'),
('2025-01-19', '2025-01-19 08:00:00'),
('2025-01-20', '2025-01-20 10:00:00');

-- ============================================
-- 16. PEDIDOS
-- ============================================
-- IDInstructor: 1=María García (ID Usuario 2), 2=Carlos López (ID Usuario 3)
-- IDEstPedido: 1=Pendiente, 2=Aprobado, 3=En Preparación
-- IDCurso: 1=Química General I, 2=Química Orgánica
-- IDTipoPedido: 1=Práctica de Laboratorio
-- IDHorario: 1-6 (horarios insertados arriba)
INSERT INTO Pedido (FechaPedido, CantGrupos, IDInstructor, IDEstPedido, IDCurso, IDTipoPedido, IDHorario) VALUES
('2025-01-05', 5, 1, 1, 1, 1, 1), -- Pedido Pendiente de María
('2025-01-06', 3, 2, 2, 2, 1, 2), -- Pedido Aprobado de Carlos
('2025-01-07', 4, 1, 3, 1, 1, 3); -- Pedido En Preparación de María

-- ============================================
-- 17. DETALLES DE PEDIDO
-- ============================================
-- IDPedido: 1, 2, 3 (pedidos insertados arriba)
-- IDTipoInsumo: 1=Ácido Sulfúrico, 2=Hidróxido, 3=Matraz, 5=Balanza
INSERT INTO PedidoDetalle (CantInsumo, IDPedido, IDTipoInsumo) VALUES
-- Pedido 1
(10, 1, 1), -- 10ml de Ácido Sulfúrico
(5, 1, 3),  -- 5 Matraces

-- Pedido 2
(8, 2, 2),  -- 8g de Hidróxido
(3, 2, 5),  -- 3 Balanzas

-- Pedido 3
(15, 3, 7), -- 15ml de Etanol
(2, 3, 4);  -- 2 Probetas

-- ============================================
-- 18. ENTREGAS
-- ============================================
-- Solo para pedidos aprobados o en preparación
-- IDPedido: 2 (Aprobado), 3 (En Preparación)
-- IDEstudiante: 1=Pedro, 2=Laura
INSERT INTO Entrega (FechaEntrega, HoraEntrega, IDPedido, IDEstudiante) VALUES
('2025-01-16', '2025-01-16 10:30:00', 2, 1), -- Entrega del Pedido 2 a Pedro
('2025-01-17', '2025-01-17 14:15:00', 3, 2); -- Entrega del Pedido 3 a Laura

-- ============================================
-- 19. ENTREGAS DE INSUMOS
-- ============================================
-- IDEntrega: 1, 2
-- IDInsumo: Basados en los IDs generados automáticamente
-- Asumiendo que los IDs se generaron en orden: 1-10
INSERT INTO EntregaInsumo (IDEntrega, IDInsumo) VALUES
(1, 5), -- Balanza para Pedido 2
(2, 2); -- Probeta para Pedido 3

-- ============================================
-- 20. ENTREGAS DE QUÍMICOS
-- ============================================
-- IDEntrega: 1, 2
-- IDQuimico: Basados en los IDs generados automáticamente (1-4)
INSERT INTO EntregaQuimico (IDEntrega, IDQuimico) VALUES
(1, 2), -- Hidróxido para Pedido 2
(2, 3); -- Etanol para Pedido 3

-- ============================================
-- 21. ESTADOS DE DEVOLUCIÓN
-- ============================================
INSERT INTO EstDevolucion (EstadoDevolucion) VALUES
('Completa'),
('Incompleta'),
('Con Daños');

-- ============================================
-- 22. DEVOLUCIONES
-- ============================================
-- IDDevolucion generado automáticamente
-- IDPedido: 2 (ya entregado)
-- IDEstDevolucion: 1=Completa, 2=Incompleta
-- IDEntrega: 1, 2
INSERT INTO Devolucion (FechaDevolucion, HoraDevolucion, IDPedido, IDEstDevolucion, IDEntrega) VALUES
('2025-01-16', '2025-01-16 18:00:00', 2, 1, 1),
('2025-01-17', '2025-01-17 19:30:00', 3, 2, 2);

-- ============================================
-- 23. DETALLES DE DEVOLUCIÓN
-- ============================================
-- IDDevolucion: 1, 2
-- IDInsumo: 5, 2
INSERT INTO DevolucionDetalle (IDDevolucion, IDInsumo) VALUES
(1, 5), -- Balanza devuelta
(2, 2); -- Probeta devuelta

-- ============================================
-- 24. ESTADOS DE INCIDENTE
-- ============================================
INSERT INTO EstIncidente (EstadoIncidente) VALUES
('Reportado'),
('En Revisión'),
('Resuelto'),
('Cancelado');

-- ============================================
-- 25. INCIDENTES
-- ============================================
-- IDDevolucion: 1, 2
-- IDEstudiante: 1=Pedro, 2=Laura
-- IDEstIncidente: 1=Reportado, 2=En Revisión, 3=Resuelto
INSERT INTO Incidentes (Descripcion, FechaIncidente, FechaSolucion, IDDevolucion, IDEstudiante, IDEstIncidente) VALUES
('Matraz roto durante la práctica', '2025-01-16', '2025-01-17', 1, 1, 3),
('Falta de reactivo en la devolución', '2025-01-17', NULL, 2, 2, 2);

-- ============================================
-- 26. EXPERIMENTOS
-- ============================================
INSERT INTO Experimento (NombreExperimento) VALUES
('Titulación Ácido-Base'),
('Síntesis de Aspirina'),
('Destilación Simple');

-- ============================================
-- 27. DETALLES DE EXPERIMENTO
-- ============================================
-- IDExperimento: 1, 2, 3
-- IDTipoInsumo: 1=Ácido Sulfúrico, 2=Hidróxido, 7=Etanol
INSERT INTO DetalleExperimento (CantInsumoExperimento, IDTipoInsumo, IDExperimento) VALUES
(50, 1, 1),  -- 50ml Ácido para Titulación
(25, 2, 1),  -- 25g Hidróxido para Titulación
(100, 7, 3); -- 100ml Etanol para Destilación

-- ============================================
-- 28. NOTIFICACIONES
-- ============================================
-- IDUsuario: 2 = María García (ADMIN_LABORATORIO)
-- Todas las notificaciones van a los administradores de laboratorio
INSERT INTO Notificacion (Titulo, Mensaje, Tipo, Leida, FechaCreacion, IDUsuario, DatosExtra) VALUES
-- Notificación de stock bajo - Matraz Erlenmeyer
('Stock bajo: Matraz Erlenmeyer', 
 'El insumo Matraz Erlenmeyer está por debajo del stock mínimo (1 disponible, mínimo: 3).', 
 'BAJO_STOCK', 
 0, 
 '2025-01-10 10:00:00',
 2, 
 JSON_OBJECT('idTipoInsumo', 3, 'stockRestante', 1, 'stockMinimo', 3)),

-- Notificación de stock bajo - Guantes
('Stock bajo: Guantes de Nitrilo', 
 'El insumo Guantes de Nitrilo está por debajo del stock mínimo (5 disponibles, mínimo: 50).', 
 'BAJO_STOCK', 
 0, 
 '2025-01-10 10:05:00',
 2, 
 JSON_OBJECT('idTipoInsumo', 6, 'stockRestante', 5, 'stockMinimo', 50)),

-- Notificación de nuevo pedido pendiente
('Nuevo pedido pendiente', 
 'El pedido de Química General I del instructor María García requiere aprobación.', 
 'PEDIDO_PENDIENTE', 
 0, 
 '2025-01-05 14:30:00',
 2, 
 JSON_OBJECT('idPedido', 1, 'idInstructor', 1, 'nombreInstructor', 'María García')),

-- Notificación de incidente reportado
('Incidente reportado', 
 'El estudiante Pedro Ramírez reportó: Matraz roto durante la práctica.', 
 'INCIDENTE', 
 0, 
 '2025-01-16 18:30:00',
 2, 
 JSON_OBJECT('idIncidente', 1, 'idEstudiante', 1, 'nombreEstudiante', 'Pedro Ramírez'));

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================
SELECT '✅ Datos de prueba insertados correctamente!' AS Resultado;

SELECT 
    'Roles' AS Tabla, 
    COUNT(*) AS Total 
FROM Rol
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM Usuario
UNION ALL
SELECT 'Categorías', COUNT(*) FROM Categoria
UNION ALL
SELECT 'Unidades', COUNT(*) FROM Unidad
UNION ALL
SELECT 'Tipos de Insumo', COUNT(*) FROM TipoInsumo
UNION ALL
SELECT 'Insumos Físicos', COUNT(*) FROM Insumo
UNION ALL
SELECT 'Químicos', COUNT(*) FROM Quimico
UNION ALL
SELECT 'Estudiantes', COUNT(*) FROM Estudiante
UNION ALL
SELECT 'Pedidos', COUNT(*) FROM Pedido
UNION ALL
SELECT 'Detalles de Pedido', COUNT(*) FROM PedidoDetalle
UNION ALL
SELECT 'Entregas', COUNT(*) FROM Entrega
UNION ALL
SELECT 'Notificaciones', COUNT(*) FROM Notificacion;

-- Verificar stock actual vs mínimo
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
    ti.Unidad AS Unidad
FROM TipoInsumo ti
LEFT JOIN Quimico q ON ti.IDTipoInsumo = q.IDTipoInsumo AND ti.EsQuimico = 1
LEFT JOIN Insumo i ON ti.IDTipoInsumo = i.IDTipoInsumo AND ti.EsQuimico = 0
LEFT JOIN Unidad u ON ti.IDUnidad = u.IDUnidad
GROUP BY ti.IDTipoInsumo, ti.NombreTipoInsumo, ti.EsQuimico, ti.stockMinimo, u.Unidad
ORDER BY ti.NombreTipoInsumo;