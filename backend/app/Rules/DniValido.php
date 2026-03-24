<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class DniValido implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        logger("Validando documento: $value");

        $doc = strtoupper($value);
        $letras = "TRWAGMYFPDXBNJZSQVHLCKE";

        // DNI
        if (preg_match('/^[0-9]{8}[A-Z]$/', $doc)) {
            $numero = substr($doc, 0, 8);
            $letra = substr($doc, -1);

            if ($letras[$numero % 23] !== $letra) {
                $fail('El DNI no es válido.');
            }
            return;
        }

        // NIE
        if (preg_match('/^[XYZ][0-9]{7}[A-Z]$/', $doc)) {
            $map = ['X' => '0', 'Y' => '1', 'Z' => '2'];
            $numero = $map[$doc[0]] . substr($doc, 1, 7);
            $letra = substr($doc, -1);

            if ($letras[$numero % 23] !== $letra) {
                $fail('El NIE no es válido.');
            }
            return;
        }

        // Si no es ni DNI ni NIE válido
        $fail('El documento debe ser un DNI o NIE válido.');
    }
}

?>