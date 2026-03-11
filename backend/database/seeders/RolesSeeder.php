<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'nombre' => 'Administrador',
                'slug' => 'administrador',
                'descripcion' => 'Acceso completo: gestión de usuarios, auditoría, reservas y uso de camionetas',
                'permisos' => json_encode([
                    'reserva_camioneta' => true,
                    'uso_camioneta' => true,
                    'configuracion' => true,
                    'gestion_usuarios' => true,
                    'auditoria' => true,
                    'ver_todo' => true,
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'Personal',
                'slug' => 'personal',
                'descripcion' => 'Reservar y registrar uso de camionetas (solo datos propios)',
                'permisos' => json_encode([
                    'reserva_camioneta' => true,
                    'uso_camioneta' => true,
                    'configuracion' => false,
                    'gestion_usuarios' => false,
                    'auditoria' => false,
                    'ver_todo' => false,
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];

        DB::table('roles')->insert($roles);
    }
}
