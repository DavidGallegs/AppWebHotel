<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Reserva;

class Contrato extends Model
{
    // Nombre exacto de la tabla
    protected $table = 'contrato';

    protected $primaryKey = 'referencia';

    public $incrementing = false;

    protected $keyType = 'string';

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
        return $this->belongsTo(Reserva::class, 'idReserva', 'idReserva');
    }
}
