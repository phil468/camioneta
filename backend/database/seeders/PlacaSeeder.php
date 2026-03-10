<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Placa;

class PlacaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $placas = [
            // Placas de camiones
            ['numero_placa' => 'AXB-789', 'tipo_vehiculo' => 'Camión', 'activo' => true],
            ['numero_placa' => 'BCD-123', 'tipo_vehiculo' => 'Camión', 'activo' => true],
            ['numero_placa' => 'CDE-456', 'tipo_vehiculo' => 'Camión', 'activo' => true],
            ['numero_placa' => 'DEF-789', 'tipo_vehiculo' => 'Camión', 'activo' => true],
            ['numero_placa' => 'EFG-234', 'tipo_vehiculo' => 'Camión', 'activo' => true],
            ['numero_placa' => 'FGH-567', 'tipo_vehiculo' => 'Camión', 'activo' => true],
            
            // Placas de furgonetas
            ['numero_placa' => 'GHI-890', 'tipo_vehiculo' => 'Furgoneta', 'activo' => true],
            ['numero_placa' => 'HIJ-345', 'tipo_vehiculo' => 'Furgoneta', 'activo' => true],
            ['numero_placa' => 'IJK-678', 'tipo_vehiculo' => 'Furgoneta', 'activo' => true],
            
            // Placas de camionetas
            ['numero_placa' => 'JKL-912', 'tipo_vehiculo' => 'Camioneta', 'activo' => true],
            ['numero_placa' => 'KLM-234', 'tipo_vehiculo' => 'Camioneta', 'activo' => true],
            ['numero_placa' => 'LMN-567', 'tipo_vehiculo' => 'Camioneta', 'activo' => true],
            
            // Más placas de camiones
            ['numero_placa' => 'MNO-890', 'tipo_vehiculo' => 'Camión', 'activo' => true],
            ['numero_placa' => 'NOP-123', 'tipo_vehiculo' => 'Camión', 'activo' => true],
            ['numero_placa' => 'OPQ-456', 'tipo_vehiculo' => 'Camión', 'activo' => true],
        ];

        foreach ($placas as $placa) {
            Placa::create($placa);
        }
    }
}
