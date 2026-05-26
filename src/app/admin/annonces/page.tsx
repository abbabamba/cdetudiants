import { redirect } from 'next/navigation'

export default function AdminAnnoncesRedirect() {
  redirect('/admin?section=annonces')
}
