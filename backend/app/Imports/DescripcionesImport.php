<?php

namespace App\Imports;

use App\Models\DescripcionJaba;
use App\Models\Cliente;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DescripcionesImport implements ToCollection, WithHeadingRow
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
                if (empty($row['codigo'])) {
                    $this->errors[] = "Fila {$rowNumber}: El código es obligatorio";
                    continue;
                }

                if (empty($row['descripcion_de_jabas'])) {
                    $this->errors[] = "Fila {$rowNumber}: La descripción es obligatoria";
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

                $codigo = trim($row['codigo']);
                $descripcion = trim($row['descripcion_de_jabas']);

                // Buscar descripción existente por código
                $descripcionJaba = DescripcionJaba::withTrashed()->where('codigo', $codigo)->first();

                $data = [
                    'codigo' => $codigo,
                    'descripcion' => $descripcion,
                    'cliente_id' => $cliente?->id,
                    'activo' => true,
                ];

                if ($descripcionJaba) {
                    // Restaurar si estaba eliminado
                    if ($descripcionJaba->trashed()) {
                        $descripcionJaba->restore();
                    }
                    $descripcionJaba->update($data);
                    $this->updated++;
                } else {
                    DescripcionJaba::create($data);
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
