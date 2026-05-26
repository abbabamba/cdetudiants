import { redirect } from 'next/navigation'

export default function AdminCertificatsRedirect() {
  redirect('/admin?section=certificats')
}
