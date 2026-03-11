<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
        ]);

        $this->command->info('✅ Datos iniciales creados exitosamente!');
        $this->command->info('   - Roles: 2 (Administrador, Personal)');
    }
}
