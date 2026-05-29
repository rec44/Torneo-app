import { useState, useEffect, useCallback } from 'react'
import { torneoService } from '../services/torneoService'

export function useTorneos(filtrosIniciales = {}) {
  const [torneos, setTorneos] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (params = filtrosIniciales) => {
    setLoading(true)
    setError(null)
    try {
      const data = await torneoService.getAll(params)
      setTorneos(data.data)
      setMeta({
        total: data.total,
        perPage: data.per_page,
        pagina: data.current_page,
        ultima: data.last_page,
      })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al cargar torneos')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar() }, [cargar])

  const crear = async (datos) => {
    const torneo = await torneoService.create(datos)
    await cargar()
    return torneo
  }

  const actualizar = async (id, datos) => {
    const torneo = await torneoService.update(id, datos)
    await cargar()
    return torneo
  }

  const eliminar = async (id) => {
    await torneoService.delete(id)
    await cargar()
  }

  const unirsePorCodigo = async (codigo) => {
    const result = await torneoService.unirsePorCodigo(codigo)
    await cargar()
    return result
  }

  return { torneos, meta, loading, error, cargar, crear, actualizar, eliminar, unirsePorCodigo }
}
