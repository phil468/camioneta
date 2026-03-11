<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Camioneta extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'nombre',
        'placa',
        'marca',
        'modelo',
        'anio',
        'color',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function usos()
    {
        return $this->hasMany(UsoCamioneta::class);
    }
}
