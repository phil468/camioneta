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
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->nullable()->unique()->comment('Código único del cliente');
            $table->string('nombre')->comment('Nombre o razón social del cliente');
            $table->string('ruc', 11)->nullable()->comment('RUC del cliente');
            $table->string('direccion')->nullable()->comment('Dirección del cliente');
            $table->string('telefono', 20)->nullable()->comment('Teléfono de contacto');
            $table->string('email')->nullable()->comment('Email de contacto');
            $table->boolean('activo')->default(true)->comment('Estado del cliente');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
