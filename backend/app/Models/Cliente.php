<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'codigo',
        'nombre',
        'ruc',
        'direccion',
        'telefono',
        'email',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    /**
     * Relación con Registros
     */
    public function registros()
    {
        return $this->hasMany(Registro::class);
    }

    /**
     * Relación con Representantes
     */
    public function representantes()
    {
        return $this->hasMany(RepresentanteCliente::class);
    }

    /**
     * Obtener el representante activo
     */
    public function representanteActivo()
    {
        return $this->hasOne(RepresentanteCliente::class)->where('activo', true);
    }

    /**
     * Relación con Choferes
     */
    public function choferes()
    {
        return $this->hasMany(Chofer::class);
    }

    /**
     * Scope para clientes activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
