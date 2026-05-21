import { useState, useEffect, useCallback } from 'react'
import { deporteService } from '../services/deporteService'

export function useDeportes() {
  const [deportes, setDeportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await deporteService.getAll()
      setDeportes(data)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al cargar deportes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = async (datos) => {
    const deporte = await deporteService.create(datos)
    await cargar()
    return deporte
  }

  const actualizar = async (id, datos) => {
    const deporte = await deporteService.update(id, datos)
    await cargar()
    return deporte
  }

  const eliminar = async (id) => {
    await deporteService.delete(id)
    await cargar()
  }

  return { deportes, loading, error, cargar, crear, actualizar, eliminar }
}
