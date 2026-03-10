<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('descripciones_jabas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique()->comment('Código único de la jaba');
            $table->string('descripcion')->comment('Descripción del tipo de jaba');
            $table->string('color')->nullable()->comment('Color de la jaba');
            $table->string('material')->nullable()->comment('Material de la jaba');
            $table->decimal('capacidad', 8, 2)->nullable()->comment('Capacidad en kg');
            $table->boolean('activo')->default(true)->comment('Estado de la descripción');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('descripciones_jabas');
    }
};
