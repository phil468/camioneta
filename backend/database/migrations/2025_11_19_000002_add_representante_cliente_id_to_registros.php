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
        Schema::table('registros', function (Blueprint $table) {
            // Agregar nueva columna para el ID del representante
            $table->foreignId('representante_cliente_id')
                  ->nullable()
                  ->after('cliente_id')
                  ->constrained('representantes_clientes')
                  ->nullOnDelete()
                  ->comment('ID del representante del cliente');
            
            // Hacer nullable el campo antiguo (se mantendrá por compatibilidad)
            $table->string('representante_cliente')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registros', function (Blueprint $table) {
            $table->dropForeign(['representante_cliente_id']);
            $table->dropColumn('representante_cliente_id');
            $table->string('representante_cliente')->nullable(false)->change();
        });
    }
};
