<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsoChecklistRespuesta extends Model
{
    use HasFactory;

    protected $table = 'uso_checklist_respuestas';

    protected $fillable = [
        'uso_camioneta_id',
        'checklist_item_id',
        'respuesta',
        'foto',
        'comentario',
    ];

    protected $casts = [
        'respuesta' => 'boolean',
    ];

    public function usoCamioneta()
    {
        return $this->belongsTo(UsoCamioneta::class);
    }

    public function checklistItem()
    {
        return $this->belongsTo(ChecklistItem::class);
    }
}
