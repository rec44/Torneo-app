import { useState, useCallback } from 'react'
import { equipoService } from '../services/equipoService'

export function useEquipos() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (torneoId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await equipoService.getByTorneo(torneoId)
      setEquipos(data)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al cargar equipos')
    } finally {
      setLoading(false)
    }
  }, [])

  const crearEquipo = async (torneoId, nombre) => {
    const data = await equipoService.create(torneoId, { nombre })
    await cargar(torneoId)
    return data
  }

  const unirse = async (torneoId, equipoId) => {
    const data = await equipoService.unirse(torneoId, equipoId)
    await cargar(torneoId)
    return data
  }

  const unirsePorCodigo = async (codigo) => {
    return equipoService.unirsePorCodigo(codigo)
  }

  const actualizar = async (torneoId, equipoId, nombre) => {
    const data = await equipoService.update(torneoId, equipoId, { nombre })
    await cargar(torneoId)
    return data
  }

  const getInvitacion = async (torneoId, equipoId) => {
    return equipoService.getInvitacion(torneoId, equipoId)
  }

  const crearInvitacion = async (torneoId, equipoId, datos) => {
    return equipoService.crearInvitacion(torneoId, equipoId, datos)
  }

  const eliminar = async (torneoId, equipoId) => {
    await equipoService.eliminar(torneoId, equipoId)
    await cargar(torneoId)
  }

  const expulsarMiembro = async (torneoId, equipoId, usuarioId) => {
    return equipoService.expulsarMiembro(torneoId, equipoId, usuarioId)
  }

  const toggleLock = async (torneoId, equipoId) => {
    return equipoService.toggleLock(torneoId, equipoId)
  }

  return { equipos, loading, error, cargar, crearEquipo, unirse, actualizar, unirsePorCodigo, getInvitacion, crearInvitacion, eliminar, expulsarMiembro, toggleLock }
}
