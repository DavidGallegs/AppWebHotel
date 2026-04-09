<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parte extends Model
{
    protected $table = 'parte';

    protected $primaryKey = 'idParte';

    public $timestamps = false;

    protected $fillable = [
        'referenciaContrato',
        'estado',
        'fechaCreacion',
        'fechaEnvio',
        'createdAt',
        'updatedAt'
    ];
}
