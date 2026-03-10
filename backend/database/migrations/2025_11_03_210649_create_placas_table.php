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
        Schema::create('placas', function (Blueprint $table) {
            $table->id();
            $table->string('numero_placa', 10)->unique()->comment('Número de placa del vehículo');
            $table->string('tipo_vehiculo')->nullable()->comment('Tipo de vehículo');
            $table->string('marca')->nullable()->comment('Marca del vehículo');
            $table->string('modelo')->nullable()->comment('Modelo del vehículo');
            $table->year('anio')->nullable()->comment('Año del vehículo');
            $table->boolean('activo')->default(true)->comment('Estado de la placa');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('placas');
    }
};
