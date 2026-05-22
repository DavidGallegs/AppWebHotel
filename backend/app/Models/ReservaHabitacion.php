<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservaHabitacion extends Model
{
    protected $table = 'reserva_habitacion';

    public $timestamps = false;

    protected $fillable = [
        'idReserva',
        'idHabitacion',
        'numPersonas'
    ];
}
