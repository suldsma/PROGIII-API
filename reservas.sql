-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-10-2025 a las 02:45:41
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `reservas`
--
CREATE DATABASE IF NOT EXISTS `reservas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `reservas`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `notificacion_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL COMMENT 'RESERVA_CONFIRMADA, NUEVA_RESERVA, RECORDATORIO_24H, etc.',
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `datos_reserva` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Datos adicionales de la reserva en formato JSON' CHECK (json_valid(`datos_reserva`)),
  `leida` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 = no leída, 1 = leída',
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sistema de notificaciones para usuarios';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `reserva_id` int(11) NOT NULL,
  `fecha_reserva` date NOT NULL,
  `salon_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `turno_id` int(11) NOT NULL,
  `foto_cumpleaniero` varchar(255) DEFAULT NULL,
  `tematica` varchar(255) DEFAULT NULL,
  `importe_salon` decimal(10,2) DEFAULT NULL,
  `importe_total` decimal(10,2) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`reserva_id`, `fecha_reserva`, `salon_id`, `usuario_id`, `turno_id`, `foto_cumpleaniero`, `tematica`, `importe_salon`, `importe_total`, `activo`, `creado`, `modificado`) VALUES
(1, '2025-10-08', 1, 1, 1, NULL, 'Plim plim', NULL, 200000.00, 1, '2025-08-19 22:02:33', '2025-08-19 22:02:33'),
(2, '2025-10-08', 2, 1, 1, NULL, 'Messi', NULL, 100000.00, 1, '2025-08-19 22:03:45', '2025-08-19 22:03:45'),
(3, '2025-10-08', 2, 2, 1, NULL, 'Palermo', NULL, 500000.00, 1, '2025-08-19 22:03:45', '2025-08-19 22:03:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas_servicios`
--

CREATE TABLE `reservas_servicios` (
  `reserva_servicio_id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `importe` decimal(10,2) NOT NULL,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reservas_servicios`
--

INSERT INTO `reservas_servicios` (`reserva_servicio_id`, `reserva_id`, `servicio_id`, `importe`, `creado`, `modificado`) VALUES
(1, 1, 1, 50000.00, '2025-08-19 22:07:31', '2025-08-19 22:07:31'),
(2, 1, 2, 50000.00, '2025-08-19 22:07:31', '2025-08-19 22:07:31'),
(3, 1, 3, 50000.00, '2025-08-19 22:07:31', '2025-08-19 22:07:31'),
(4, 1, 4, 50000.00, '2025-08-19 22:07:31', '2025-08-19 22:07:31'),
(5, 2, 1, 50000.00, '2025-08-19 22:08:08', '2025-08-19 22:08:08'),
(6, 2, 2, 50000.00, '2025-08-19 22:08:08', '2025-08-19 22:08:08'),
(7, 3, 1, 100000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17'),
(8, 3, 2, 100000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17'),
(9, 3, 3, 100000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17'),
(10, 3, 4, 200000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salones`
--

CREATE TABLE `salones` (
  `salon_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `importe` decimal(10,2) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `salones`
--

INSERT INTO `salones` (`salon_id`, `titulo`, `direccion`, `latitud`, `longitud`, `capacidad`, `importe`, `activo`, `creado`, `modificado`) VALUES
(1, 'Principal', 'San Lorenzo 1000', NULL, NULL, 200, 95000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(2, 'Secundario', 'San Lorenzo 1000', NULL, NULL, 70, 7000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(3, 'Cancha Fútbol 5', 'Alberdi 300', NULL, NULL, 50, 150000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(4, 'Maquina de Jugar', 'Perú 50', NULL, NULL, 100, 95000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(5, 'Trampolín Play', 'Belgrano 100', NULL, NULL, 70, 200000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `servicio_id` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `importe` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`servicio_id`, `descripcion`, `importe`, `activo`, `creado`, `modificado`) VALUES
(1, 'Sonido', 18000.50, 1, '2025-08-19 21:47:55', '2025-09-03 20:19:41'),
(2, 'Mesa dulce', 25000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(3, 'Tarjetas de invitación', 5000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(4, 'Mozos', 15000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(5, 'Sala de videojuegos', 15000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(6, 'Mago', 25000.00, 1, '2025-08-20 21:31:00', '2025-08-20 21:31:00'),
(7, 'Cabezones', 80000.00, 1, '2025-08-20 21:31:00', '2025-08-20 21:31:00'),
(8, 'Maquillaje artístico infantil', 1500.00, 1, '2025-08-20 21:31:00', '2025-09-03 15:40:31'),
(9, 'Animacion infantil', 35000.00, 1, '2025-09-03 15:30:34', '2025-09-03 20:22:25'),
(10, 'Nuevo Servicio de Prueba', 25000.50, 1, '2025-09-03 20:03:33', '2025-09-03 20:03:33'),
(11, 'Servicio de Prueba 2', 25000.00, 1, '2025-09-09 10:19:46', '2025-09-09 10:19:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turnos`
--

CREATE TABLE `turnos` (
  `turno_id` int(11) NOT NULL,
  `orden` int(11) NOT NULL,
  `hora_desde` time NOT NULL,
  `hora_hasta` time NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `turnos`
--

INSERT INTO `turnos` (`turno_id`, `orden`, `hora_desde`, `hora_hasta`, `activo`, `creado`, `modificado`) VALUES
(1, 1, '12:00:00', '14:00:00', 1, '2025-08-19 21:44:19', '2025-08-19 21:44:19'),
(2, 2, '15:00:00', '17:00:00', 1, '2025-08-19 21:46:08', '2025-08-19 21:46:08'),
(3, 3, '18:00:00', '20:00:00', 1, '2025-08-19 21:46:08', '2025-08-19 21:46:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasenia` varchar(255) NOT NULL,
  `tipo_usuario` tinyint(4) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`usuario_id`, `nombre`, `apellido`, `nombre_usuario`, `contrasenia`, `tipo_usuario`, `celular`, `foto`, `activo`, `creado`, `modificado`) VALUES
(1, 'Alberto', 'López', 'alblop@correo.com', 'cf584badd07d42dcb8506f8bae32aa96', 3, NULL, NULL, 1, '2025-08-19 21:37:51', '2025-08-19 21:37:51'),
(2, 'Pamela', 'Gómez', 'pamgom@correo.com', '709ee61c97fc261d35aa2295e109b3fb', 3, NULL, NULL, 1, '2025-08-19 21:39:45', '2025-08-19 21:39:45'),
(3, 'Esteban', 'Ciro', 'estcir@correo.com', 'da6541938e9afdcd420d1ccfc7cac2c7', 3, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50'),
(4, 'Oscar', 'Ramírez', 'oscram@correo.com', '0ac879e8785ea5b3da6ff1333d8b0cf2', 1, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50'),
(5, 'Claudia', 'Juárez', 'clajua@correo.com', '4f9dbdcf9259db3fa6a3f6164dd285de', 1, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50'),
(6, 'William', 'Corbalán', 'wilcor@correo.com', 'f68087e72fbdf81b4174fec3676c1790', 2, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50'),
(7, 'Anahí', 'Flores', 'anaflo@correo.com', 'd4e767c916b51b8cc5c909f5435119b1', 2, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50');

--
-- Índices para tablas volcadas
--

ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`notificacion_id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_leida` (`leida`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_creado` (`creado`);

ALTER TABLE `reservas`
  ADD PRIMARY KEY (`reserva_id`),
  ADD KEY `reservas_fk2` (`salon_id`),
  ADD KEY `reservas_fk3` (`usuario_id`),
  ADD KEY `reservas_fk4` (`turno_id`);

ALTER TABLE `reservas_servicios`
  ADD PRIMARY KEY (`reserva_servicio_id`),
  ADD KEY `reservas_servicios_fk1` (`reserva_id`),
  ADD KEY `reservas_servicios_fk2` (`servicio_id`);

ALTER TABLE `salones`
  ADD PRIMARY KEY (`salon_id`);

ALTER TABLE `servicios`
  ADD PRIMARY KEY (`servicio_id`);

ALTER TABLE `turnos`
  ADD PRIMARY KEY (`turno_id`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

ALTER TABLE `notificaciones`
  MODIFY `notificacion_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reservas`
  MODIFY `reserva_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `reservas_servicios`
  MODIFY `reserva_servicio_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `salones`
  MODIFY `salon_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `servicios`
  MODIFY `servicio_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

ALTER TABLE `turnos`
  MODIFY `turno_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_fk1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE;

ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_fk2` FOREIGN KEY (`salon_id`) REFERENCES `salones` (`salon_id`),
  ADD CONSTRAINT `reservas_fk3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`),
  ADD CONSTRAINT `reservas_fk4` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`turno_id`);

ALTER TABLE `reservas_servicios`
  ADD CONSTRAINT `reservas_servicios_fk1` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`reserva_id`),
  ADD CONSTRAINT `reservas_servicios_fk2` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`servicio_id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;