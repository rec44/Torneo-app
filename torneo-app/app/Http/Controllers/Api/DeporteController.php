<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeporteRequest;
use App\Http\Requests\UpdateDeporteRequest;
use App\Http\Resources\DeporteResource;
use App\Models\Deporte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class DeporteController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DeporteResource::collection(Deporte::all()));
    }

    public function store(StoreDeporteRequest $request): JsonResponse
    {
        $deporte = Deporte::create($request->validated());

        return (new DeporteResource($deporte))->response()->setStatusCode(201);
    }

    public function show(Deporte $deporte): JsonResponse|JsonResource
    {
        return new DeporteResource($deporte);
    }

    public function update(UpdateDeporteRequest $request, Deporte $deporte): JsonResponse|JsonResource
    {
        $deporte->update($request->validated());

        return new DeporteResource($deporte);
    }

    public function destroy(Deporte $deporte): JsonResponse
    {
        $deporte->delete();

        return response()->json(null, 204);
    }

    public function restaurar(int $id): JsonResponse|JsonResource
    {
        $deporte = Deporte::withTrashed()->findOrFail($id);
        $deporte->restore();

        return new DeporteResource($deporte);
    }
}
