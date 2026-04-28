<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Reserva;

class Contrato extends Model
{
    // Nombre exacto de la tabla
    protected $table = 'contrato';
    
    public $timestamps = false;

    protected $fillable = [
        'referencia',
        'idReserva',
        'fechaContrato',
        'internet',
        'tipoPago',
        'fechaPago',
        'precioTotal'
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'idReserva');
    }
}
