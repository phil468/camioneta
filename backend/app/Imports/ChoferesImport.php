<?php

namespace App\Imports;

use App\Models\Chofer;
use App\Models\Placa;
use App\Models\Cliente;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ChoferesImport implements ToCollection, WithHeadingRow
{
    protected $errors = [];
    protected $imported = 0;
    protected $updated = 0;

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            try {
                $rowNumber = $index + 2; // +2 porque el índice empieza en 0 y hay header

                // Validar campos requeridos
                if (empty($row['chofer'])) {
                    $this->errors[] = "Fila {$rowNumber}: El nombre del chofer es obligatorio";
                    continue;
                }

                if (empty($row['dni'])) {
                    $this->errors[] = "Fila {$rowNumber}: El DNI es obligatorio";
                    continue;
                }

                // Validar formato DNI (8 dígitos)
                $dni = trim($row['dni']);
                if (!preg_match('/^\d{8}$/', $dni)) {
                    $this->errors[] = "Fila {$rowNumber}: DNI inválido (debe tener 8 dígitos)";
                    continue;
                }

                // Buscar o crear cliente
                $cliente = null;
                if (!empty($row['cliente'])) {
                    $cliente = Cliente::where('nombre', 'like', '%' . trim($row['cliente']) . '%')->first();
                    
                    if (!$cliente) {
                        // Crear cliente si no existe
                        $cliente = Cliente::create([
                            'nombre' => trim($row['cliente']),
                            'activo' => true,
                        ]);
                    }
                }

                // Buscar o crear placa
                $placa = null;
                if (!empty($row['placa'])) {
                    $placaNumero = strtoupper(trim($row['placa']));
                    $placa = Placa::where('numero_placa', $placaNumero)->first();
                    
                    if (!$placa) {
                        // Crear placa si no existe
                        $placa = Placa::create([
                            'numero_placa' => $placaNumero,
                            'activo' => true,
                        ]);
                    }
                }

                // Buscar chofer existente por DNI
                $chofer = Chofer::withTrashed()->where('dni', $dni)->first();

                $data = [
                    'nombre' => trim($row['chofer']),
                    'dni' => $dni,
                    'cliente_id' => $cliente?->id,
                    'placa_principal_id' => $placa?->id,
                    'activo' => true,
                ];

                if ($chofer) {
                    // Restaurar si estaba eliminado
                    if ($chofer->trashed()) {
                        $chofer->restore();
                    }
                    $chofer->update($data);
                    $this->updated++;
                } else {
                    Chofer::create($data);
                    $this->imported++;
                }

            } catch (\Exception $e) {
                $this->errors[] = "Fila {$rowNumber}: " . $e->getMessage();
            }
        }
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getImported()
    {
        return $this->imported;
    }

    public function getUpdated()
    {
        return $this->updated;
    }
}
