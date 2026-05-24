# Proyecto Intermodular: Reservas Hotel

## Integrantes

* David Gallegos
* Guillermo Niebla

<!-- ![Imagen del Proyecto](ruta/a/tu/imagen.png) -->

El proyecto "Reservas Hotel" es una actualización integral en el apartado visual, estructural y funcional de la web del Hotel Rural el Quintanal. El propósito principal de la aplicación es implementar un sistema de reservas completo donde el cliente puede solicitar y gestionar su estancia. Para apoyar este flujo principal, la plataforma incorpora funciones como el inicio y cierre de sesión, paneles dedicados para usuarios y administradores, y una base de datos centralizada.

---

## Arquitectura y Tecnologías

El proyecto separa claramente sus responsabilidades, combinando herramientas de alto rendimiento para el cliente y un servidor robusto, todo ello empaquetado para funcionar de manera consistente en cualquier máquina.

* **Frontend**: Desarrollado principalmente con Astro 6.3.1 y React 19.2.4. El entorno utiliza Node 22.12.0 y lenguajes como TypeScript, Markdown Extended (MDX) y CSS.
* **Vistas Híbridas (Islas)**: La interfaz integra React dentro de Astro aprovechando la arquitectura de "islas", lo que permite incrustar de forma aislada porciones altamente interactivas (como formularios) dentro de páginas estáticas ultrarrápidas.
* **Backend**: Construido exclusivamente con el framework Laravel y el lenguaje PHP, siguiendo el patrón de diseño Modelo-Vista-Controlador (MVC).
* **Base de Datos**: Se utiliza MySQL para el almacenamiento de datos, junto con phpMyAdmin para la gestión visual.
* **Contenedores**: Toda la infraestructura, base de datos, backend y frontend, está orquestada y aislada utilizando Docker y Docker Compose.

### Bibliotecas y Dependencias

* **Integraciones de Astro**: Astrojs/mdx y auth-astro.
* **Ecosistema React**: React-hook-forms, react-tanstack/react-query, Axios, Lucide-react, react-day-picker y Zod.
* **Utilidades adicionales**: i18n-iso-countries y Date-fns.

---

## Funcionalidades Principales

La aplicación cuenta con las siguientes características operativas para gestionar completamente la interacción entre los clientes y el hotel:

* **Navegación Dinámica**: El menú de la página web cambia automáticamente sus opciones dependiendo de si el usuario ha iniciado sesión o es un visitante anónimo.
* **Sistema de Autenticación**: Incluye registro validado en tiempo real, inicio de sesión protegido con autenticación de doble factor (2FA) por correo electrónico y un flujo seguro para la recuperación de contraseñas.
* **Motor de Reservas y Check-in**: Un formulario interactivo que previene el *overbooking* verificando fechas disponibles y exige a los viajeros los datos legales estrictos requeridos por la normativa de la Secretaría de Estado de Seguridad (SES).
* **Panel de Usuario (Dashboard)**: Un espacio privado donde el cliente puede consultar el estado de su reserva, notificar transferencias bancarias, solicitar modificaciones y realizar el check-in online de sus acompañantes.
* **Panel de Administración**: Una interfaz exclusiva para la gerencia que permite revisar pagos, aprobar reservas, registrar clientes de forma manual (walk-in), bloquear fechas por mantenimiento y supervisar la sincronización de datos legales con la consola SES.

---

Enlace a la web desplegada en EC AWS → <http://35.180.46.142:4321/>
