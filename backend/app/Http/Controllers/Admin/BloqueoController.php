<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BloqueoFecha;
use Illuminate\Http\Request;

class BloqueoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'fechaInicio' => 'required|date',
            'fechaFin' => 'required|date|after_or_equal:fechaInicio'
        ]);

        $bloqueo = BloqueoFecha::create([
            'idHabitacion' => $request->idHabitacion,
            'codigoEstablecimiento' => $request->codigoEstablecimiento,
            'fechaInicio' => $request->fechaInicio,
            'fechaFin' => $request->fechaFin
        ]);

        return response()->json([
            'message' => 'Bloqueo creado',
            'bloqueo' => $bloqueo
        ]);
    }
}
