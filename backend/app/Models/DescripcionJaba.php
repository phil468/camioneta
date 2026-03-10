<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DescripcionJaba extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'descripciones_jabas';

    protected $fillable = [
        'cliente_id',
        'codigo',
        'descripcion',
        'color',
        'material',
        'capacidad',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'capacidad' => 'decimal:2',
    ];

    // Relación con cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    // Relaciones con registros (descripción 1 y 2)
    public function registrosDescripcion1()
    {
        return $this->hasMany(Registro::class, 'descripcion_jaba_1_id');
    }

    public function registrosDescripcion2()
    {
        return $this->hasMany(Registro::class, 'descripcion_jaba_2_id');
    }

    // Scope para descripciones activas
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    // Scope para descripciones por cliente
    public function scopePorCliente($query, $clienteId)
    {
        return $query->where('cliente_id', $clienteId);
    }
}
