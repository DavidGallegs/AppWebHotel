<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ViajeroParte extends Model
{
    use HasFactory;

    protected $table = 'viajero_parte';
    protected $primaryKey = 'id'; // ajusta según tu PK
    public $timestamps = false;

    protected $fillable = [
        'idPersona',  // FK hacia persona
        'rol',
        'parentesco'
    ];

    // Relación con persona
    public function persona()
    {
        return $this->belongsTo(Reserva::class, 'idPersona');
    }
}
