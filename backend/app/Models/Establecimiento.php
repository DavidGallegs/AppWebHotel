<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Establecimiento extends Model
{
    protected $table = 'establecimiento';

    protected $primaryKey = 'codigo';

    public $incrementing = false; 

    protected $keyType = 'string'; 

    protected $fillable = [
        'codigo',
        'codigoArrendador',
        'tipo',
        'nombre',
        'direccion',
        'codigoMunicipio',
        'localidad',
        'cp',
        'pais'
    ];
}
