<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Establecimiento extends Model
{
    protected $table = 'establecimiento';

    protected $primaryKey = 'codigo';

    public $incrementing = false; // clave si NO es autoincrement

    protected $keyType = 'string'; // si el codigo es tipo '0000004063'

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
