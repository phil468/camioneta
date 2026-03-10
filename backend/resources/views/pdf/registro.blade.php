<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro {{ $registro->numero_registro }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 15px;
        }

        .header h1 {
            color: #2c3e50;
            font-size: 20px;
            margin-bottom: 5px;
        }

        .header h2 {
            color: #34495e;
            font-size: 16px;
            font-weight: normal;
        }

        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            width: 30%;
            padding: 5px;
            background-color: #ecf0f1;
        }

        .info-value {
            display: table-cell;
            width: 70%;
            padding: 5px;
            border-bottom: 1px solid #bdc3c7;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            background-color: #3498db;
            color: white;
            padding: 8px 10px;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 10px;
            border-radius: 3px;
            position: relative;
            padding-left: 30px;
        }

        .section-title::before {
            content: '';
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 2px;
        }

        .two-columns {
            display: table;
            width: 100%;
        }

        .column {
            display: table-cell;
            width: 50%;
            padding-right: 10px;
            vertical-align: top;
        }

        .column:last-child {
            padding-right: 0;
            padding-left: 10px;
        }

        .estado-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 3px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
        }

        .estado-por_aprobar {
            background-color: #ecf0f1;
            color: #2c3e50;
        }

        .estado-aprobado {
            background-color: #27ae60;
            color: white;
        }

        .estado-rechazado {
            background-color: #e74c3c;
            color: white;
        }

        .firma-container {
            text-align: center;
            margin-top: 10px;
            padding: 10px;
            border: 1px solid #bdc3c7;
            border-radius: 3px;
        }

        .firma-img {
            max-width: 100%;
            height: auto;
            max-height: 100px;
            /* border: 1px solid #ddd; */
        }

        .firma-label {
            font-size: 10px;
            margin-top: 5px;
            color: #7f8c8d;
        }

        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 9px;
            color: #95a5a6;
            border-top: 1px solid #ecf0f1;
            padding-top: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .tabla-detalles th,
        .tabla-detalles td {
            border: 1px solid #bdc3c7;
            padding: 6px;
            text-align: left;
        }

        .tabla-detalles th {
            background-color: #34495e;
            color: white;
            font-weight: bold;
        }

        .tabla-detalles tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Control de Alquiler de Jabas y Parihuelas</h1>
        <h2>Registro N° {{ $registro->numero_registro }}</h2>
        <div style="margin-top: 10px;">
            <span class="estado-badge estado-{{ $registro->estado }}">{{ strtoupper($registro->estado) }}</span>
        </div>
    </div>

    <!-- Información General -->
    <div class="section">
        <div class="section-title">Información General</div>
        <div class="info-row">
            <div class="info-label">Fecha:</div>
            <div class="info-value">{{ \Carbon\Carbon::parse($registro->fecha)->format('d/m/Y') }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Hora:</div>
            <div class="info-value">{{ $registro->hora }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">N° Registro:</div>
            <div class="info-value">{{ $registro->numero_registro }}</div>
        </div>
        @if ($registro->guia_remision)
            <div class="info-row">
                <div class="info-label">Guía de Remisión:</div>
                <div class="info-value">{{ $registro->guia_remision }}</div>
            </div>
        @endif
    </div>

    <!-- Cliente e Información de Transporte -->
    <div class="section">
        <div class="section-title">Cliente e Información de Transporte</div>
        <div class="two-columns">
            <div class="column">
                <div class="info-row">
                    <div class="info-label">Cliente:</div>
                    <div class="info-value">{{ $registro->cliente->nombre ?? '' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">RUC:</div>
                    <div class="info-value">{{ $registro->cliente->ruc ?? '' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Representante:</div>
                    <div class="info-value">{{ $registro->representante_cliente ?? '' }}</div>
                </div>
            </div>
            <div class="column">
                <div class="info-row">
                    <div class="info-label">Chofer:</div>
                    <div class="info-value">{{ $registro->chofer->nombre ?? '' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">DNI Chofer:</div>
                    <div class="info-value">{{ $registro->chofer->dni ?? '' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Licencia:</div>
                    <div class="info-value">{{ $registro->chofer->licencia ?? '' }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Placas -->
    <div class="section">
        <div class="section-title">Placas de Vehículos</div>
        <div class="two-columns">
            <div class="column">
                <div class="info-row">
                    <div class="info-label">Placa N° 1:</div>
                    <div class="info-value">{{ $registro->placa1->numero_placa ?? '' }}
                        ({{ $registro->placa1->tipo_vehiculo ?? '' }})</div>
                </div>
            </div>
            <div class="column">
                <div class="info-row">
                    <div class="info-label">Placa N° 2:</div>
                    <div class="info-value">{{ $registro->placa2->numero_placa ?? '' }}
                        ({{ $registro->placa2->tipo_vehiculo ?? '' }})</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Detalles de Carga -->
    <div class="section">
        <div class="section-title">Detalles de Carga</div>
        <table class="tabla-detalles">
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    {{-- <th>Material</th> --}}
                </tr>
            </thead>
            <tbody>
                @if ($registro->descripcionJaba1)
                    <tr>
                        <td>Jaba 1</td>
                        <td>{{ $registro->descripcionJaba1->descripcion }}</td>
                        <td>{{ $registro->cantidad_jabas_1 }}</td>
                        {{-- <td>{{ $registro->descripcionJaba1->material ?? '' }}</td> --}}
                    </tr>
                @endif
                @if ($registro->descripcionJaba2)
                    <tr>
                        <td>Jaba 2</td>
                        <td>{{ $registro->descripcionJaba2->descripcion }}</td>
                        <td>{{ $registro->cantidad_jabas_2 }}</td>
                        {{-- <td>{{ $registro->descripcionJaba2->material ?? '' }}</td> --}}
                    </tr>
                @endif
                <tr>
                    <td colspan="1" style="font-weight: bold; text-align: left;">Total Parihuelas:</td>
                    <td colspan="2">{{ $registro->cantidad_parihuelas ?? 0 }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Observaciones -->
    @if ($registro->observaciones)
        <div class="section">
            <div class="section-title">Observaciones</div>
            <div style="padding: 10px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
                {{ $registro->observaciones }}
            </div>
        </div>
    @endif

    <!-- Motivo de Rechazo -->
    @if ($registro->estado === 'rechazado' && $registro->motivo_rechazo)
        <div class="section">
            <div class="section-title" style="background-color: #e74c3c;">Motivo de Rechazo</div>
            <div style="padding: 10px; background-color: #fadbd8; border-left: 4px solid #e74c3c; color: #c0392b;">
                {{ $registro->motivo_rechazo }}
            </div>
        </div>
    @endif

    <!-- Firmas -->
    <div class="section">
        <div class="section-title">Firmas Digitales</div>
        <div class="two-columns">
            <div class="column">
                <div class="firma-container">
                    @if ($registro->firma_entregado)
                        <img src="{{ $registro->firma_entregado }}" class="firma-img" alt="Firma Entregado">
                    @else
                        <p style="color: #95a5a6; font-style: italic;">Sin firma</p>
                    @endif
                    <div class="firma-label">Firma del Registrador</div>
                    @if ($registro->usuario)
                        <div style="margin-top: 5px; font-weight: bold;">{{ $registro->usuario->name }}</div>
                    @endif
                </div>
            </div>
            <div class="column">
                <div class="firma-container">
                    @if ($registro->firma_representante)
                        <img src="{{ $registro->firma_representante }}" class="firma-img" alt="Firma Representante">
                        {{-- <img [src]="registro.firma_representante" alt="Firma Representante" class="firma-img"> --}}
                    @else
                        <p style="color: #95a5a6; font-style: italic;">Sin firma</p>
                    @endif
                    <div class="firma-label">Firma del Representante</div>
                    @if ($registro->representanteCliente)
                        <div style="margin-top: 5px; font-weight: bold;">{{ $registro->representanteCliente->nombre }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Información del Sistema -->
    <div class="section">
        <div class="section-title" style="background-color: #95a5a6;">Información del Sistema</div>
        <div class="two-columns">
            <div class="column">
                <div class="info-row">
                    <div class="info-label">Creado por:</div>
                    <div class="info-value">{{ $registro->usuario->name ?? 'Sistema' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Fecha de Creación:</div>
                    <div class="info-value">{{ $registro->created_at->format('d/m/Y H:i:s') }}</div>
                </div>
            </div>
            <div class="column">
                <div class="info-row">
                    <div class="info-label">Última Actualización:</div>
                    <div class="info-value">{{ $registro->updated_at->format('d/m/Y H:i:s') }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">PDF Generado:</div>
                    <div class="info-value">{{ $fecha_generacion }}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        Sistema de Control de Alquiler de Jabas y Parihuelas - Grupo Vanguard Internacional<br>
        Documento generado automáticamente el {{ $fecha_generacion }}
    </div>
</body>

</html>
