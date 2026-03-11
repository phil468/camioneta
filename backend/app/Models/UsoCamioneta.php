<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class UsoCamioneta extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $table = 'usos_camioneta';

    protected $fillable = [
        'user_id',
        'camioneta_id',
        'reserva_id',
        'hora_inicio',
        'hora_fin',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function camioneta()
    {
        return $this->belongsTo(Camioneta::class);
    }

    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }

    public function checklistRespuestas()
    {
        return $this->hasMany(UsoChecklistRespuesta::class);
    }
}
