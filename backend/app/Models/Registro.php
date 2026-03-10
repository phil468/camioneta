<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Registro extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero_registro',
        'fecha',
        'hora',
        'cliente_id',
        // 'representante_cliente',
        'representante_cliente_id',
        'chofer_id',
        'placa_1_id',
        'placa_2_id',
        'descripcion_jaba_1_id',
        'descripcion_jaba_2_id',
        'cantidad_jabas_1',
        'cantidad_jabas_2',
        'cantidad_parihuelas',
        'observaciones',
        'imagen_path',
        'firma_entregado',
        'firma_representante',
        'estado',
        'motivo_rechazo',
        'guia_remision',
        'pdf_path',
        'user_id',
        'serie_guia',
        'numero_guia',
        'aprobado_por',
        'rechazado_por',
        'aprobado_en',
        'rechazado_en',
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime:H:i',
        'cantidad_jabas_1' => 'integer',
        'cantidad_jabas_2' => 'integer',
        'cantidad_parihuelas' => 'integer',
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function chofer()
    {
        return $this->belongsTo(Chofer::class);
    }

    public function placa1()
    {
        return $this->belongsTo(Placa::class, 'placa_1_id');
    }

    public function placa2()
    {
        return $this->belongsTo(Placa::class, 'placa_2_id');
    }

    public function descripcionJaba1()
    {
        return $this->belongsTo(DescripcionJaba::class, 'descripcion_jaba_1_id');
    }

    public function descripcionJaba2()
    {
        return $this->belongsTo(DescripcionJaba::class, 'descripcion_jaba_2_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function representanteCliente()
    {
        return $this->belongsTo(RepresentanteCliente::class, 'representante_cliente_id');
    }

    public function aprobadoPor()
    {
        return $this->belongsTo(User::class, 'aprobado_por');
    }

    public function rechazadoPor()
    {
        return $this->belongsTo(User::class, 'rechazado_por');
    }

    // Scopes
    public function scopePorAprobar($query)
    {
        return $query->where('estado', 'por_aprobar');
    }

    public function scopeAprobados($query)
    {
        return $query->where('estado', 'aprobado');
    }

    public function scopeRechazados($query)
    {
        return $query->where('estado', 'rechazado');
    }

    public function scopeFechaEntre($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
    }

    // Método para generar número de registro automático
    public static function generarNumeroRegistro()
    {
        $fecha = Carbon::now();
        $prefijo = $fecha->format('dmy'); // Formato: 2508 (día-mes)
        
        // Obtener el último registro del día
        $ultimoRegistro = self::whereDate('fecha', $fecha->toDateString())
            ->orderBy('numero_registro', 'desc')
            ->first();

        if ($ultimoRegistro) {
            // Extraer el número secuencial del último registro
            $partes = explode('-', $ultimoRegistro->numero_registro);
            $ultimoNumero = isset($partes[1]) ? intval($partes[1]) : 0;
            $nuevoNumero = $ultimoNumero + 1;
        } else {
            $nuevoNumero = 1;
        }

        // Formato: 2508-0001
        return $prefijo . '-' . str_pad($nuevoNumero, 4, '0', STR_PAD_LEFT);
    }

    // Accessors para el estado con color
    public function getEstadoColorAttribute()
    {
        switch($this->estado) {
            case 'por_aprobar':
                return 'white';
            case 'aprobado':
                return 'green';
            case 'rechazado':
                return 'red';
            default:
                return 'white';
        }
    }

    public function getEstadoTextoAttribute()
    {
        switch($this->estado) {
            case 'por_aprobar':
                return 'Por Aprobar';
            case 'aprobado':
                return 'Aprobado';
            case 'rechazado':
                return 'Rechazado';
            default:
                return 'Sin Estado';
        }
    }
}
