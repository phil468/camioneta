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
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropUnique('clientes_codigo_unique');
        });
        
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('codigo')->nullable()->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropUnique('clientes_codigo_unique');
        });
        
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('codigo')->nullable(false)->unique()->change();
        });
    }
};
