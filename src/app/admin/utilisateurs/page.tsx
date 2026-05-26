import { redirect } from 'next/navigation'

export default function AdminUtilisateursRedirect() {
  redirect('/admin?section=utilisateurs')
}
