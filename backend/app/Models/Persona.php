<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
     use HasFactory;

    // Nombre exacto de la tabla
    protected $table = 'persona';

    // Clave primaria, le dice a Laravel cual es la columna PK
    protected $primaryKey = 'idPersona';

    // Laravel por defecto espera columnas created_at y updated_at para manejar 
    // las fechas de creación y actualización de los registros. Si tu tabla no las tiene, debo desactivar esta funcionalidad.
    public $timestamps = false;

    // Campos que se pueden asignar, para evitar errores de asignación masiva, es decir 
    // que Laravel no permita asignar valores a campos que no estén en esta lista.
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
        'telefono',
        'correo',
        'sexo',
        'tipoDocumento',
        'documento',
        'soporteDocumento'
    ];
    
}
