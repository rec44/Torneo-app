import { useState, useEffect, useCallback } from 'react'
import { partidoService } from '../services/partidoService'

export function usePartidos(filtrosIniciales = {}) {
  const [partidos, setPartidos] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (params = filtrosIniciales) => {
    setLoading(true)
    setError(null)
    try {
      const data = await partidoService.getAll(params)
      setPartidos(data.data)
      setMeta({
        total: data.meta.total,
        perPage: data.meta.per_page,
        pagina: data.meta.current_page,
        ultima: data.meta.last_page,
      })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al cargar partidos')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar() }, [cargar])

  const actualizar = async (id, datos) => {
    const partido = await partidoService.update(id, datos)
    await cargar()
    return partido
  }

  const registrarResultado = async (id, datos) => {
    const partido = await partidoService.registrarResultado(id, datos)
    await cargar()
    return partido
  }

  const eliminar = async (id) => {
    await partidoService.delete(id)
    await cargar()
  }

  return { partidos, meta, loading, error, cargar, actualizar, registrarResultado, eliminar }
}
