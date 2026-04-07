<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Persona; // Importamos el modelo Persona para definir la relacion

class Reserva extends Model
{
    protected $table = 'reserva';

    protected $primaryKey = 'idReserva';

    public $timestamps = false;

    protected $fillable = [
        'idPersonaTitular',
        'codigoEstablecimiento',
        'estado',
        'createdAt',
        'updatedAt'
    ];

    // Definimos la relacion con el modelo Persona para acceder al titular de la reserva
    public function titular()
    {
        return $this->belongsTo(Persona::class, 'idPersonaTitular', 'idPersona');
    }
}
