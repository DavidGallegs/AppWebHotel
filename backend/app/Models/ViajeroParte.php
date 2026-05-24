<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ViajeroParte extends Model
{
    protected $table = 'viajero_parte';

    protected $fillable = [
        'idParte',
        'idPersona',
        'rol',
        'parentesco'
    ];

    public $timestamps = false;


    public function parte()
    {
        return $this->belongsTo(Parte::class, 'idParte', 'idParte');
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'idPersona', 'idPersona');
    }
}
