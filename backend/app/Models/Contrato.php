<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
