<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla
    protected $table = 'PERSONA';

    // Clave primaria, le dice a Laravel cual es la columna PK
    protected $primaryKey = 'idPersona';

    // Campos que se pueden asignar, para evitar errores de asignación masiva.
    protected $fillable = [
        'nombre',
        'apellido1',
        'apellido2',
        'fechaNacimiento',
        'nacionalidad',
        'direccion',
        'codigoMunicipio',
        'nombreMunicipio',
        'localidad',
        'cp',
        'pais',
        'telefono',
        'correo',
        'sexo',
        'tipoDocumento',
        'documento',
        'soporteDocumento'
    ];
}
