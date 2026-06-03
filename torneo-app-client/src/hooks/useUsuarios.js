import { useState, useEffect, useCallback } from 'react'
import { usuarioService } from '../services/usuarioService'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await usuarioService.getAll(params)
      setUsuarios(data.data)
      setMeta({
        total: data.meta.total,
        perPage: data.meta.per_page,
        pagina: data.meta.current_page,
        ultima: data.meta.last_page,
      })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const actualizar = async (id, datos) => {
    const usuario = await usuarioService.update(id, datos)
    await cargar()
    return usuario
  }

  const eliminar = async (id) => {
    await usuarioService.delete(id)
    await cargar()
  }

  return { usuarios, meta, loading, error, cargar, actualizar, eliminar }
}
