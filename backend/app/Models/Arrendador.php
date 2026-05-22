<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Arrendador extends Model
{
    protected $table = 'arrendador';

    protected $primaryKey = 'codigoArrendador';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'codigoArrendador',
        'tipo',
        'nombre',
        'apellido1',
        'apellido2',
        'tipoDocumento',
        'documento',
    ];

    /*
    | RELACIONES 
    */
    public function establecimientos()
    {
        return $this->hasMany(
            Establecimiento::class,
            'codigoArrendador',
            'codigoArrendador'
        );
    }
}