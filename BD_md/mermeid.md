# MODELO ENTIDAD RELACIÓN

~~~~ md
erDiagram
    ARRENDADOR ||--o{ ESTABLECIMIENTO : "gestiona"
    ESTABLECIMIENTO ||--|{ HABITACION : "contiene"
    HABITACION ||--o{ BLOQUEO_FECHAS : "tiene"
    HABITACION ||--o{ PRECIO_HABITACION : "tiene"
    TEMPORADA ||--o{ PRECIO_HABITACION : "aplica a"
    
    PERSONA ||--o| USERS : "cuenta de"
    PERSONA ||--o{ RESERVA : "es titular de"
    ESTABLECIMIENTO ||--o{ RESERVA : "recibe"
    
    RESERVA ||--|{ RESERVA_HABITACION : "incluye"
    HABITACION ||--o{ RESERVA_HABITACION : "asignada a"
    
    RESERVA ||--o| CONTRATO : "genera"
    CONTRATO ||--o{ PARTE : "asocia"
    
    PARTE ||--|{ VIAJERO_PARTE : "registra"
    PERSONA ||--o{ VIAJERO_PARTE : "figura como"
    
    CONTRATO ||--o{ COMUNICACIONES_SES : "requiere"
    PARTE ||--o{ COMUNICACIONES_SES : "requiere"
    RESERVA ||--o{ COMUNICACIONES_SES : "requiere"
    COMUNICACIONES_SES ||--o{ OPERACIONES_SES : "registra logs en"

~~~~
