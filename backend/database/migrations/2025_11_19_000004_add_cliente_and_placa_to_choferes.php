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
        Schema::table('choferes', function (Blueprint $table) {
            // Agregar relación con cliente
            $table->foreignId('cliente_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('clientes')
                  ->nullOnDelete()
                  ->comment('Cliente al que pertenece el chofer');
            
            // Agregar relación con placa principal
            $table->foreignId('placa_principal_id')
                  ->nullable()
                  ->after('cliente_id')
                  ->constrained('placas')
                  ->nullOnDelete()
                  ->comment('Placa principal asignada al chofer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('choferes', function (Blueprint $table) {
            $table->dropForeign(['cliente_id']);
            $table->dropForeign(['placa_principal_id']);
            $table->dropColumn(['cliente_id', 'placa_principal_id']);
        });
    }
};
