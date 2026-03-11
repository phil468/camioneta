<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChecklistItem;
use Illuminate\Http\Request;

class ChecklistItemController extends Controller
{
    public function index()
    {
        $items = ChecklistItem::orderBy('orden')->orderBy('nombre')->get();
        return response()->json(['success' => true, 'data' => $items]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'orden' => 'nullable|integer',
        ]);

        $item = ChecklistItem::create($request->all());
        return response()->json(['success' => true, 'data' => $item], 201);
    }

    public function show($id)
    {
        $item = ChecklistItem::findOrFail($id);
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function update(Request $request, $id)
    {
        $item = ChecklistItem::findOrFail($id);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'orden' => 'nullable|integer',
        ]);

        $item->update($request->all());
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function destroy($id)
    {
        $item = ChecklistItem::findOrFail($id);
        $item->delete();
        return response()->json(['success' => true, 'message' => 'Item eliminado']);
    }

    public function activos()
    {
        $items = ChecklistItem::where('activo', true)->orderBy('orden')->orderBy('nombre')->get();
        return response()->json(['success' => true, 'data' => $items]);
    }
}
