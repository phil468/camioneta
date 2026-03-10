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
                'descripcion' => 'Acceso completo a todas las funcionalidades del sistema',
                'permisos' => json_encode([
                    'crear_registro' => true,
                    'ver_registros' => true,
                    'aprobar_registro' => true,
                    'rechazar_registro' => true,
                    'adjuntar_guia' => true,
                    'configuracion' => true,
                    'exportar_excel' => true,
                    'generar_pdf' => true,
                    'eliminar_registro' => true
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'Gestor de Recepción',
                'slug' => 'gestor_recepcion',
                'descripcion' => 'Crear registros de alquiler, ver listado y gestionar configuración',
                'permisos' => json_encode([
                    'crear_registro' => true,
                    'ver_registros' => true,
                    'aprobar_registro' => false,
                    'rechazar_registro' => false,
                    'adjuntar_guia' => false,
                    'configuracion' => true,
                    'exportar_excel' => true,
                    'generar_pdf' => true,
                    'eliminar_registro' => false
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'Auxiliar de Almacén',
                'slug' => 'auxiliar_almacen',
                'descripcion' => 'Ver registros y aprobar/rechazar solicitudes',
                'permisos' => json_encode([
                    'crear_registro' => false,
                    'ver_registros' => true,
                    'aprobar_registro' => true,
                    'rechazar_registro' => true,
                    'adjuntar_guia' => false,
                    'configuracion' => false,
                    'exportar_excel' => true,
                    'generar_pdf' => true,
                    'eliminar_registro' => false
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'Jefe de Almacén',
                'slug' => 'jefe_almacen',
                'descripcion' => 'Ver registros y adjuntar guías de remisión',
                'permisos' => json_encode([
                    'crear_registro' => false,
                    'ver_registros' => true,
                    'aprobar_registro' => false,
                    'rechazar_registro' => false,
                    'adjuntar_guia' => true,
                    'configuracion' => false,
                    'exportar_excel' => true,
                    'generar_pdf' => true,
                    'eliminar_registro' => false
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('roles')->insert($roles);
    }
}
