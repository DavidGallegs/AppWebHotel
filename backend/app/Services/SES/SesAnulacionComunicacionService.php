<?php

namespace App\Services\SES;

use App\Models\ComunicacionSES;
use App\Models\OperacionSES;
use DOMDocument;
use Illuminate\Support\Facades\Http;
use Throwable;
use ZipArchive;

class SesAnulacionComunicacionService
{
    public function anular(ComunicacionSES $comunicacion): array
    {
        $zipPath = null;

        try {

            /*
            | 1. XML INTERNO
            */

            $xmlInterno = $this->generarXmlInterno(
                $comunicacion->codigo_comunicacion
            );

            /*
            | 2. ZIP
            */

            $zipPath = storage_path(
                'app/temp/anulacion_' . uniqid() . '.zip'
            );

            if (!is_dir(dirname($zipPath))) {
                mkdir(dirname($zipPath), 0777, true);
            }

            $zip = new ZipArchive();

            if (!$zip->open(
                $zipPath,
                ZipArchive::CREATE | ZipArchive::OVERWRITE
            )) {
                throw new \RuntimeException('No se pudo crear ZIP');
            }

            $zip->addFromString(
                'anulacion.xml',
                $xmlInterno
            );

            $zip->close();

            $zipContent = file_get_contents($zipPath);

            if ($zipContent === false) {
                throw new \RuntimeException('No se pudo leer ZIP');
            }

            $base64 = base64_encode($zipContent);

            /*
            | 3. SOAP
            */

            $soap = $this->generarSoap($base64);

            logger()->info('SOAP ANULACION SES', [
                'soap' => $soap
            ]);

            /*
            | 4. REQUEST HTTP
            */

            $response = Http::withoutVerifying()
                ->timeout(30)
                ->withHeaders([
                    'Content-Type' => 'text/xml; charset=utf-8',
                    'Authorization' => 'Basic ' . config('services.ses.auth_basic'),
                ])
                ->withBody($soap, 'text/xml')
                ->post(config('services.ses.endpoint'));

            $body = $response->body();

            logger()->info('RESPUESTA ANULACION SES', [
                'status' => $response->status(),
                'body' => $body
            ]);

            /*
            | 5. PARSEAR RESPUESTA
            */

            $codigo = $this->getValue($body, 'codigo');
            $descripcion = $this->getValue($body, 'descripcion');
            $lote = $this->getValue($body, 'lote');

            /*
            | 6. GUARDAR OPERACION
            */

            OperacionSES::create([
                'idComunicacionSES' => $comunicacion->idComunicacionSES,
                'operacion' => 'ANULACION',
                'http_status' => $response->status(),
                'ses_codigo' => $codigo,
                'ses_descripcion' => $descripcion,
                'request_xml' => $soap,
                'response_xml' => $body,
                'resultado_tecnico' => $response->successful()
                    ? 'OK'
                    : 'ERROR',
                'resultado_funcional' => $codigo == 0
                    ? 'OK'
                    : 'ERROR',
            ]);

            return [
                'ok' => true,
                'codigo' => $codigo,
                'descripcion' => $descripcion,
                'lote' => $lote
            ];

        } catch (Throwable $e) {

            logger()->error('ERROR ANULACION SES', [
                'error' => $e->getMessage()
            ]);

            return [
                'ok' => false,
                'error' => $e->getMessage()
            ];

        } finally {

            if ($zipPath && file_exists($zipPath)) {
                unlink($zipPath);
            }
        }
    }

    private function generarXmlInterno(string $codigo): string
    {
        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <anul:comunicaciones
        xmlns:anul="http://www.neg.hospedajes.mir.es/anularComunicacion">

            <anul:codigoComunicacion>{$codigo}</anul:codigoComunicacion>

        </anul:comunicaciones>
        XML;
    }

    private function generarSoap(string $base64): string
    {
        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope
        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:com="http://www.soap.servicios.hospedajes.mir.es/comunicacion">

            <soapenv:Header/>

            <soapenv:Body>

                <com:comunicacionRequest>

                    <peticion>

                        <cabecera>

                            <codigoArrendador>
                                {config('services.ses.codigo_arrendador')}
                            </codigoArrendador>

                            <aplicacion>
                                APP_Pruebas
                            </aplicacion>

                            <tipoOperacion>B</tipoOperacion>

                        </cabecera>

                        <solicitud>{$base64}</solicitud>

                    </peticion>

                </com:comunicacionRequest>

            </soapenv:Body>

        </soapenv:Envelope>
        XML;
    }

    private function getValue(string $xml, string $tag): ?string
    {
        $dom = new DOMDocument();

        if (!@$dom->loadXML($xml)) {
            return null;
        }

        $xp = new \DOMXPath($dom);

        $n = $xp->query("//*[local-name()='$tag']");

        return $n->length
            ? trim($n->item(0)->nodeValue)
            : null;
    }
}