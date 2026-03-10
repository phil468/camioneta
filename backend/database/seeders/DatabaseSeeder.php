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
            ClienteSeeder::class,
            ChoferSeeder::class,
            PlacaSeeder::class,
            DescripcionJabaSeeder::class,
        ]);

        $this->command->info('✅ Datos de prueba creados exitosamente!');
        $this->command->info('   - Clientes: 5');
        $this->command->info('   - Choferes: 8');
        $this->command->info('   - Placas: 15');
        $this->command->info('   - Descripciones: 10');
    }
}
