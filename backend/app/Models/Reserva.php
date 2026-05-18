<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Persona; // Importamos el modelo Persona para definir la relacion
use App\Models\Contrato; 
use App\Models\Habitacion;
use App\Models\ReservaHabitacion;


class Reserva extends Model
{
    protected $table = 'reserva';

    protected $primaryKey = 'idReserva';

    public $timestamps = false;

    protected $fillable = [
        'idPersonaTitular',
        'codigoEstablecimiento',
        'fechaEntrada',
        'fechaSalida',
        'numPersonas',
        'numHabitaciones',
        'estado',
        'solicitud_cancelacion',
        'solicitud_modificacion',
        'datos_modificacion',
        'estado_pago',
        'createdAt',
        'updatedAt'
    ];

    // Laravel manejará automáticamente el JSON. No es necesario convertirlo manualmente.
    protected $casts = [
        'datos_modificacion' => 'array',
        'solicitud_modificacion' => 'boolean',
        'solicitud_cancelacion' => 'boolean'
    ];

    // Definimos la relacion con el modelo Persona para acceder al titular de la reserva
    public function titular()
    {
        return $this->belongsTo(Persona::class, 'idPersonaTitular', 'idPersona');
    }

    public function contrato()
    {
        return $this->hasOne(Contrato::class, 'idReserva');
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'idPersonaTitular', 'idPersona');
    }

    public function habitaciones()
    {
        return $this->belongsToMany(
            Habitacion::class,
            'reserva_habitacion',
            'idReserva',
            'idHabitacion'
        )->withPivot('numPersonas');
    }

    public function reservaHabitaciones()
    {
        return $this->hasMany(ReservaHabitacion::class, 'idReserva');
    }

    public function establecimiento()
    {
        return $this->belongsTo(Establecimiento::class, 'codigoEstablecimiento', 'codigoEstablecimiento');
    }

   

    
}
