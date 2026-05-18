<?php

namespace App\Services\SES;

use App\Models\Parte;
use App\Models\Persona;
use App\Models\ViajeroParte;
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
            'contrato.reserva.establecimiento'
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

            logger()->info('ENVIANDO PETICION HTTP AL SES');

            $response = Http::withoutVerifying()
                ->timeout(30)
                ->connectTimeout(10)
                ->withHeaders([
                    'Content-Type' => 'text/xml; charset=utf-8',
                    'Authorization' => 'Basic ' . config('services.ses.auth_basic'),
                ])
                ->withBody($soapXml, 'text/xml')
                ->post(config('services.ses.endpoint'));

            logger()->info('RESPUESTA SES RECIBIDA', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'failed' => $response->failed(),
                'body' => $response->body(),
            ]);
            /******************************************/
            
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
            | 6.1 ACTUALIZAR ESTADO DEL PARTE  👈 AQUÍ VA
            |--------------------------------------------------------------------------
            */

            $ok = $response->successful();

            $parte->estado = $ok ? 'enviado' : 'error';
            $parte->fechaEnvio = now();
            $parte->save();

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

        $numPersonas = $reserva->habitaciones
            ->first()
            ?->pivot
            ?->numPersonas ?? 1;

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;

        /*
        |----------------------------------------------------------------------
        | PETICION (CON NAMESPACE)
        |----------------------------------------------------------------------
        */
        $nsPeticion = 'http://www.neg.hospedajes.mir.es/altaReservaHospedaje';

        $peticion = $dom->createElementNS($nsPeticion, 'peticion');
        $dom->appendChild($peticion);

        /*
        | SOLICITUD SIN NAMESPACE REAL (OBLIGATORIO EN SES)
        */
        $solicitud = $dom->createElement('solicitud');
        $solicitud->setAttribute('xmlns', '');
        $peticion->appendChild($solicitud);

        /*
        | COMUNICACION
        */
        $comunicacion = $dom->createElement('comunicacion');
        $solicitud->appendChild($comunicacion);

        /*
        |----------------------------------------------------------------------
        | ESTABLECIMIENTO
        |----------------------------------------------------------------------
        */
        $est = $dom->createElement('establecimiento');
        $est->appendChild($dom->createElement('codigo', $establecimiento->codigoEstablecimiento));
        $comunicacion->appendChild($est);

        /*
        |----------------------------------------------------------------------
        | CONTRATO
        |----------------------------------------------------------------------
        */
        $contratoNode = $dom->createElement('contrato');

        $contratoNode->appendChild($dom->createElement('referencia', $contrato->referencia));

        $contratoNode->appendChild($dom->createElement(
            'fechaContrato',
            date('Y-m-d', strtotime($contrato->fechaContrato))
        ));

        $contratoNode->appendChild($dom->createElement(
            'fechaEntrada',
            date('Y-m-d\TH:i:s', strtotime($reserva->fechaEntrada))
        ));

        $contratoNode->appendChild($dom->createElement(
            'fechaSalida',
            date('Y-m-d\TH:i:s', strtotime($reserva->fechaSalida))
        ));

        $contratoNode->appendChild($dom->createElement('numPersonas', $numPersonas));

        $contratoNode->appendChild($dom->createElement('numHabitaciones', $reserva->habitaciones->count() ?: 1));

        $contratoNode->appendChild($dom->createElement('internet', $contrato->internet ? 'true' : 'false'));

        $pagoNode = $dom->createElement('pago');
        $pagoNode->appendChild($dom->createElement('tipoPago', $contrato->tipoPago ?? 'EFECT'));
        $pagoNode->appendChild($dom->createElement('fechaPago', $contrato->fechaPago ?? date('Y-m-d')));

        $contratoNode->appendChild($pagoNode);

        $comunicacion->appendChild($contratoNode);

        /*
        |----------------------------------------------------------------------
        | PERSONA
        |----------------------------------------------------------------------
        */
        $titular = Persona::find($reserva->idPersonaTitular);

        $rolTitular = ViajeroParte::where('idParte', $parte->idParte)
            ->where('rol', 'TI')
            ->first();

        $personaNode = $dom->createElement('persona');

        $personaNode->appendChild($dom->createElement('rol', $rolTitular?->rol ?? 'TI'));
        $personaNode->appendChild($dom->createElement('nombre', $titular?->nombre));
        $personaNode->appendChild($dom->createElement('apellido1', $titular?->apellido1));
        $personaNode->appendChild($dom->createElement('apellido2', $titular?->apellido2 ?? ''));
        $personaNode->appendChild($dom->createElement('telefono', $titular?->telefono ?? ''));
        $personaNode->appendChild($dom->createElement('correo', $titular?->email ?? ''));

        $comunicacion->appendChild($personaNode);

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