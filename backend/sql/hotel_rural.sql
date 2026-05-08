
CREATE DATABASE IF NOT EXISTS hotel_rural;
USE hotel_rural;
START TRANSACTION;


CREATE TABLE `arrendador` (
  `codigo` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido1` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido2` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoDocumento` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO `arrendador` (`codigo`, `tipo`, `nombre`, `apellido1`, `apellido2`, `tipoDocumento`, `documento`) VALUES
('0000004794', 'ARRE', 'Elena', 'Serrano', 'Castro', 'DNI', '50093052H');



CREATE TABLE `bloqueo_fechas` (
  `idBloqueo` int NOT NULL,
  `idHabitacion` int DEFAULT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date NOT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO `bloqueo_fechas` (`idBloqueo`, `idHabitacion`, `codigoEstablecimiento`, `fechaInicio`, `fechaFin`, `motivo`, `createdAt`) VALUES
(1, 1, '0000004063', '2026-05-25', '2026-05-28', 'Vacaciones', '2026-05-07 11:32:58');



CREATE TABLE `comunicaciones_ses` (
  `idComunicacionSES` bigint NOT NULL,
  `referenciaContrato` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `idReserva` int DEFAULT NULL,
  `idParte` bigint DEFAULT NULL,
  `tipo_comunicacion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_lote` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_comunicacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_ses` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_estado` int DEFAULT NULL,
  `descripcion_estado` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anulada` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_peticion` datetime DEFAULT NULL,
  `fecha_procesamiento` datetime DEFAULT NULL,
  `codigo_arrendador` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aplicacion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `contrato` (
  `referencia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `idReserva` int NOT NULL,
  `fechaContrato` datetime NOT NULL,
  `estado` enum('activo','cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `internet` tinyint(1) DEFAULT NULL,
  `tipoPago` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaPago` date DEFAULT NULL,
  `precioTotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `establecimiento` (
  `codigoEstablecimiento` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigoArrendador` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigoMunicipio` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `localidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO `establecimiento` (`codigoEstablecimiento`, `codigoArrendador`, `tipo`, `nombre`, `direccion`, `codigoMunicipio`, `localidad`, `cp`, `pais`) VALUES
('0000004063', '0000004794', 'HOTEL', 'Hotel Rural ', 'Calle Mayor 10', '1001', 'Villahotel', '12345', 'ESP');



CREATE TABLE `habitacion` (
  `idHabitacion` int NOT NULL,
  `codigoEstablecimiento` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidadMaxima` int NOT NULL DEFAULT '3'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO `habitacion` (`idHabitacion`, `codigoEstablecimiento`, `nombre`, `capacidadMaxima`) VALUES
(1, '0000004063', 'Habitación 1', 3),
(2, '0000004063', 'Habitación 2', 3);



CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `operaciones_ses` (
  `idOperacion` bigint NOT NULL,
  `idComunicacionSES` bigint NOT NULL,
  `operacion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `http_status` int DEFAULT NULL,
  `ses_codigo` int DEFAULT NULL,
  `ses_descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_xml` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `response_xml` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `resultado_tecnico` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultado_funcional` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `parte` (
  `idParte` bigint NOT NULL,
  `referenciaContrato` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaEnvio` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `persona` (
  `idPersona` int NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido1` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido2` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `nacionalidad` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigoMunicipio` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombreMunicipio` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `localidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoDocumento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soporteDocumento` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokenable_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `precio_habitacion` (
  `idPrecio` int NOT NULL,
  `idHabitacion` int NOT NULL,
  `idTemporada` int NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `precio_habitacion` (`idPrecio`, `idHabitacion`, `idTemporada`, `precio`) VALUES
(1, 1, 1, 80.00),
(2, 1, 2, 75.00),
(3, 2, 1, 70.00),
(4, 2, 2, 65.00);



CREATE TABLE `reserva` (
  `idReserva` int NOT NULL,
  `idPersonaTitular` int NOT NULL,
  `codigoEstablecimiento` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaEntrada` date NOT NULL,
  `fechaSalida` date NOT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `solicitud_cancelacion` tinyint(1) NOT NULL DEFAULT '0',
  `datos_modificacion` json DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `reserva_habitacion` (
  `idReserva` int NOT NULL,
  `idHabitacion` int NOT NULL,
  `numPersonas` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `temporada` (
  `idTemporada` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO `temporada` (`idTemporada`, `nombre`, `fechaInicio`, `fechaFin`) VALUES
(1, 'TA', '2026-07-01', '2026-09-15'),
(2, 'TB', '2026-01-01', '2026-06-30'),
(3, 'TB', '2026-09-16', '2026-12-31');



CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `idPersona` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `rol` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `viajero_parte` (
  `id` bigint NOT NULL,
  `idParte` bigint NOT NULL,
  `idPersona` int NOT NULL,
  `rol` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentesco` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE `arrendador`
  ADD PRIMARY KEY (`codigo`),
  ADD UNIQUE KEY `uk_arrendador_documento` (`documento`);


ALTER TABLE `bloqueo_fechas`
  ADD PRIMARY KEY (`idBloqueo`),
  ADD KEY `fk_bloqueo_habitacion` (`idHabitacion`);


ALTER TABLE `comunicaciones_ses`
  ADD PRIMARY KEY (`idComunicacionSES`),
  ADD KEY `idx_comses_contrato` (`referenciaContrato`),
  ADD KEY `idx_comses_reserva` (`idReserva`),
  ADD KEY `idx_comses_parte` (`idParte`),
  ADD KEY `idx_comses_lote` (`codigo_lote`),
  ADD KEY `idx_comses_codigo_com` (`codigo_comunicacion`),
  ADD KEY `idx_comses_estado` (`estado_ses`);


ALTER TABLE `contrato`
  ADD PRIMARY KEY (`referencia`),
  ADD UNIQUE KEY `uk_contrato_reserva` (`idReserva`);


ALTER TABLE `establecimiento`
  ADD PRIMARY KEY (`codigoEstablecimiento`),
  ADD KEY `idx_establecimiento_arrendador` (`codigoArrendador`);


ALTER TABLE `habitacion`
  ADD PRIMARY KEY (`idHabitacion`),
  ADD KEY `fk_habitacion_establecimiento` (`codigoEstablecimiento`);


ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `operaciones_ses`
  ADD PRIMARY KEY (`idOperacion`),
  ADD KEY `idx_opses_comunicacion` (`idComunicacionSES`),
  ADD KEY `idx_opses_operacion_fecha` (`operacion`,`created_at`),
  ADD KEY `idx_opses_ses_codigo` (`ses_codigo`);


ALTER TABLE `parte`
  ADD PRIMARY KEY (`idParte`),
  ADD KEY `idx_parte_contrato` (`referenciaContrato`);


ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);


ALTER TABLE `persona`
  ADD PRIMARY KEY (`idPersona`),
  ADD KEY `idx_persona_documento` (`documento`);


ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `precio_habitacion`
  ADD PRIMARY KEY (`idPrecio`),
  ADD KEY `fk_ph_habitacion` (`idHabitacion`),
  ADD KEY `fk_ph_temporada` (`idTemporada`);


ALTER TABLE `reserva`
  ADD PRIMARY KEY (`idReserva`),
  ADD KEY `idx_reserva_persona` (`idPersonaTitular`),
  ADD KEY `idx_reserva_establecimiento` (`codigoEstablecimiento`);


ALTER TABLE `reserva_habitacion`
  ADD PRIMARY KEY (`idReserva`,`idHabitacion`),
  ADD KEY `fk_rh_habitacion` (`idHabitacion`);


ALTER TABLE `temporada`
  ADD PRIMARY KEY (`idTemporada`);


ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_persona` (`idPersona`);


ALTER TABLE `viajero_parte`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_viajero_parte_persona_rol` (`idParte`,`idPersona`,`rol`),
  ADD KEY `idx_viajero_parte_parte` (`idParte`),
  ADD KEY `idx_viajero_parte_persona` (`idPersona`);


ALTER TABLE `bloqueo_fechas`
  MODIFY `idBloqueo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;


ALTER TABLE `comunicaciones_ses`
  MODIFY `idComunicacionSES` bigint NOT NULL AUTO_INCREMENT;


ALTER TABLE `habitacion`
  MODIFY `idHabitacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;


ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;


ALTER TABLE `operaciones_ses`
  MODIFY `idOperacion` bigint NOT NULL AUTO_INCREMENT;


ALTER TABLE `parte`
  MODIFY `idParte` bigint NOT NULL AUTO_INCREMENT;


ALTER TABLE `persona`
  MODIFY `idPersona` int NOT NULL AUTO_INCREMENT;


ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;


ALTER TABLE `precio_habitacion`
  MODIFY `idPrecio` int NOT NULL AUTO_INCREMENT;


ALTER TABLE `reserva`
  MODIFY `idReserva` int NOT NULL AUTO_INCREMENT;


ALTER TABLE `temporada`
  MODIFY `idTemporada` int NOT NULL AUTO_INCREMENT;


ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;


ALTER TABLE `viajero_parte`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;


ALTER TABLE `bloqueo_fechas`
  ADD CONSTRAINT `fk_bloqueo_establecimiento` FOREIGN KEY (`codigoEstablecimiento`) REFERENCES `establecimiento` (`codigoEstablecimiento`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bloqueo_habitacion` FOREIGN KEY (`idHabitacion`) REFERENCES `habitacion` (`idHabitacion`) ON DELETE CASCADE;


ALTER TABLE `comunicaciones_ses`
  ADD CONSTRAINT `fk_comses_contrato` FOREIGN KEY (`referenciaContrato`) REFERENCES `contrato` (`referencia`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comses_parte` FOREIGN KEY (`idParte`) REFERENCES `parte` (`idParte`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comses_reserva` FOREIGN KEY (`idReserva`) REFERENCES `reserva` (`idReserva`) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE `contrato`
  ADD CONSTRAINT `fk_contrato_reserva` FOREIGN KEY (`idReserva`) REFERENCES `reserva` (`idReserva`) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE `establecimiento`
  ADD CONSTRAINT `fk_establecimiento_arrendador` FOREIGN KEY (`codigoArrendador`) REFERENCES `arrendador` (`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE `habitacion`
  ADD CONSTRAINT `fk_habitacion_establecimiento` FOREIGN KEY (`codigoEstablecimiento`) REFERENCES `establecimiento` (`codigoEstablecimiento`) ON DELETE CASCADE;


ALTER TABLE `operaciones_ses`
  ADD CONSTRAINT `fk_opses_comses` FOREIGN KEY (`idComunicacionSES`) REFERENCES `comunicaciones_ses` (`idComunicacionSES`) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE `parte`
  ADD CONSTRAINT `fk_parte_contrato` FOREIGN KEY (`referenciaContrato`) REFERENCES `contrato` (`referencia`) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE `precio_habitacion`
  ADD CONSTRAINT `fk_ph_habitacion` FOREIGN KEY (`idHabitacion`) REFERENCES `habitacion` (`idHabitacion`),
  ADD CONSTRAINT `fk_ph_temporada` FOREIGN KEY (`idTemporada`) REFERENCES `temporada` (`idTemporada`);


ALTER TABLE `reserva`
  ADD CONSTRAINT `fk_reserva_establecimiento` FOREIGN KEY (`codigoEstablecimiento`) REFERENCES `establecimiento` (`codigoEstablecimiento`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reserva_persona` FOREIGN KEY (`idPersonaTitular`) REFERENCES `persona` (`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE `reserva_habitacion`
  ADD CONSTRAINT `fk_rh_habitacion` FOREIGN KEY (`idHabitacion`) REFERENCES `habitacion` (`idHabitacion`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_rh_reserva` FOREIGN KEY (`idReserva`) REFERENCES `reserva` (`idReserva`) ON DELETE CASCADE;


ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE `viajero_parte`
  ADD CONSTRAINT `fk_viajero_parte_parte` FOREIGN KEY (`idParte`) REFERENCES `parte` (`idParte`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_viajero_parte_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;


