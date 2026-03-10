<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SetUserPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:set-password {email : El email del usuario}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Establecer o cambiar la contraseña de un usuario existente';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("No se encontró un usuario con el email: {$email}");
            return 1;
        }

        $this->info("Usuario encontrado: {$user->name} ({$user->email})");

        $password = $this->secret('Ingrese la nueva contraseña (mínimo 6 caracteres)');

        if (strlen($password) < 6) {
            $this->error('La contraseña debe tener al menos 6 caracteres.');
            return 1;
        }

        $confirm = $this->secret('Confirme la contraseña');

        if ($password !== $confirm) {
            $this->error('Las contraseñas no coinciden.');
            return 1;
        }

        $user->password = Hash::make($password);
        $user->save();

        $this->info("Contraseña actualizada exitosamente para: {$user->email}");
        return 0;
    }
}
