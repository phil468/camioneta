<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usos_camioneta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('camioneta_id')->constrained('camionetas');
            $table->foreignId('reserva_id')->nullable()->constrained('reservas');
            $table->dateTime('hora_inicio');
            $table->dateTime('hora_fin')->nullable();
            $table->enum('estado', ['en_uso', 'finalizado'])->default('en_uso');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usos_camioneta');
    }
};
