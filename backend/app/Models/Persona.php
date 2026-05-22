<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
     use HasFactory;

    protected $table = 'persona';

    protected $primaryKey = 'idPersona';

    public $timestamps = false;

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
        'email',
        'tipoDocumento',
        'documento',
        'soporteDocumento'
    ];
    
}
