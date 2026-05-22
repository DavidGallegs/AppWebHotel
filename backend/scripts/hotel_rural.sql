
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

INSERT INTO `arrendador` (`codigo`, `tipo`, `nombre`, `apellido1`, `apellido2`, `tipoDocumento`, `documento`) VALUES
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
  `fechaContrato` date DEFAULT NULL,
  `fechaEntrada` datetime DEFAULT NULL,
  `fechaSalida` datetime DEFAULT NULL,
  `numPersonas` int DEFAULT NULL,
  `numHabitaciones` int DEFAULT NULL,
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

INSERT INTO `establecimiento` (`codigo`, `codigoArrendador`, `tipo`, `nombre`, `direccion`, `codigoMunicipio`, `localidad`, `cp`, `pais`) VALUES
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
  `apellido1` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido2` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `nacionalidad` varchar(70) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigoMunicipio` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombreMunicipio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `localidad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoDocumento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soporteDocumento` varchar(9) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokenable_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reserva` (
  `idReserva` int NOT NULL,
  `idPersonaTitular` int NOT NULL,
  `codigoEstablecimiento` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `idPersona` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `viajero_parte` (
  `id` bigint NOT NULL,
  `idParte` bigint NOT NULL,
  `idPersona` int NOT NULL,
  `rol` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentesco` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `administrador`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `uk_administrador_userName` (`userName`),
  ADD UNIQUE KEY `uk_administrador_email` (`email`);

ALTER TABLE `arrendador`
  ADD PRIMARY KEY (`codigo`),
  ADD UNIQUE KEY `uk_arrendador_documento` (`documento`);

ALTER TABLE `comunicaciones_ses`
  ADD PRIMARY KEY (`idComunicacionSES`);

ALTER TABLE `contrato`
  ADD PRIMARY KEY (`referencia`),
  ADD UNIQUE KEY `uk_contrato_reserva` (`idReserva`);

ALTER TABLE `establecimiento`
  ADD PRIMARY KEY (`codigo`);

ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `operaciones_ses`
  ADD PRIMARY KEY (`idOperacion`);

ALTER TABLE `parte`
  ADD PRIMARY KEY (`idParte`);

ALTER TABLE `persona`
  ADD PRIMARY KEY (`idPersona`);

ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `reserva`
  ADD PRIMARY KEY (`idReserva`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `viajero_parte`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `administrador`
  MODIFY `idUsuario` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `comunicaciones_ses`
  MODIFY `idComunicacionSES` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `operaciones_ses`
  MODIFY `idOperacion` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `parte`
  MODIFY `idParte` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `persona`
  MODIFY `idPersona` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `reserva`
  MODIFY `idReserva` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `viajero_parte`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `comunicaciones_ses`
  ADD CONSTRAINT `fk_comses_contrato` FOREIGN KEY (`referenciaContrato`) REFERENCES `contrato` (`referencia`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comunicaciones_ses`
  ADD CONSTRAINT `fk_comses_parte` FOREIGN KEY (`idParte`) REFERENCES `parte` (`idParte`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comunicaciones_ses`
  ADD CONSTRAINT `fk_comses_reserva` FOREIGN KEY (`idReserva`) REFERENCES `reserva` (`idReserva`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `contrato`
  ADD CONSTRAINT `fk_contrato_reserva` FOREIGN KEY (`idReserva`) REFERENCES `reserva` (`idReserva`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `establecimiento`
  ADD CONSTRAINT `fk_establecimiento_arrendador` FOREIGN KEY (`codigoArrendador`) REFERENCES `arrendador` (`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `operaciones_ses`
  ADD CONSTRAINT `fk_opses_comses` FOREIGN KEY (`idComunicacionSES`) REFERENCES `comunicaciones_ses` (`idComunicacionSES`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `parte`
  ADD CONSTRAINT `fk_parte_contrato` FOREIGN KEY (`referenciaContrato`) REFERENCES `contrato` (`referencia`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reserva`
  ADD CONSTRAINT `fk_reserva_establecimiento` FOREIGN KEY (`codigoEstablecimiento`) REFERENCES `establecimiento` (`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `reserva`
  ADD CONSTRAINT `fk_reserva_persona` FOREIGN KEY (`idPersonaTitular`) REFERENCES `persona` (`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`) ON DELETE CASCADE;

ALTER TABLE `viajero_parte`
  ADD CONSTRAINT `fk_viajero_parte_parte` FOREIGN KEY (`idParte`) REFERENCES `parte` (`idParte`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `viajero_parte`
  ADD CONSTRAINT `fk_viajero_parte_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;