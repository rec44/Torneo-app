import { useParams } from 'react-router-dom'
import { PerfilPage } from './PerfilPage/PerfilPage'

export function PerfilPublicoPage() {
  const { id } = useParams()
  return <PerfilPage userId={id} />
}
