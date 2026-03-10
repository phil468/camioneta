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
        Schema::create('representantes_clientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->string('nombre');
            $table->string('dni', 8)->nullable();
            $table->string('telefono')->nullable();
            $table->string('email')->nullable();
            $table->string('cargo')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        //Migrar los representantes existentes de la tabla registros
        DB::statement("
            INSERT INTO representantes_clientes (cliente_id, nombre, activo, created_at, updated_at)
            SELECT DISTINCT 
                cliente_id, 
                representante_cliente,
                true,
                NOW(),
                NOW()
            FROM registros 
            WHERE representante_cliente IS NOT NULL 
            AND representante_cliente != ''
            AND cliente_id IS NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representantes_clientes');
    }
};
