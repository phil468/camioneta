<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uso_checklist_respuestas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uso_camioneta_id')->constrained('usos_camioneta')->onDelete('cascade');
            $table->foreignId('checklist_item_id')->constrained('checklist_items');
            $table->boolean('respuesta')->default(true); // Sí = true, No = false
            $table->string('foto')->nullable(); // Path de la foto
            $table->text('comentario')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uso_checklist_respuestas');
    }
};
