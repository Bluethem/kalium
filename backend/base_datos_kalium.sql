-- ============================================
-- SCRIPT DE BASE DE DATOS KALIUMDB
-- Actualizado para coincidir con el nuevo esquema
-- Script utilizable para mySQL con phpmyadmin
-- ============================================

CREATE DATABASE kaliumdb;

USE kaliumdb;

CREATE TABLE Usuario
(
  IDUsuario INT NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  Correo VARCHAR(100) NOT NULL,
  Contrasena VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDUsuario),
  UNIQUE (Correo)
);

CREATE TABLE Administrador
(
  IDAdministrador INT NOT NULL,
  IDUsuario INT NOT NULL,
  PRIMARY KEY (IDAdministrador),
  FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);

CREATE TABLE Instructor
(
  IDInstructor INT NOT NULL,
  IDUsuario INT NOT NULL,
  PRIMARY KEY (IDInstructor),
  FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);

CREATE TABLE EstPedido
(
  IDEstPedido INT NOT NULL,
  NombreEstPedido VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstPedido)
);

CREATE TABLE Curso
(
  IDCurso INT NOT NULL,
  NombreCurso VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDCurso)
);

CREATE TABLE TipoPedido
(
  IDTipoPedido INT NOT NULL,
  NombrePedido VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDTipoPedido)
);

CREATE TABLE Horario
(
  IDHorario INT NOT NULL,
  FechaEntrega DATE NOT NULL,
  HoraInicio DATETIME NOT NULL,
  PRIMARY KEY (IDHorario)
);

CREATE TABLE Pedido
(
  IDPedido INT NOT NULL,
  FechaPedido DATE NOT NULL,
  CantGrupos INT NOT NULL,
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
  IDCategoria INT NOT NULL,
  NombreCategoria VARCHAR(50) NOT NULL,
  PRIMARY KEY (IDCategoria)
);

CREATE TABLE Unidad
(
  IDUnidad INT NOT NULL,
  Unidad VARCHAR(50) NOT NULL,
  PRIMARY KEY (IDUnidad)
);

CREATE TABLE TipoInsumo
(
  IDTipoInsumo INT NOT NULL,
  NombreTipoInsumo VARCHAR(100) NOT NULL,
  Descripcion VARCHAR(255) NOT NULL,
  IDCategoria INT NOT NULL,
  IDUnidad INT NOT NULL,
  PRIMARY KEY (IDTipoInsumo),
  FOREIGN KEY (IDCategoria) REFERENCES Categoria(IDCategoria),
  FOREIGN KEY (IDUnidad) REFERENCES Unidad(IDUnidad)
);

CREATE TABLE PedidoDetalle
(
  IDPedidoDetalle INT NOT NULL,
  CantInsumo INT NOT NULL,
  IDPedido INT NOT NULL,
  IDTipoInsumo INT NOT NULL,
  PRIMARY KEY (IDPedidoDetalle),
  FOREIGN KEY (IDPedido) REFERENCES Pedido(IDPedido),
  FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo)
);

CREATE TABLE EstInsumo
(
  IDEstInsumo INT NOT NULL,
  NombreEstInsumo VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstInsumo)
);

CREATE TABLE Insumo
(
  IDInsumo INT NOT NULL,
  IDEstInsumo INT NOT NULL,
  IDTipoInsumo INT NOT NULL,
  PRIMARY KEY (IDInsumo),
  FOREIGN KEY (IDEstInsumo) REFERENCES EstInsumo(IDEstInsumo),
  FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo)
);

CREATE TABLE Estudiante
(
  IDEstudiante INT NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstudiante)
);

CREATE TABLE Entrega
(
  IDEntrega INT NOT NULL,
  FechaEntrega DATE NOT NULL,
  HoraEntrega DATETIME NOT NULL,
  IDPedido INT NOT NULL,
  IDEstudiante INT NOT NULL,
  PRIMARY KEY (IDEntrega),
  FOREIGN KEY (IDPedido) REFERENCES Pedido(IDPedido),
  FOREIGN KEY (IDEstudiante) REFERENCES Estudiante(IDEstudiante)
);

CREATE TABLE EntregaInsumo
(
  IDEntregaInsumo INT NOT NULL,
  IDEntrega INT NOT NULL,
  IDInsumo INT NOT NULL,
  PRIMARY KEY (IDEntregaInsumo),
  FOREIGN KEY (IDEntrega) REFERENCES Entrega(IDEntrega),
  FOREIGN KEY (IDInsumo) REFERENCES Insumo(IDInsumo)
);

CREATE TABLE Experimento
(
  IDExperimento INT NOT NULL,
  NombreExperimento VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDExperimento)
);

CREATE TABLE DetalleExperimento
(
  IDDetalleExperimento INT NOT NULL,
  CantInsumoExperimento INT NOT NULL,
  IDTipoInsumo INT NOT NULL,
  IDExperimento INT NOT NULL,
  PRIMARY KEY (IDDetalleExperimento),
  FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo),
  FOREIGN KEY (IDExperimento) REFERENCES Experimento(IDExperimento)
);

CREATE TABLE EstDevolucion
(
  IDEstDevolucion INT NOT NULL,
  EstadoDevolucion VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstDevolucion)
);

CREATE TABLE Devolucion
(
  IDDevolucion INT NOT NULL,
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
  IDDevolucionDetalle INT NOT NULL,
  IDDevolucion INT NOT NULL,
  IDInsumo INT NOT NULL,
  PRIMARY KEY (IDDevolucionDetalle),
  FOREIGN KEY (IDDevolucion) REFERENCES Devolucion(IDDevolucion),
  FOREIGN KEY (IDInsumo) REFERENCES Insumo(IDInsumo)
);

CREATE TABLE EstIncidente
(
  IDEstIncidente INT NOT NULL,
  EstadoIncidente VARCHAR(100) NOT NULL,
  PRIMARY KEY (IDEstIncidente)
);

CREATE TABLE Incidentes
(
  IDIncidentes INT NOT NULL,
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
  IDQuimico INT NOT NULL,
  CantQuimico FLOAT NOT NULL,
  IDTipoInsumo INT NOT NULL,
  PRIMARY KEY (IDQuimico),
  FOREIGN KEY (IDTipoInsumo) REFERENCES TipoInsumo(IDTipoInsumo)
);

CREATE TABLE EntregaQuimico
(
  IDEntregaQuimico INT NOT NULL,
  IDEntrega INT NOT NULL,
  IDQuimico INT NOT NULL,
  PRIMARY KEY (IDEntregaQuimico),
  FOREIGN KEY (IDEntrega) REFERENCES Entrega(IDEntrega),
  FOREIGN KEY (IDQuimico) REFERENCES Quimico(IDQuimico)
);