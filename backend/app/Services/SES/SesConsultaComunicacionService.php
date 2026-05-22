<?php

namespace App\Services\SES;

use App\Models\ComunicacionSES;
use App\Models\OperacionSES;
use DOMDocument;
use Illuminate\Support\Facades\Http;
use Throwable;

class SesConsultaComunicacionService
{
    public function consultar(ComunicacionSES $comunicacion): array
    {
        try {

            $soap = $this->buildSoap($comunicacion->codigo_comunicacion);

            $response = Http::withoutVerifying()
                ->timeout(30)
                ->withHeaders([
                    'Content-Type' => 'text/xml; charset=utf-8',
                    'Authorization' => 'Basic ' . config('services.ses.auth_basic'),
                ])
                ->withBody($soap, 'text/xml')
                ->post(config('services.ses.endpoint'));

            $body = $response->body();

            logger()->info('SES RESPONSE COMUNICACION', [
                'status' => $response->status(),
                'body' => $body
            ]);

            if (!$response->successful() || empty(trim($body))) {
                throw new \RuntimeException("SES error comunicación HTTP {$response->status()}");
            }

            /*
            | EN CASO DE QUE EL CAMPO ANULADA NO EXISTA, SE ASUME QUE NO ESTA ANULADA. 
            |SOLO SI EL CAMPO EXISTE Y ES TRUE SE CONSIDERA ANULADA.
            */
            $anulada = $this->get($body, 'anulada');
    
            //------------------------------------------

            $estado = $this->get($body, 'codigoEstado');
            $desc = $this->get($body, 'descripcion');

            $comunicacion->codigo_estado = $estado;
            $comunicacion->descripcion_estado = $desc;

            if ($anulada !== null) {
                $comunicacion->anulada = (
                    strtolower($anulada) === 'true'
                );
                $comunicacion->estado_ses = 'ANULADA';
            }

            $comunicacion->fecha_procesamiento = now();
            $comunicacion->save();

            OperacionSES::create([
                'idComunicacionSES' => $comunicacion->idComunicacionSES,
                'operacion' => 'CONSULTA_COMUNICACION',
                'http_status' => $response->status(),
                'response_xml' => $body,
            ]);

            return [
                'ok' => true,
                'estado' => $estado,
                'descripcion' => $desc
            ];

        } catch (Throwable $e) {

            logger()->error('ERROR CONSULTA COMUNICACION', [
                'msg' => $e->getMessage()
            ]);

            return [
                'ok' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function buildSoap(string $codigo): string
    {
        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:com="http://www.soap.servicios.hospedajes.mir.es/comunicacion">
            <soapenv:Header/>
            <soapenv:Body>
                <com:consultaComunicacionRequest>
                    <codigos>
                        <codigo>{$codigo}</codigo>
                    </codigos>
                </com:consultaComunicacionRequest>
            </soapenv:Body>
        </soapenv:Envelope>
        XML;
    }

    private function get(string $xml, string $tag): ?string
    {
        $dom = new DOMDocument();

        if (!@$dom->loadXML($xml)) return null;

        $xp = new \DOMXPath($dom);

        $n = $xp->query("//*[local-name()='$tag']");

        return $n->length ? trim($n->item(0)->nodeValue) : null;
    }
}