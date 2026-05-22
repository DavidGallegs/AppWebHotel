<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperacionSES extends Model
{
    protected $table = 'operaciones_ses';

    protected $primaryKey = 'idOperacion';

    public $timestamps = false;

    protected $fillable = [
        'idComunicacionSES',
        'operacion',
        'http_status',
        'ses_codigo',
        'ses_descripcion',
        'request_xml',
        'response_xml',
        'resultado_tecnico',
        'resultado_funcional',
        'created_at',
    ];

    /*
    | RELACIONES 
    */

    public function comunicacion()
    {
        return $this->belongsTo(
            ComunicacionSES::class,
            'idComunicacionSES'
        );
    }
}