-- ============================================
-- SCRIPT DE BASE DE DATOS KALIUMDB
-- Actualizado para coincidir con el nuevo esquema
-- Script utilizable para mySQL con phpmyadmin
-- ============================================

CREATE DATABASE kaliumdb;

USE kaliumdb;

CREATE TABLE Rol (
  IDRol INT NOT NULL AUTO_INCREMENT,
  NombreRol VARCHAR(50) NOT NULL UNIQUE,
  Descripcion VARCHAR(255),
  PRIMARY KEY (IDRol)
);

CREATE TABLE Usuario
(
  IDUsuario INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  Correo VARCHAR(100) NOT NULL,
  Contrasena VARCHAR(100) NOT NULL,
  IDRol INT NOT NULL,
  PRIMARY KEY (IDUsuario),
  UNIQUE (Correo),
  FOREIGN KEY (IDRol) REFERENCES Rol(IDRol)
);

CREATE TABLE Administrador
(
  IDAdministrador INT NOT NULL AUTO_INCREMENT,
  IDUsuario INT NOT NULL UNIQUE,
  PRIMARY KEY (IDAdministrador),
  FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);

CREATE TABLE Instructor
(
  IDInstructor INT NOT NULL AUTO_INCREMENT,
  IDUsuario INT NOT NULL UNIQUE,
  PRIMARY KEY (IDInstructor),
  FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);

CREATE TABLE EstPedido
(
  IDEstPedido INT NOT NULL AUTO_INCREMENT,
  NombreEstPedido VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstPedido)
);

CREATE TABLE Curso
(
  IDCurso INT NOT NULL AUTO_INCREMENT,
  NombreCurso VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDCurso)
);

CREATE TABLE TipoPedido
(
  IDTipoPedido INT NOT NULL AUTO_INCREMENT,
  NombrePedido VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDTipoPedido)
);

CREATE TABLE Horario
(
  IDHorario INT NOT NULL AUTO_INCREMENT,
  FechaEntrega DATE NOT NULL,
  HoraInicio DATETIME NOT NULL,
  PRIMARY KEY (IDHorario)
);

CREATE TABLE Pedido
(
  IDPedido INT NOT NULL AUTO_INCREMENT,
  FechaPedido DATE NOT NULL,
  CantGrupos INT NOT NULL CHECK (CantGrupos > 0),
  IDInstructor INT NOT NULL,
  IDEstPedido INT NOT NULL,
  IDCurso INT NOT NULL,
  IDTipoPedido INT NOT NULL,
  IDHorario INT NOT NULL,
  PRIMARY KEY (IDPedido),
  FOREIGN KEY (IDInstructor) REFERENCES Instructor(IDInstructor),
  FOREIGN KEY (IDEstPedido) REFERENCES EstPedido(IDEstPedido),
  FOREIGN KEY (IDCurso) REFERENCES Curso(IDCurso),
  FOREIGN KEY (IDTipoPedido) REFERENCES TipoPedido(IDTipoPedido),
  FOREIGN KEY (IDHorario) REFERENCES Horario(IDHorario)
);

CREATE TABLE Categoria
(
  IDCategoria INT NOT NULL AUTO_INCREMENT,
  NombreCategoria VARCHAR(50) NOT NULL,
  PRIMARY KEY (IDCategoria)
);

CREATE TABLE Unidad
(
  IDUnidad INT NOT NULL AUTO_INCREMENT,
  Unidad VARCHAR(50) NOT NULL,
  PRIMARY KEY (IDUnidad)
);

CREATE TABLE TipoInsumo
(
  IDTipoInsumo INT NOT NULL AUTO_INCREMENT,
  NombreTipoInsumo VARCHAR(100) NOT NULL UNIQUE,
  Descripcion VARCHAR(255) NOT NULL,
  IDCategoria INT NOT NULL,
  IDUnidad INT NOT NULL,
  EsQuimico TINYINT(1) NOT NULL DEFAULT 0, -- 1 = químico, 0 = insumo físico
  stockMinimo INT NOT NULL DEFAULT 0,
  PRIMARY KEY (IDTipoInsumo),
  FOREIGN KEY (IDCategoria) REFERENCES Categoria(IDCategoria),
  FOREIGN KEY (IDUnidad) REFERENCES Unidad(IDUnidad)
);

CREATE TABLE PedidoDetalle
(
  IDPedidoDetalle INT NOT NULL AUTO_INCREMENT,
  CantInsumo INT NOT NULL,
  IDPedido INT NOT NULL,
  IDTipoInsumo INT NOT NULL,
  IDEstPedidoDetalle INT NOT NULL,
  PRIMARY KEY (IDPedidoDetalle),
  FOREIGN KEY (IDPedido) REFERENCES Pedido(IDPedido),
  FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo),
  FOREIGN KEY (IDEstPedidoDetalle) REFERENCES EstPedidoDetalle(IDEstPedidoDetalle)
);

CREATE TABLE EstPedidoDetalle (
  IDEstPedidoDetalle INT NOT NULL AUTO_INCREMENT,
  NombreEstDetalle VARCHAR(50) NOT NULL,
  PRIMARY KEY (IDEstPedidoDetalle)
);

CREATE TABLE EstInsumo
(
  IDEstInsumo INT NOT NULL AUTO_INCREMENT,
  NombreEstInsumo VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstInsumo)
);

CREATE TABLE Insumo
(
  IDInsumo INT NOT NULL AUTO_INCREMENT,
  IDEstInsumo INT NOT NULL,
  IDTipoInsumo INT NOT NULL,
  FechaIngreso DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (IDInsumo),
  FOREIGN KEY (IDEstInsumo) REFERENCES EstInsumo(IDEstInsumo),
  FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo)
);  

CREATE TABLE Estudiante
(
  IDEstudiante INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstudiante)
);

CREATE TABLE Entrega
(
  IDEntrega INT NOT NULL AUTO_INCREMENT,
  FechaEntrega DATE NOT NULL,
  HoraEntrega DATETIME NOT NULL,
  IDPedido INT NOT NULL,
  IDEstudiante INT NULL, -- Nullable: Se asigna después de generar la entrega
  PRIMARY KEY (IDEntrega),
  FOREIGN KEY (IDPedido) REFERENCES Pedido(IDPedido),
  FOREIGN KEY (IDEstudiante) REFERENCES Estudiante(IDEstudiante)
);

CREATE TABLE EntregaInsumo
(
  IDEntregaInsumo INT NOT NULL AUTO_INCREMENT,
  IDEntrega INT NOT NULL,
  IDInsumo INT NOT NULL,
  PRIMARY KEY (IDEntregaInsumo),
  FOREIGN KEY (IDEntrega) REFERENCES Entrega(IDEntrega),
  FOREIGN KEY (IDInsumo) REFERENCES Insumo(IDInsumo)
);

CREATE TABLE Experimento
(
  IDExperimento INT NOT NULL AUTO_INCREMENT,
  NombreExperimento VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDExperimento)
);

CREATE TABLE DetalleExperimento
(
  IDDetalleExperimento INT NOT NULL AUTO_INCREMENT,
  CantInsumoExperimento INT NOT NULL,
  IDTipoInsumo INT NOT NULL,
  IDExperimento INT NOT NULL,
  PRIMARY KEY (IDDetalleExperimento),
  FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo),
  FOREIGN KEY (IDExperimento) REFERENCES Experimento(IDExperimento)
);

CREATE TABLE EstDevolucion
(
  IDEstDevolucion INT NOT NULL AUTO_INCREMENT,
  EstadoDevolucion VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstDevolucion)
);

CREATE TABLE Devolucion
(
  IDDevolucion INT NOT NULL AUTO_INCREMENT,
  FechaDevolucion DATE NOT NULL,
  HoraDevolucion DATETIME NOT NULL,
  IDPedido INT NOT NULL,
  IDEstDevolucion INT NOT NULL,
  IDEntrega INT NOT NULL,
  PRIMARY KEY (IDDevolucion),
  FOREIGN KEY (IDPedido) REFERENCES Pedido(IDPedido),
  FOREIGN KEY (IDEstDevolucion) REFERENCES EstDevolucion(IDEstDevolucion),
  FOREIGN KEY (IDEntrega) REFERENCES Entrega(IDEntrega)
);

CREATE TABLE DevolucionDetalle
(
  IDDevolucionDetalle INT NOT NULL AUTO_INCREMENT,
  IDDevolucion INT NOT NULL,
  IDInsumo INT NOT NULL,
  EstadoInsumoDevuelto VARCHAR(50) NOT NULL DEFAULT 'OK' COMMENT 'OK, Dañado, Perdido',
  Observaciones VARCHAR(255) NULL COMMENT 'Observaciones sobre el estado del insumo',
  PRIMARY KEY (IDDevolucionDetalle),
  FOREIGN KEY (IDDevolucion) REFERENCES Devolucion(IDDevolucion),
  FOREIGN KEY (IDInsumo) REFERENCES Insumo(IDInsumo)
);

CREATE TABLE EstIncidente
(
  IDEstIncidente INT NOT NULL AUTO_INCREMENT,
  EstadoIncidente VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstIncidente)
);

CREATE TABLE Incidentes
(
  IDIncidentes INT NOT NULL AUTO_INCREMENT,
  Descripcion VARCHAR(255) NOT NULL,
  FechaIncidente DATE NOT NULL,
  FechaSolucion DATE,
  IDDevolucion INT NOT NULL,
  IDEstudiante INT NOT NULL,
  IDEstIncidente INT NOT NULL,
  PRIMARY KEY (IDIncidentes),
  FOREIGN KEY (IDDevolucion) REFERENCES Devolucion(IDDevolucion),
  FOREIGN KEY (IDEstudiante) REFERENCES Estudiante(IDEstudiante),
  FOREIGN KEY (IDEstIncidente) REFERENCES EstIncidente(IDEstIncidente)
);

CREATE TABLE Quimico
(
  IDQuimico INT NOT NULL AUTO_INCREMENT,
  CantQuimico FLOAT NOT NULL,
  IDTipoInsumo INT NOT NULL,
  FechaIngreso DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (IDQuimico),
  FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo)
);

CREATE TABLE EntregaQuimico
(
  IDEntregaQuimico INT NOT NULL AUTO_INCREMENT,
  IDEntrega INT NOT NULL,
  IDQuimico INT NOT NULL,
  PRIMARY KEY (IDEntregaQuimico),
  FOREIGN KEY (IDEntrega) REFERENCES Entrega(IDEntrega),
  FOREIGN KEY (IDQuimico) REFERENCES Quimico(IDQuimico)
);

CREATE TABLE Notificacion (
  IDNotificacion INT NOT NULL AUTO_INCREMENT,
  Titulo VARCHAR(100) NOT NULL,
  Mensaje VARCHAR(255) NOT NULL,
  Tipo VARCHAR(50) NOT NULL, -- 'BAJO_STOCK', 'PEDIDO_PENDIENTE', 'INCIDENTE', etc.
  Leida TINYINT(1) NOT NULL DEFAULT 0,
  FechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  IDUsuario INT NOT NULL,
  DatosExtra JSON, -- Para guardar información adicional (ej: idTipoInsumo)
  PRIMARY KEY (IDNotificacion),
  FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);