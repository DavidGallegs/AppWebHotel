<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ReservaHabitacion;
use App\Models\Reserva;

class Habitacion extends Model
{
    protected $table = 'habitacion';
    protected $primaryKey = 'idHabitacion';

    protected $fillable = [
        'codigoEstablecimiento',
        'nombre',
        'capacidadMaxima'
    ];

    /*
    | RELACIONES 
    */

    public function reservas()
    {
        return $this->belongsToMany(
            Reserva::class,
            'reserva_habitacion',
            'idHabitacion',
            'idReserva'
        )->withPivot('numPersonas');
    }

    public function reservaHabitaciones()
    {
        return $this->hasMany(ReservaHabitacion::class, 'idHabitacion');
    }
}
