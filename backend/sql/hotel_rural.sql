
START TRANSACTION;


--
-- Database: `hotel_rural`
--

-- --------------------------------------------------------

--
-- Table structure for table `administrador`
--

CREATE TABLE `administrador` (
  `idUsuario` int NOT NULL,
  `userName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `arrendador`
--

CREATE TABLE `arrendador` (
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido1` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido2` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoDocumento` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `arrendador`
--

INSERT INTO `arrendador` (`codigo`, `tipo`, `nombre`, `apellido1`, `apellido2`, `tipoDocumento`, `documento`) VALUES
('0000004794', 'ARRE', 'Elena', 'Serrano', 'Castro', 'DNI', '50093052H');

-- --------------------------------------------------------

--
-- Table structure for table `comunicaciones_ses`
--

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
) ;

-- --------------------------------------------------------

--
-- Table structure for table `contrato`
--

CREATE TABLE `contrato` (
  `referencia` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `idReserva` int NOT NULL,
  `fechaContrato` datetime NOT NULL,
  `internet` tinyint(1) DEFAULT NULL,
  `tipoPago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaPago` date DEFAULT NULL,
  `precioTotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `establecimiento`
--

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

--
-- Dumping data for table `establecimiento`
--

INSERT INTO `establecimiento` (`codigo`, `codigoArrendador`, `tipo`, `nombre`, `direccion`, `codigoMunicipio`, `localidad`, `cp`, `pais`) VALUES
('0000004063', '0000004794', 'HOTEL', 'Hotel Rural ', 'Calle Mayor 10', '1001', 'Villahotel', '12345', 'ESP');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `operaciones_ses`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `parte`
--

CREATE TABLE `parte` (
  `idParte` bigint NOT NULL,
  `referenciaContrato` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaEnvio` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `persona`
--

CREATE TABLE `persona` (
  `idPersona` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido1` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido2` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaNacimiento` date DEFAULT NULL,
  `nacionalidad` varchar(70) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigoMunicipio` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombreMunicipio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `localidad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoDocumento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soporteDocumento` varchar(9) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `persona`
--

INSERT INTO `persona` (`idPersona`, `nombre`, `apellido1`, `apellido2`, `fechaNacimiento`, `nacionalidad`, `direccion`, `codigoMunicipio`, `nombreMunicipio`, `localidad`, `cp`, `telefono`, `email`, `tipoDocumento`, `documento`, `soporteDocumento`) VALUES
(19, 'GUILLERMO ROBERTO', 'NIEBLA', 'PINCAY', '2000-09-04', 'ESP', 'Av. del Euro', '28079', NULL, NULL, '28054', '603192023', 'nieblarobertguillermo@gmail.com', 'DNI', '54882182L', 'aa3333');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

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

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 5, 'auth_token', 'b3a22abd5de23211fb3c07a1c3fbf49f4c5e9911c29098ddc0850ffcd660250b', '[\"*\"]', NULL, NULL, '2026-04-16 12:18:50', '2026-04-16 12:18:50'),
(3, 'App\\Models\\User', 5, 'auth_token', '98de869dfb2be7f9d1e6afc0f7526166f2d05dd76dfc5a7e8abc773d5e3469c1', '[\"*\"]', NULL, NULL, '2026-04-16 12:23:55', '2026-04-16 12:23:55'),
(4, 'App\\Models\\User', 5, 'auth_token', 'bd6743660156ed53ddc87460e737c6d19179515e3f7cdc52a008abfb2c9ae614', '[\"*\"]', NULL, NULL, '2026-04-16 12:25:30', '2026-04-16 12:25:30'),
(5, 'App\\Models\\User', 6, 'auth_token', '5e4bb7815cf2ec24b3ac048a058538e80ee9754003dea6a583feb3cc106fc2dc', '[\"*\"]', NULL, NULL, '2026-04-16 12:29:28', '2026-04-16 12:29:28'),
(6, 'App\\Models\\User', 6, 'auth_token', 'd29dd4b8a5e7e9afa3f359871eab43933c1468b7f81f6d9d4485594323020c3c', '[\"*\"]', NULL, NULL, '2026-04-16 12:38:37', '2026-04-16 12:38:37'),
(7, 'App\\Models\\User', 6, 'auth_token', 'ae969c8fe3bf3181dad5dc5e9d616322735f65e5585aae5baab326ac9cce38b7', '[\"*\"]', NULL, NULL, '2026-04-16 12:44:01', '2026-04-16 12:44:01'),
(8, 'App\\Models\\User', 6, 'auth_token', '31b91648fc962a1d655f40b7c56738da451e70b45013ae521598c35d0c9d8dc5', '[\"*\"]', NULL, NULL, '2026-04-16 12:49:57', '2026-04-16 12:49:57'),
(9, 'App\\Models\\User', 6, 'auth_token', '67b239e9dfbbce7632163ef7c1a1dd21292d0ead1dfad2af7193d26c77bc41f6', '[\"*\"]', NULL, NULL, '2026-04-16 12:52:41', '2026-04-16 12:52:41'),
(10, 'App\\Models\\User', 6, 'auth_token', '1eb906aa5620489518dc0c22b82a85bcff03b6821bed1894af47eb8621118c25', '[\"*\"]', NULL, NULL, '2026-04-16 12:58:13', '2026-04-16 12:58:13'),
(11, 'App\\Models\\User', 6, 'auth_token', '10951173383366155933e7c9bf0bc456c683b6bb47e927f3d08d33c732f790a9', '[\"*\"]', NULL, NULL, '2026-04-16 12:59:29', '2026-04-16 12:59:29'),
(12, 'App\\Models\\User', 6, 'auth_token', '96adb3a6239fc058e3540b0ad44218e6a9119d80f5ead2eef3d13d1f49e067dc', '[\"*\"]', NULL, NULL, '2026-04-16 13:05:57', '2026-04-16 13:05:57'),
(13, 'App\\Models\\User', 6, 'auth_token', '60c3fcdc9e9e469efb79d02dc582cf309d0e8ce3a0fa986afb8cf7696efdf935', '[\"*\"]', NULL, NULL, '2026-04-16 22:23:54', '2026-04-16 22:23:54'),
(14, 'App\\Models\\User', 7, 'auth_token', 'c3bf53e930d3197ec32572206b73f23e6ec1e10ec184ae22fdb6297de8fa7748', '[\"*\"]', NULL, NULL, '2026-04-16 23:58:02', '2026-04-16 23:58:02'),
(15, 'App\\Models\\User', 9, 'auth_token', 'b4f2d8060c03a4eff89d48b03c89dc2532406b09248e7238fc1bf53673ac21bd', '[\"*\"]', NULL, NULL, '2026-04-17 11:59:11', '2026-04-17 11:59:11'),
(16, 'App\\Models\\User', 9, 'auth_token', 'fc25024ce58bf217da65c09e27bf83f6f475299b4b6b455410fecaecc4b4bf8b', '[\"*\"]', '2026-04-21 11:26:46', NULL, '2026-04-17 12:09:44', '2026-04-21 11:26:46'),
(17, 'App\\Models\\User', 9, 'auth_token', '29cde815a91a915a18e12f5e636b44767bf32b2a05be6468b39873395dd75647', '[\"*\"]', NULL, NULL, '2026-04-21 11:35:55', '2026-04-21 11:35:55'),
(18, 'App\\Models\\User', 10, 'auth_token', 'a1a65735a0549d27e1bbba89143b1aa01a743c987de0e5337edacd683d13ba07', '[\"*\"]', '2026-04-22 09:53:14', NULL, '2026-04-21 11:39:20', '2026-04-22 09:53:14');

-- --------------------------------------------------------

--
-- Table structure for table `reserva`
--

CREATE TABLE `reserva` (
  `idReserva` int NOT NULL,
  `idPersonaTitular` int NOT NULL,
  `codigoEstablecimiento` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numPersonas` int NOT NULL,
  `numHabitaciones` int NOT NULL,
  `fechaEntrada` date NOT NULL,
  `fechaSalida` date NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reserva`
--

INSERT INTO `reserva` (`idReserva`, `idPersonaTitular`, `codigoEstablecimiento`, `numPersonas`, `numHabitaciones`, `fechaEntrada`, `fechaSalida`, `estado`, `createdAt`, `updatedAt`) VALUES
(12, 19, '0000004063', 1, 1, '2026-04-27', '2026-05-01', 'pendiente', '2026-04-21 11:40:51', '2026-04-21 11:40:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `idPersona` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `idPersona`, `email`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(10, 19, 'nieblarobertguillermo@gmail.com', '$2y$12$FC2k2kdA00iZDPuEsdZ.R.t/SCgjnJ/OJtnUEiJAqwUcLpbi3w/.K', NULL, '2026-04-21 11:39:01', '2026-04-21 11:39:01');

-- --------------------------------------------------------

--
-- Table structure for table `viajero_parte`
--

CREATE TABLE `viajero_parte` (
  `id` bigint NOT NULL,
  `idParte` bigint NOT NULL,
  `idPersona` int NOT NULL,
  `rol` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentesco` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `uk_administrador_userName` (`userName`),
  ADD UNIQUE KEY `uk_administrador_email` (`email`);

--
-- Indexes for table `arrendador`
--
ALTER TABLE `arrendador`
  ADD PRIMARY KEY (`codigo`),
  ADD UNIQUE KEY `uk_arrendador_documento` (`documento`);

--
-- Indexes for table `comunicaciones_ses`
--
ALTER TABLE `comunicaciones_ses`
  ADD PRIMARY KEY (`idComunicacionSES`),
  ADD KEY `idx_comses_contrato` (`referenciaContrato`),
  ADD KEY `idx_comses_reserva` (`idReserva`),
  ADD KEY `idx_comses_parte` (`idParte`),
  ADD KEY `idx_comses_lote` (`codigo_lote`),
  ADD KEY `idx_comses_codigo_com` (`codigo_comunicacion`),
  ADD KEY `idx_comses_estado` (`estado_ses`);

--
-- Indexes for table `contrato`
--
ALTER TABLE `contrato`
  ADD PRIMARY KEY (`referencia`),
  ADD UNIQUE KEY `uk_contrato_reserva` (`idReserva`);

--
-- Indexes for table `establecimiento`
--
ALTER TABLE `establecimiento`
  ADD PRIMARY KEY (`codigo`),
  ADD KEY `idx_establecimiento_arrendador` (`codigoArrendador`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `operaciones_ses`
--
ALTER TABLE `operaciones_ses`
  ADD PRIMARY KEY (`idOperacion`),
  ADD KEY `idx_opses_comunicacion` (`idComunicacionSES`),
  ADD KEY `idx_opses_operacion_fecha` (`operacion`,`created_at`),
  ADD KEY `idx_opses_ses_codigo` (`ses_codigo`);

--
-- Indexes for table `parte`
--
ALTER TABLE `parte`
  ADD PRIMARY KEY (`idParte`),
  ADD KEY `idx_parte_contrato` (`referenciaContrato`);

--
-- Indexes for table `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`idPersona`),
  ADD KEY `idx_persona_documento` (`documento`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`idReserva`),
  ADD KEY `idx_reserva_persona` (`idPersonaTitular`),
  ADD KEY `idx_reserva_establecimiento` (`codigoEstablecimiento`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_persona` (`idPersona`);

--
-- Indexes for table `viajero_parte`
--
ALTER TABLE `viajero_parte`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_viajero_parte_persona_rol` (`idParte`,`idPersona`,`rol`),
  ADD KEY `idx_viajero_parte_parte` (`idParte`),
  ADD KEY `idx_viajero_parte_persona` (`idPersona`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `administrador`
--
ALTER TABLE `administrador`
  MODIFY `idUsuario` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comunicaciones_ses`
--
ALTER TABLE `comunicaciones_ses`
  MODIFY `idComunicacionSES` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `operaciones_ses`
--
ALTER TABLE `operaciones_ses`
  MODIFY `idOperacion` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `parte`
--
ALTER TABLE `parte`
  MODIFY `idParte` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `persona`
--
ALTER TABLE `persona`
  MODIFY `idPersona` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reserva`
--
ALTER TABLE `reserva`
  MODIFY `idReserva` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `viajero_parte`
--
ALTER TABLE `viajero_parte`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comunicaciones_ses`
--
ALTER TABLE `comunicaciones_ses`
  ADD CONSTRAINT `fk_comses_contrato` FOREIGN KEY (`referenciaContrato`) REFERENCES `contrato` (`referencia`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comses_parte` FOREIGN KEY (`idParte`) REFERENCES `parte` (`idParte`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comses_reserva` FOREIGN KEY (`idReserva`) REFERENCES `reserva` (`idReserva`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `contrato`
--
ALTER TABLE `contrato`
  ADD CONSTRAINT `fk_contrato_reserva` FOREIGN KEY (`idReserva`) REFERENCES `reserva` (`idReserva`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `establecimiento`
--
ALTER TABLE `establecimiento`
  ADD CONSTRAINT `fk_establecimiento_arrendador` FOREIGN KEY (`codigoArrendador`) REFERENCES `arrendador` (`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `operaciones_ses`
--
ALTER TABLE `operaciones_ses`
  ADD CONSTRAINT `fk_opses_comses` FOREIGN KEY (`idComunicacionSES`) REFERENCES `comunicaciones_ses` (`idComunicacionSES`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `parte`
--
ALTER TABLE `parte`
  ADD CONSTRAINT `fk_parte_contrato` FOREIGN KEY (`referenciaContrato`) REFERENCES `contrato` (`referencia`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `fk_reserva_establecimiento` FOREIGN KEY (`codigoEstablecimiento`) REFERENCES `establecimiento` (`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reserva_persona` FOREIGN KEY (`idPersonaTitular`) REFERENCES `persona` (`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `viajero_parte`
--
ALTER TABLE `viajero_parte`
  ADD CONSTRAINT `fk_viajero_parte_parte` FOREIGN KEY (`idParte`) REFERENCES `parte` (`idParte`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_viajero_parte_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
