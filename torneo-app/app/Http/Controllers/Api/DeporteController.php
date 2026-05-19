<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeporteRequest;
use App\Http\Requests\UpdateDeporteRequest;
use App\Models\Deporte;
use Illuminate\Http\JsonResponse;

class DeporteController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Deporte::all());
    }

    public function store(StoreDeporteRequest $request): JsonResponse
    {
        $deporte = Deporte::create($request->validated());

        return response()->json($deporte, 201);
    }

    public function show(Deporte $deporte): JsonResponse
    {
        return response()->json($deporte);
    }

    public function update(UpdateDeporteRequest $request, Deporte $deporte): JsonResponse
    {
        $deporte->update($request->validated());

        return response()->json($deporte);
    }

    public function destroy(Deporte $deporte): JsonResponse
    {
        $deporte->delete();

        return response()->json(null, 204);
    }
}
