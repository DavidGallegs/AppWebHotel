<?php

namespace App\Services\SES;

use App\Models\ComunicacionSES;
use App\Models\OperacionSES;
use DOMDocument;
use DOMXPath;
use Throwable;
use ZipArchive;
use Illuminate\Support\Facades\Http;

class SesConsultaLoteService
{
    public function consultarLote(ComunicacionSES $comunicacion): array
    {
        $zipPath = null;

        try {

            /*
            | 1. XML CONSULTA
            */
            $xmlConsulta = $this->generarXmlConsulta(
                $comunicacion->codigo_lote
            );

            /*
            | 2. ZIP
            */
            $zipPath = storage_path(
                'app/temp/lote_' . uniqid() . '.zip'
            );

            if (!is_dir(dirname($zipPath))) {
                mkdir(dirname($zipPath), 0777, true);
            }

            $zip = new ZipArchive();

            if (
                !$zip->open(
                    $zipPath,
                    ZipArchive::CREATE | ZipArchive::OVERWRITE
                )
            ) {
                throw new \RuntimeException('Error creando ZIP');
            }

            /*
            | IMPORTANTE:
            | El nombre interno debe ser solicitud.xml
            */
            $zip->addFromString('solicitud.xml', $xmlConsulta);

            $zip->close();

            $zipContent = file_get_contents($zipPath);

            if ($zipContent === false) {
                throw new \RuntimeException('No se pudo leer ZIP');
            }

            $base64 = base64_encode($zipContent);

            /*
            | 3. SOAP
            */
            $soapXml = $this->generarSoap($base64);

            logger()->info('SOAP CONSULTA LOTE', [
                'soap' => $soapXml
            ]);

            /*
            | 4. REQUEST
            */
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->withHeaders([
                    'Content-Type' => 'text/xml; charset=utf-8',
                    'Authorization' => 'Basic ' . config('services.ses.auth_basic'),
                ])
                ->withBody($soapXml, 'text/xml')
                ->post(config('services.ses.endpoint'));

            $body = $response->body();

            logger()->info('RESPUESTA CONSULTA LOTE', [
                'status' => $response->status(),
                'body' => $body
            ]);

            if (
                !$response->successful()
                || empty(trim($body))
            ) {
                throw new \RuntimeException(
                    "SES error HTTP {$response->status()}"
                );
            }

            /*
            | 5. EXTRAER DATOS
            */
            $codigoEstado = $this->getValue($body, 'codigoEstado');
            $descEstado = $this->getValue($body, 'descEstado');
            $tipoComunicacion = $this->getValue($body, 'tipoComunicacion');
            $descpripcionTecnico = $this->getValue($body, 'descripcion');

            $ses_codigo = $this->getValue($body, 'codigo');

            $codigoComunicacion = $this->getValue(
                $body,
                'codigoComunicacion'
            );

            /*
            | 6. GUARDAR
            */
            $comunicacion->codigo_comunicacion = $codigoComunicacion;

            $comunicacion->descripcion_estado = $descEstado;
            $comunicacion->codigo_estado = $codigoEstado;
            $comunicacion->fecha_procesamiento = now();

            $comunicacion->save();

            OperacionSES::create([
                'idComunicacionSES' => $comunicacion->idComunicacionSES,
                'operacion' => 'CONSULTA_LOTE',

                'ses_descripcion' => $descEstado,
                'resultado_tecnico' => $descpripcionTecnico,
                'http_status' => $response->status(),
                'ses_codigo' => $ses_codigo,
                'resultado_funcional' => $descpripcionTecnico,
                'response_xml' => $body,
            ]);

            return [
                'ok' => true,
                'codigo_estado' => $codigoEstado,
                'descripcion_estado' => $descEstado
            ];

        } catch (Throwable $e) {

            logger()->error('ERROR CONSULTA LOTE', [
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

    private function generarXmlConsulta(string $lote): string
    {
        $dom = new DOMDocument();

        $dom->load(
            resource_path('xml/ses/solicitudConsultaLote.xml')
        );

        $xpath = new DOMXPath($dom);

        $nodes = $xpath->query(
            "//*[local-name()='lote']"
        );

        if ($nodes->length === 0) {
            throw new \Exception('Nodo lote no encontrado');
        }

        $nodes->item(0)->textContent = $lote;

        return $dom->saveXML();
    }

    private function generarSoap(string $base64): string
    {
        $dom = new DOMDocument();

        $dom->load(
            resource_path('xml/ses/consultaLoteSoap.xml')
        );

        $xpath = new DOMXPath($dom);

        $nodes = $xpath->query(
            "//*[local-name()='solicitud']"
        );

        if ($nodes->length === 0) {
            throw new \Exception('Nodo solicitud no encontrado');
        }

        $nodes->item(0)->textContent = $base64;

        return $dom->saveXML();
    }

    private function getValue(
        string $xml,
        string $tag
    ): ?string
    {
        $dom = new DOMDocument();

        if (!@$dom->loadXML($xml)) {
            return null;
        }

        $xpath = new DOMXPath($dom);

        $nodes = $xpath->query(
            "//*[local-name()='$tag']"
        );

        if ($nodes->length === 0) {
            return null;
        }

        return trim($nodes->item(0)->nodeValue);
    }
}