
START TRANSACTION;

CREATE DATABASE IF NOT EXISTS hotel_rural;
USE hotel_rural;

CREATE TABLE `administrador` (
  `idUsuario` int NOT NULL,
  `userName` varchar(50) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `arrendador` (
  `codigo` varchar(10) NOT NULL,
  `tipo` varchar(5) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido1` varchar(100) DEFAULT NULL,
  `apellido2` varchar(100) DEFAULT NULL,
  `tipoDocumento` varchar(5) DEFAULT NULL,
  `documento` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `arrendador` VALUES
('0000004794', 'ARRE', 'Elena', 'Serrano', 'Castro', 'DNI', '50093052H');

CREATE TABLE `comunicaciones_ses` (
  `idComunicacionSES` bigint NOT NULL,
  `referenciaContrato` varchar(50) NOT NULL,
  `idReserva` int DEFAULT NULL,
  `idParte` bigint DEFAULT NULL,
  `tipo_comunicacion` varchar(10) NOT NULL,
  `codigo_lote` varchar(100) DEFAULT NULL,
  `codigo_comunicacion` varchar(100) DEFAULT NULL,
  `estado_ses` varchar(50) DEFAULT NULL,
  `codigo_estado` int DEFAULT NULL,
  `descripcion_estado` varchar(255) DEFAULT NULL,
  `anulada` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_peticion` datetime DEFAULT NULL,
  `fecha_procesamiento` datetime DEFAULT NULL,
  `codigo_arrendador` varchar(50) DEFAULT NULL,
  `aplicacion` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
);

CREATE TABLE `contrato` (
  `referencia` varchar(50) NOT NULL,
  `idReserva` int NOT NULL,
  `fechaContrato` datetime NOT NULL,
  `internet` tinyint(1) DEFAULT NULL,
  `tipoPago` varchar(50) DEFAULT NULL,
  `fechaPago` date DEFAULT NULL,
  `precioTotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `establecimiento` (
  `codigo` varchar(10) NOT NULL,
  `codigoArrendador` varchar(10) NOT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `codigoMunicipio` varchar(5) DEFAULT NULL,
  `localidad` varchar(100) DEFAULT NULL,
  `cp` varchar(20) DEFAULT NULL,
  `pais` varchar(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `establecimiento` VALUES
('0000004063', '0000004794', 'HOTEL', 'Hotel Rural ', 'Calle Mayor 10', '1001', 'Villahotel', '12345', 'ESP');

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `operaciones_ses` (
  `idOperacion` bigint NOT NULL,
  `idComunicacionSES` bigint NOT NULL,
  `operacion` varchar(30) NOT NULL,
  `http_status` int DEFAULT NULL,
  `ses_codigo` int DEFAULT NULL,
  `ses_descripcion` varchar(255) DEFAULT NULL,
  `request_xml` longtext,
  `response_xml` longtext,
  `resultado_tecnico` varchar(20) DEFAULT NULL,
  `resultado_funcional` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `parte` (
  `idParte` bigint NOT NULL,
  `referenciaContrato` varchar(50) NOT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaEnvio` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `persona` (
  `idPersona` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido1` varchar(50) DEFAULT NULL,
  `apellido2` varchar(50) DEFAULT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `nacionalidad` varchar(70) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `codigoMunicipio` varchar(5) DEFAULT NULL,
  `nombreMunicipio` varchar(100) DEFAULT NULL,
  `localidad` varchar(100) DEFAULT NULL,
  `cp` varchar(20) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `tipoDocumento` varchar(20) DEFAULT NULL,
  `documento` varchar(15) DEFAULT NULL,
  `soporteDocumento` varchar(9) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) DEFAULT NULL,
  `tokenable_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `token` varchar(64) DEFAULT NULL,
  `abilities` text,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `reserva` (
  `idReserva` int NOT NULL,
  `idPersonaTitular` int NOT NULL,
  `codigoEstablecimiento` varchar(10) NOT NULL,
  `numPersonas` int NOT NULL,
  `numHabitaciones` int NOT NULL,
  `fechaEntrada` date NOT NULL,
  `fechaSalida` date NOT NULL,
  `estado` varchar(20) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `idPersona` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `viajero_parte` (
  `id` bigint NOT NULL,
  `idParte` bigint NOT NULL,
  `idPersona` int NOT NULL,
  `rol` varchar(2) NOT NULL,
  `parentesco` varchar(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;