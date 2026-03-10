<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Chofer;

class ChoferSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $choferes = [
            [
                'nombre' => 'José Antonio Vargas Mendoza',
                'dni' => '42156789',
                'licencia' => 'A-IIb',
                'telefono' => '987123456',
                'activo' => true,
            ],
            [
                'nombre' => 'Miguel Ángel Torres Rojas',
                'dni' => '43567891',
                'licencia' => 'A-IIIb',
                'telefono' => '965432187',
                'activo' => true,
            ],
            [
                'nombre' => 'Carlos Eduardo Ramírez Paz',
                'dni' => '41234567',
                'licencia' => 'A-IIb',
                'telefono' => '978456123',
                'activo' => true,
            ],
            [
                'nombre' => 'Pedro Luis Castillo Vega',
                'dni' => '44789123',
                'licencia' => 'A-IIIb',
                'telefono' => '923456789',
                'activo' => true,
            ],
            [
                'nombre' => 'Roberto Carlos Flores Díaz',
                'dni' => '42987654',
                'licencia' => 'A-IIb',
                'telefono' => '956789321',
                'activo' => true,
            ],
            [
                'nombre' => 'Fernando José Sánchez Morales',
                'dni' => '43112233',
                'licencia' => 'A-IIIb',
                'telefono' => '912345678',
                'activo' => true,
            ],
            [
                'nombre' => 'Daniel Antonio Gutiérrez Silva',
                'dni' => '41998877',
                'licencia' => 'A-IIb',
                'telefono' => '934567891',
                'activo' => true,
            ],
            [
                'nombre' => 'Luis Alberto Paredes Cruz',
                'dni' => '44556677',
                'licencia' => 'A-IIIb',
                'telefono' => '945678912',
                'activo' => true,
            ],
        ];

        foreach ($choferes as $chofer) {
            Chofer::create($chofer);
        }
    }
}
