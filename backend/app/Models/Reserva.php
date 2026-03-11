<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Reserva extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'user_id',
        'camioneta_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'estado',
        'notas',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function camioneta()
    {
        return $this->belongsTo(Camioneta::class);
    }

    public function usoCamioneta()
    {
        return $this->hasOne(UsoCamioneta::class);
    }
}
