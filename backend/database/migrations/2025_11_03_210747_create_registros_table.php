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
        Schema::create('registros', function (Blueprint $table) {
            $table->id();
            $table->string('numero_registro')->unique()->comment('Número de registro único (2508-0001)');
            $table->date('fecha')->comment('Fecha del registro');
            $table->time('hora')->comment('Hora del registro');
            
            // Relaciones con tablas de mantenimiento
            $table->foreignId('cliente_id')->constrained('clientes')->comment('ID del cliente');
            $table->string('representante_cliente')->comment('Nombre del representante del cliente');
            $table->foreignId('chofer_id')->constrained('choferes')->comment('ID del chofer');
            $table->foreignId('placa_1_id')->nullable()->constrained('placas')->comment('ID de la placa 1');
            $table->foreignId('placa_2_id')->nullable()->constrained('placas')->comment('ID de la placa 2');
            $table->foreignId('descripcion_jaba_1_id')->nullable()->constrained('descripciones_jabas')->comment('ID descripción jaba 1');
            $table->foreignId('descripcion_jaba_2_id')->nullable()->constrained('descripciones_jabas')->comment('ID descripción jaba 2');
            
            // Cantidades
            $table->integer('cantidad_jabas_1')->default(0)->comment('Cantidad de jabas tipo 1');
            $table->integer('cantidad_jabas_2')->nullable()->comment('Cantidad de jabas tipo 2');
            $table->integer('cantidad_parihuelas')->default(0)->comment('Cantidad de parihuelas');
            
            // Campos adicionales
            $table->text('observaciones')->nullable()->comment('Observaciones del registro');
            $table->string('imagen_path')->nullable()->comment('Ruta de la imagen capturada');
            $table->text('firma_entregado')->nullable()->comment('Firma digital del entregado');
            $table->text('firma_representante')->nullable()->comment('Firma digital del representante');
            
            // Estado del documento
            $table->enum('estado', ['por_aprobar', 'aprobado', 'rechazado'])->default('por_aprobar')->comment('Estado del registro');
            $table->text('motivo_rechazo')->nullable()->comment('Motivo del rechazo');
            
            // Guía de remisión y PDF
            $table->string('guia_remision')->nullable()->comment('Número de guía de remisión');
            $table->string('pdf_path')->nullable()->comment('Ruta del PDF adjunto');
            
            // Usuario que registra
            $table->foreignId('user_id')->constrained('users')->comment('Usuario que crea el registro');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices para búsquedas rápidas
            $table->index('numero_registro');
            $table->index('fecha');
            $table->index('estado');
            $table->index('cliente_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registros');
    }
};
