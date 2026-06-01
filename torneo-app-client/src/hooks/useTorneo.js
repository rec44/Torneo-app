import { useState, useCallback } from 'react'
import { torneoService } from '../services/torneoService'

export function useTorneo() {
  const [torneo, setTorneo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const data = await torneoService.getById(id)
      setTorneo(data)
      return data
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al cargar el torneo')
    } finally {
      setLoading(false)
    }
  }, [])

  const unirse = async (id) => {
    const result = await torneoService.unirse(id)
    await cargar(id)
    return result
  }

  const iniciar = async (id) => {
    const result = await torneoService.iniciar(id)
    await cargar(id)
    return result
  }

  const crearInvitacion = async (id, datos) => {
    return torneoService.crearInvitacion(id, datos)
  }

  const eliminar = async (id) => {
    return torneoService.delete(id)
  }

  return { torneo, loading, error, cargar, unirse, iniciar, crearInvitacion, eliminar }
}
