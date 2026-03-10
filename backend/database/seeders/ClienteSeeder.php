<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cliente;

class ClienteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clientes = [
            [
                'codigo' => 'CLI-001',
                'nombre' => 'Corporación Agroindustrial San Juan S.A.C.',
                'ruc' => '20123456789',
                'direccion' => 'Av. Los Frutales 234, La Molina',
                'telefono' => '987654321',
                'email' => 'compras@sanjuan.com.pe',
                'activo' => true,
            ],
            [
                'codigo' => 'CLI-002',
                'nombre' => 'Distribuidora de Alimentos del Norte E.I.R.L.',
                'ruc' => '20987654321',
                'direccion' => 'Jr. Comercio 567, Trujillo',
                'telefono' => '944556677',
                'email' => 'logistica@dalnorte.com',
                'activo' => true,
            ],
            [
                'codigo' => 'CLI-003',
                'nombre' => 'Exportadora de Productos Frescos S.A.',
                'ruc' => '20456789123',
                'direccion' => 'Carretera Panamericana Km 102, Ica',
                'telefono' => '956789123',
                'email' => 'operaciones@exprofrescos.pe',
                'activo' => true,
            ],
            [
                'codigo' => 'CLI-004',
                'nombre' => 'Agroexportaciones del Pacífico S.A.C.',
                'ruc' => '20789456123',
                'direccion' => 'Av. Industrial 890, Chiclayo',
                'telefono' => '923456789',
                'email' => 'agropacifico@export.com',
                'activo' => true,
            ],
            [
                'codigo' => 'CLI-005',
                'nombre' => 'Comercializadora Peruana de Frutas S.R.L.',
                'ruc' => '20321654987',
                'direccion' => 'Calle Los Exportadores 145, Lima',
                'telefono' => '912345678',
                'email' => 'ventas@perfrutas.com.pe',
                'activo' => true,
            ],
        ];

        foreach ($clientes as $cliente) {
            Cliente::create($cliente);
        }
    }
}
