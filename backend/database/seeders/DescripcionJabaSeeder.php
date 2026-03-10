<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DescripcionJaba;

class DescripcionJabaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $descripciones = [
            [
                'codigo' => 'JB-001',
                'descripcion' => 'Jaba Plástica Grande - 60x40x30 cm',
                'capacidad' => 25.0,
                'material' => 'Plástico HDPE',
                'activo' => true,
            ],
            [
                'codigo' => 'JB-002',
                'descripcion' => 'Jaba Plástica Mediana - 50x35x25 cm',
                'capacidad' => 18.0,
                'material' => 'Plástico HDPE',
                'activo' => true,
            ],
            [
                'codigo' => 'JB-003',
                'descripcion' => 'Jaba Plástica Pequeña - 40x30x20 cm',
                'capacidad' => 12.0,
                'material' => 'Plástico HDPE',
                'activo' => true,
            ],
            [
                'codigo' => 'JB-004',
                'descripcion' => 'Jaba Ventilada para Frutas - 55x38x28 cm',
                'capacidad' => 20.0,
                'material' => 'Plástico con rejillas',
                'activo' => true,
            ],
            [
                'codigo' => 'JB-005',
                'descripcion' => 'Jaba Reforzada Industrial - 65x45x35 cm',
                'capacidad' => 30.0,
                'material' => 'Plástico reforzado',
                'activo' => true,
            ],
            [
                'codigo' => 'JB-006',
                'descripcion' => 'Jaba Apilable Estándar - 60x40x25 cm',
                'capacidad' => 22.0,
                'material' => 'Plástico HDPE',
                'activo' => true,
            ],
            [
                'codigo' => 'PR-001',
                'descripcion' => 'Parihuela Europea - 120x80 cm',
                'capacidad' => 1500.0,
                'material' => 'Madera tratada',
                'activo' => true,
            ],
            [
                'codigo' => 'PR-002',
                'descripcion' => 'Parihuela Americana - 120x100 cm',
                'capacidad' => 1800.0,
                'material' => 'Madera tratada',
                'activo' => true,
            ],
            [
                'codigo' => 'PR-003',
                'descripcion' => 'Parihuela Plástica - 120x80 cm',
                'capacidad' => 1200.0,
                'material' => 'Plástico reciclado',
                'activo' => true,
            ],
            [
                'codigo' => 'PR-004',
                'descripcion' => 'Parihuela Reforzada - 140x100 cm',
                'capacidad' => 2000.0,
                'material' => 'Madera reforzada',
                'activo' => true,
            ],
        ];

        foreach ($descripciones as $descripcion) {
            DescripcionJaba::create($descripcion);
        }
    }
}
