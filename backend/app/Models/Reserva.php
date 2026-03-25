<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
