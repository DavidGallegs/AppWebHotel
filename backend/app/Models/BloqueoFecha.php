<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloqueoFecha extends Model
{
    protected $table = 'bloqueo_fechas';

    protected $primaryKey = 'idBloqueo';

    public $timestamps = false;

    protected $fillable = [
        'idHabitacion',
        'codigoEstablecimiento',
        'fechaInicio',
        'fechaFin',
        'motivo'
    ];
}
