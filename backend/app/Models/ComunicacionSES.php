<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComunicacionSES extends Model
{
    protected $table = 'comunicaciones_ses';

    protected $primaryKey = 'idComunicacionSES';

    public $timestamps = false;

    protected $fillable = [
        'referenciaContrato',
        'idReserva',
        'idParte',
        'tipo_comunicacion',
        'codigo_lote',
        'codigo_comunicacion',
        'estado_ses',
        'codigo_estado',
        'descripcion_estado',
        'anulada',
        'fecha_peticion',
        'fecha_procesamiento',
        'codigo_arrendador',
        'aplicacion',
        'created_at',
        'updated_at',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'idReserva');
    }

    public function parte()
    {
        return $this->belongsTo(Parte::class, 'idParte');
    }

    public function operaciones()
    {
        return $this->hasMany(
            OperacionSES::class,
            'idComunicacionSES',
            'idComunicacionSES'
        );
    }
}