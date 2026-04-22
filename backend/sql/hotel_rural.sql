START TRANSACTION;

CREATE TABLE `administrador` (
  `idUsuario` int NOT NULL,
  `userName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `arrendador` (
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido1` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido2` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoDocumento` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `arrendador` VALUES
('0000004794', 'ARRE', 'Elena', 'Serrano', 'Castro', 'DNI', '50093052H');

CREATE TABLE `comunicaciones_ses` (
  `idComunicacionSES` bigint NOT NULL,
  `referenciaContrato` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `idReserva` int DEFAULT NULL,
  `idParte` bigint DEFAULT NULL,
  `tipo_comunicacion` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_lote` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_comunicacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_ses` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_estado` int DEFAULT NULL,
  `descripcion_estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anulada` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_peticion` datetime DEFAULT NULL,
  `fecha_procesamiento` datetime DEFAULT NULL,
  `codigo_arrendador` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aplicacion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
);

CREATE TABLE `contrato` (
  `referencia` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `idReserva` int NOT NULL,
  `fechaContrato` datetime NOT NULL,
  `internet` tinyint(1) DEFAULT NULL,
  `tipoPago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaPago` date DEFAULT NULL,
  `precioTotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `establecimiento` (
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigoArrendador` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigoMunicipio` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `localidad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `establecimiento` VALUES
('0000004063', '0000004794', 'HOTEL', 'Hotel Rural ', 'Calle Mayor 10', '1001', 'Villahotel', '12345', 'ESP');

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `operaciones_ses` (
  `idOperacion` bigint NOT NULL,
  `idComunicacionSES` bigint NOT NULL,
  `operacion` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `http_status` int DEFAULT NULL,
  `ses_codigo` int DEFAULT NULL,
  `ses_descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_xml` longtext COLLATE utf8mb4_unicode_ci,
  `response_xml` longtext COLLATE utf8mb4_unicode_ci,
  `resultado_tecnico` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultado_funcional` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `parte` (
  `idParte` bigint NOT NULL,
  `referenciaContrato` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaEnvio` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `persona` (
  `idPersona` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `persona` VALUES
(19, 'GUILLERMO ROBERTO', 'NIEBLA', 'PINCAY', '2000-09-04', 'ESP', 'Av. del Euro', '28079', NULL, NULL, '28054', '603192023', 'nieblarobertguillermo@gmail.com', 'DNI', '54882182L', 'aa3333');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `reserva` VALUES
(12, 19, '0000004063', 1, 1, '2026-04-27', '2026-05-01', 'pendiente', '2026-04-21 11:40:51', '2026-04-21 11:40:51');

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `idPersona` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` VALUES
(10, 19, 'nieblarobertguillermo@gmail.com', '$2y$12$FC2k2kdA00iZDPuEsdZ.R.t/SCgjnJ/OJtnUEiJAqwUcLpbi3w/.K', NULL, '2026-04-21 11:39:01', '2026-04-21 11:39:01');

COMMIT;