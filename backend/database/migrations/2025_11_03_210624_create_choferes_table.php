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
        Schema::create('choferes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->comment('Nombre completo del chofer');
            $table->string('dni', 8)->unique()->comment('DNI del chofer');
            $table->string('licencia', 20)->nullable()->comment('Número de licencia de conducir');
            $table->string('telefono', 20)->nullable()->comment('Teléfono del chofer');
            $table->boolean('activo')->default(true)->comment('Estado del chofer');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('choferes');
    }
};
