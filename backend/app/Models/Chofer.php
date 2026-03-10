<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chofer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'choferes';

    protected $fillable = [
        'cliente_id',
        'placa_principal_id',
        'nombre',
        'dni',
        'licencia',
        'telefono',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Relación con registros
    public function registros()
    {
        return $this->hasMany(Registro::class);
    }

    // Relación con cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    // Relación con placa principal
    public function placaPrincipal()
    {
        return $this->belongsTo(Placa::class, 'placa_principal_id');
    }

    // Scope para choferes activos
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
