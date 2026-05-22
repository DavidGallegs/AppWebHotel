# MODELADO DE DATOS

~~~sql
// ENTIDADES FÍSICAS Y ALOJAMIENTO
Table arrendador {
  codigoArrendador varchar [primary key]
  tipo varchar
  nombre varchar
  apellido1 varchar
  apellido2 varchar
  tipoDocumento varchar
  documento varchar
}

Table establecimiento {
  codigoEstablecimiento varchar [primary key]
  codigoArrendador varchar
  tipo varchar
  nombre varchar
  direccion varchar
  codigoMunicipio varchar
  localidad varchar
  cp varchar
  pais varchar
}

Table habitacion {
  idHabitacion int [primary key]
  codigoEstablecimiento varchar
  nombre varchar
  capacidadMaxima int
}

Table bloqueo_fechas {
  idBloqueo int [primary key]
  idHabitacion int
  fechaInicio date
  fechaFin date
  motivo varchar
  createdAt datetime
}

Table temporada {
  idTemporada int [primary key]
  nombre varchar
  fechaInicio date
  fechaFin date
}

Table precio_habitacion {
  idPrecio int [primary key]
  idHabitacion int
  idTemporada int
  precio decimal
}

// USUARIOS Y PERSONAS
Table persona {
  idPersona int [primary key]
  nombre varchar
  apellido1 varchar
  apellido2 varchar
  fechaNacimiento date
  nacionalidad varchar
  direccion varchar
  codigoMunicipio varchar
  nombreMunicipio varchar
  localidad varchar
  cp varchar
  telefono varchar
  email varchar
  tipoDocumento varchar
  documento varchar
  soporteDocumento varchar
}

Table users {
  id bigint [primary key]
  idPersona int
  email varchar
  password varchar
  remember_token varchar
  created_at timestamp
  updated_at timestamp
  rol enum
}

// RESERVAS
Table reserva {
  idReserva int [primary key]
  idPersonaTitular int
  codigoEstablecimiento varchar
  fechaEntrada date
  fechaSalida date
  estado enum
  solicitud_cancelacion boolean
  solicitud_modificacion boolean
  datos_modificacion json
  estado_pago enum
  createdAt datetime
  updatedAt datetime
}

Table reserva_habitacion {
  idReserva int
  idHabitacion int
  numPersonas int
  indexes {
    (idReserva, idHabitacion) [pk]
  }
}

// CONTRATOS Y PARTES (LEGAL)
Table contrato {
  referencia varchar [primary key]
  idReserva int
  fechaContrato datetime
  estado enum
  internet boolean
  tipoPago varchar
  fechaPago date
  precioTotal decimal
}

Table parte {
  idParte bigint [primary key]
  referenciaContrato varchar
  estado varchar
  fechaCreacion datetime
  fechaEnvio datetime
  createdAt datetime
  updatedAt datetime
}

Table viajero_parte {
  id bigint [primary key]
  idParte bigint
  idPersona int
  rol varchar
  parentesco varchar
}

// INTEGRACIÓN SES
Table comunicaciones_ses {
  idComunicacionSES bigint [primary key]
  referenciaContrato varchar
  idReserva int
  idParte bigint
  tipo_comunicacion varchar
  codigo_lote varchar
  codigo_comunicacion varchar
  estado_ses varchar
  codigo_estado int
  descripcion_estado varchar
  anulada boolean
  fecha_peticion datetime
  fecha_procesamiento datetime
  codigo_arrendador varchar
  aplicacion varchar
  created_at datetime
  updated_at datetime
}

Table operaciones_ses {
  idOperacion bigint [primary key]
  idComunicacionSES bigint
  operacion varchar
  http_status int
  ses_codigo int
  ses_descripcion varchar
  request_xml longtext
  response_xml longtext
  resultado_tecnico varchar
  resultado_funcional varchar
  created_at datetime
}

// RELACIONES (CLAVES FORÁNEAS)
Ref: establecimiento.codigoArrendador > arrendador.codigoArrendador
Ref: habitacion.codigoEstablecimiento > establecimiento.codigoEstablecimiento
Ref: bloqueo_fechas.idHabitacion > habitacion.idHabitacion
Ref: precio_habitacion.idHabitacion > habitacion.idHabitacion
Ref: precio_habitacion.idTemporada > temporada.idTemporada

Ref: users.idPersona - persona.idPersona

Ref: reserva.codigoEstablecimiento > establecimiento.codigoEstablecimiento
Ref: reserva.idPersonaTitular > persona.idPersona
Ref: reserva_habitacion.idHabitacion > habitacion.idHabitacion
Ref: reserva_habitacion.idReserva > reserva.idReserva

Ref: contrato.idReserva - reserva.idReserva
Ref: parte.referenciaContrato > contrato.referencia
Ref: viajero_parte.idParte > parte.idParte
Ref: viajero_parte.idPersona > persona.idPersona

Ref: comunicaciones_ses.referenciaContrato > contrato.referencia
Ref: comunicaciones_ses.idParte > parte.idParte
Ref: comunicaciones_ses.idReserva > reserva.idReserva
Ref: operaciones_ses.idComunicacionSES > comunicaciones_ses.idComunicacionSES

~~~
