<?php

namespace App\Services\SES;

use App\Models\Parte;
use App\Models\ComunicacionSES;
use App\Models\OperacionSES;
use DOMDocument;
use Illuminate\Support\Facades\Http;
use ZipArchive;
use Throwable;

class SesAltaReservaService
{
    public function enviarParte(Parte $parte): array
    {
        $parte->load([
            'contrato.reserva.establecimiento',
            'viajeros'
        ]);

        $requestXml = null;
        $responseXml = null;
        $zipPath = null;

        try {

            /*
            |--------------------------------------------------------------------------
            | 1. GENERAR XML
            |--------------------------------------------------------------------------
            */

            $requestXml = $this->generarXml($parte);

            /*
            |--------------------------------------------------------------------------
            | 2. CREAR ZIP
            |--------------------------------------------------------------------------
            */

            $zipPath = storage_path('app/temp/ses_' . uniqid() . '.zip');

            $zip = new ZipArchive();

            if (!$zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
                throw new \RuntimeException("No se pudo crear ZIP");
            }

            $zip->addFromString('datosReserva.xml', $requestXml);
            $zip->close();

            /*
            |--------------------------------------------------------------------------
            | 3. BASE64
            |--------------------------------------------------------------------------
            */

            $zipData = file_get_contents($zipPath);
            $base64 = base64_encode($zipData);

            /*
            |--------------------------------------------------------------------------
            | 4. PLANTILLA SOAP
            |--------------------------------------------------------------------------
            */

            $dom = new DOMDocument();
            $dom->load(resource_path('xml/ses/plantillaReserva.xml'));

            $dom->getElementsByTagName('codigoArrendador')
                ->item(0)->nodeValue = config('services.ses.codigo_arrendador');

            $dom->getElementsByTagName('solicitud')
                ->item(0)->nodeValue = $base64;

            $soapXml = $dom->saveXML();

            /*
            |--------------------------------------------------------------------------
            | 5. ENVIAR SES
            |--------------------------------------------------------------------------
            */

            $response = Http::withHeaders([
                'Content-Type' => 'text/xml; charset=utf-8',
                'Authorization' => 'Basic ' . config('services.ses.auth_basic'),
            ])
            ->withBody($soapXml, 'text/xml')
            ->post(config('services.ses.endpoint'));

            $responseXml = $response->body();

            /*
            |--------------------------------------------------------------------------
            | 6. EXTRAER DATOS SES
            |--------------------------------------------------------------------------
            */

            $lote = $this->getNodeValue($responseXml, 'lote');
            $codigoComunicacion = $this->getNodeValue($responseXml, 'codigoComunicacion');
            $estado = $this->getNodeValue($responseXml, 'estado');
            $codigoEstado = $this->getNodeValue($responseXml, 'codigoEstado');
            $descripcionEstado = $this->getNodeValue($responseXml, 'descripcion');

            /*
            |--------------------------------------------------------------------------
            | 7. GUARDAR COMUNICACIÓN SES
            |--------------------------------------------------------------------------
            */

            $comunicacion = ComunicacionSES::create([
                'referenciaContrato' => $parte->referenciaContrato,
                'idReserva' => $parte->contrato->idReserva,
                'idParte' => $parte->idParte,
                'tipo_comunicacion' => 'A',
                'codigo_lote' => $lote,
                'codigo_comunicacion' => $codigoComunicacion,
                'estado_ses' => $estado ?? ($response->successful() ? 'ENVIADO' : 'ERROR'),
                'codigo_estado' => $codigoEstado,
                'descripcion_estado' => $descripcionEstado,
                'fecha_peticion' => now(),
                'codigo_arrendador' => config('services.ses.codigo_arrendador'),
                'aplicacion' => 'HOTEL_RURAL'
            ]);

            /*
            |--------------------------------------------------------------------------
            | 8. GUARDAR OPERACIÓN SES
            |--------------------------------------------------------------------------
            */

            OperacionSES::create([
                'idComunicacionSES' => $comunicacion->idComunicacionSES,
                'operacion' => 'ALTA_RESERVA',
                'http_status' => $response->status(),
                'request_xml' => $soapXml,
                'response_xml' => $responseXml,
                'resultado_tecnico' => $response->successful() ? 'OK' : 'ERROR',
            ]);

            /*
            |--------------------------------------------------------------------------
            | 9. LIMPIEZA
            |--------------------------------------------------------------------------
            */

            if (file_exists($zipPath)) {
                unlink($zipPath);
            }

            /*
            |--------------------------------------------------------------------------
            | 10. RESPUESTA FINAL
            |--------------------------------------------------------------------------
            */

            return [
                'ok' => $response->successful(),
                'status' => $response->status(),
                'lote' => $lote,
                'codigo_comunicacion' => $codigoComunicacion,
                'response' => $responseXml
            ];

        } catch (Throwable $e) {

            /*
            |--------------------------------------------------------------------------
            | ERROR CONTROLADO
            |--------------------------------------------------------------------------
            */

            if ($zipPath && file_exists($zipPath)) {
                unlink($zipPath);
            }

            return [
                'ok' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | GENERADOR XML SES
    |--------------------------------------------------------------------------
    */

    private function generarXml(Parte $parte): string
    {
        $contrato = $parte->contrato;
        $reserva = $contrato->reserva;
        $establecimiento = $reserva->establecimiento;

        $viajeros = $parte->viajeros;

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;

        $peticion = $dom->createElementNS(
            'http://www.neg.hospedajes.mir.es/altaReservaHospedaje',
            'peticion'
        );

        $dom->appendChild($peticion);

        $solicitud = $dom->createElement('solicitud');
        $peticion->appendChild($solicitud);

        $comunicacion = $dom->createElement('comunicacion');
        $solicitud->appendChild($comunicacion);

        /*
        |--------------------------------------------------------------------------
        | ESTABLECIMIENTO
        |--------------------------------------------------------------------------
        */

        $est = $dom->createElement('establecimiento');
        $est->appendChild(
            $dom->createElement('codigo', $establecimiento->codigoEstablecimiento)
        );
        $comunicacion->appendChild($est);

        /*
        |--------------------------------------------------------------------------
        | CONTRATO
        |--------------------------------------------------------------------------
        */
        $contratoNode = $dom->createElement('contrato');

        $contratoNode->appendChild(
            $dom->createElement('referencia', $contrato->referencia)
        );

        $contratoNode->appendChild(
            $dom->createElement(
                'fechaContrato',
                $contrato->fechaContrato
            )
        );

        $contratoNode->appendChild(
            $dom->createElement(
                'fechaEntrada',
                $reserva->fechaEntrada
            )
        );

        $contratoNode->appendChild(
            $dom->createElement(
                'fechaSalida',
                $reserva->fechaSalida
            )
        );

        $contratoNode->appendChild(
            $dom->createElement(
                'numPersonas',
                $viajeros->count()
            )
        );

        $contratoNode->appendChild(
            $dom->createElement(
                'numHabitaciones',
                $reserva->habitaciones->count() ?: 1
            )
        );

        /*
        |--------------------------------------------------------------------------
        | INTERNET
        |--------------------------------------------------------------------------
        */

        $contratoNode->appendChild(
            $dom->createElement(
                'internet',
                $contrato->internet ? 'true' : 'false'
            )
        );

        /*
        |--------------------------------------------------------------------------
        | PAGO (FALTA EN TU CÓDIGO)
        |--------------------------------------------------------------------------
        */

        $pagoNode = $dom->createElement('pago');

        $pagoNode->appendChild(
            $dom->createElement(
                'tipoPago',
                $contrato->tipoPago ?? 'EFECT'
            )
        );

        $pagoNode->appendChild(
            $dom->createElement(
                'fechaPago',
                $contrato->fechaPago ?? date('Y-m-d')
            )
        );

        $contratoNode->appendChild($pagoNode);

        $comunicacion->appendChild($contratoNode);

        /*
        |--------------------------------------------------------------------------
        | PERSONAS
        |--------------------------------------------------------------------------
        */

        foreach ($viajeros as $v) {

            $p = $dom->createElement('persona');

            $p->appendChild($dom->createElement('rol', $v->pivot->rol));
            $p->appendChild($dom->createElement('nombre', $v->nombre));
            $p->appendChild($dom->createElement('apellido1', $v->apellido1));

            if ($v->apellido2) {
                $p->appendChild($dom->createElement('apellido2', $v->apellido2));
            }

            $p->appendChild($dom->createElement('telefono', $v->telefono));
            $p->appendChild($dom->createElement('correo', $v->email));
            $p->appendChild($dom->createElement('tipoDocumento', $v->tipoDocumento));
            $p->appendChild($dom->createElement('documento', $v->documento));

            $comunicacion->appendChild($p);
        }

        return $dom->saveXML();
    }

    /*
    |--------------------------------------------------------------------------
    | PARSER XML
    |--------------------------------------------------------------------------
    */

    private function getNodeValue(string $xml, string $tag): ?string
    {
        $dom = new DOMDocument();

        if (!@$dom->loadXML($xml)) {
            return null;
        }

        $nodes = $dom->getElementsByTagName($tag);

        return $nodes->length > 0
            ? trim($nodes->item(0)->nodeValue)
            : null;
    }
}