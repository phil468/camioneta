<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Placa extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero_placa',
        'tipo_vehiculo',
        'marca',
        'modelo',
        'anio',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'anio' => 'integer',
    ];

    // Relaciones con registros (placa 1 y placa 2)
    public function registrosPlaca1()
    {
        return $this->hasMany(Registro::class, 'placa_1_id');
    }

    public function registrosPlaca2()
    {
        return $this->hasMany(Registro::class, 'placa_2_id');
    }

    // Scope para placas activas
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }
}
