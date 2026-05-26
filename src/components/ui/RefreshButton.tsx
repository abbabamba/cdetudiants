'use client'

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      style={{
        fontSize: '13px',
        color: '#92400E',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'underline',
        padding: 0,
      }}
    >
      Rafraîchir la page
    </button>
  )
}
