import { useParams } from 'react-router-dom'
import { PerfilPage } from './PerfilPage'

export function PerfilPublicoPage() {
  const { id } = useParams()
  return <PerfilPage userId={id} />
}
