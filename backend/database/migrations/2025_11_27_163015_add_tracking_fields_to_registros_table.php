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
            $table->string('serie_guia')->nullable()->after('guia_remision');
            $table->string('numero_guia')->nullable()->after('serie_guia');
            $table->unsignedBigInteger('aprobado_por')->nullable()->after('estado');
            $table->unsignedBigInteger('rechazado_por')->nullable()->after('aprobado_por');
            $table->timestamp('aprobado_en')->nullable()->after('aprobado_por');
            $table->timestamp('rechazado_en')->nullable()->after('rechazado_por');
            
            $table->foreign('aprobado_por')->references('id')->on('users')->onDelete('set null');
            $table->foreign('rechazado_por')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registros', function (Blueprint $table) {
            $table->dropForeign(['aprobado_por']);
            $table->dropForeign(['rechazado_por']);
            $table->dropColumn([
                'serie_guia',
                'numero_guia',
                'aprobado_por',
                'rechazado_por',
                'aprobado_en',
                'rechazado_en'
            ]);
        });
    }
};
