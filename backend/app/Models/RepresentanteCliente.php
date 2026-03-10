<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepresentanteCliente extends Model
{
    use HasFactory;

    protected $table = 'representantes_clientes';

    protected $fillable = [
        'cliente_id',
        'nombre',
        'dni',
        'telefono',
        'email',
        'cargo',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    /**
     * Relación con Cliente
     */
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }
}
