<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Contrato;
use App\Models\Persona;
use App\Models\ViajeroParte;

class Parte extends Model
{
    protected $table = 'parte';

    protected $primaryKey = 'idParte';

    public $timestamps = false;

    protected $fillable = [
        'referenciaContrato',
        'estado',
        'fechaCreacion',
        'fechaEnvio',
        'createdAt',
        'updatedAt'
    ];

    public function contrato()
    {
        return $this->belongsTo(
            Contrato::class,
            'referenciaContrato',
            'referencia'
        );
    }

    public function viajeros()
    {
        return $this->belongsToMany(
            Persona::class,
            'viajero_parte',
            'idParte',
            'idPersona'
        )
        ->withPivot('rol', 'parentesco');
    }

    public function titular()
    {
        return $this->hasOneThrough(
            Persona::class,
            ViajeroParte::class,
            'idParte',
            'idPersona',
            'idParte',
            'idPersona'
        )->where('rol', 'TI');
    }
}
