<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cliente;
use App\Models\RepresentanteCliente;

class RepresentanteClienteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clientes = Cliente::all();

        $representantesData = [
            [
                'nombre' => 'Juan Carlos Mendoza',
                'dni' => '12345678',
                'telefono' => '987654321',
                'email' => 'jmendoza@empresa.com',
                'cargo' => 'Gerente General',
                'activo' => true,
            ],
            [
                'nombre' => 'María Elena Torres',
                'dni' => '87654321',
                'telefono' => '987123456',
                'email' => 'mtorres@empresa.com',
                'cargo' => 'Jefa de Logística',
                'activo' => false,
            ],
            [
                'nombre' => 'Carlos Alberto Ramírez',
                'dni' => '45678912',
                'telefono' => '965432178',
                'email' => 'cramirez@empresa.com',
                'cargo' => 'Supervisor de Almacén',
                'activo' => true,
            ],
            [
                'nombre' => 'Ana Patricia Díaz',
                'dni' => '78912345',
                'telefono' => '912345678',
                'email' => 'adiaz@empresa.com',
                'cargo' => 'Coordinadora de Despachos',
                'activo' => false,
            ],
            [
                'nombre' => 'Roberto Sánchez López',
                'dni' => '32165498',
                'telefono' => '998877665',
                'email' => 'rsanchez@empresa.com',
                'cargo' => 'Asistente Administrativo',
                'activo' => true,
            ],
        ];

        foreach ($clientes as $index => $cliente) {
            // Crear 2-3 representantes por cliente
            $numRepresentantes = rand(2, 3);
            
            for ($i = 0; $i < $numRepresentantes; $i++) {
                $repData = $representantesData[($index + $i) % count($representantesData)];
                
                // Solo el primero será activo
                RepresentanteCliente::create([
                    'cliente_id' => $cliente->id,
                    'nombre' => $repData['nombre'],
                    'dni' => $repData['dni'],
                    'telefono' => $repData['telefono'],
                    'email' => $repData['email'],
                    'cargo' => $repData['cargo'],
                    'activo' => $i === 0, // Solo el primero activo
                ]);
            }
        }

        $this->command->info('Representantes de clientes creados correctamente.');
    }
}
