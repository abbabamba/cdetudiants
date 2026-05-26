'use client'

interface Photo {
  url: string
  ordre: number
}

export function GaleriePhotos({ photos }: { photos: Photo[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: photos.length > 1 ? '1fr 1fr' : '1fr',
      gridTemplateRows: photos.length > 2 ? '1fr 1fr' : '1fr',
      gap: '8px',
      height: 'clamp(260px, 40vw, 400px)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Photo principale */}
      <div style={{
        gridRow: photos.length > 2 ? '1 / 3' : '1',
        position: 'relative', overflow: 'hidden',
      }}>
        <img
          src={photos[0].url}
          alt="Photo principale"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>

      {/* Photos secondaires */}
      {photos.slice(1, 3).map((photo, i) => (
        <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src={photo.url}
            alt={`Photo ${i + 2}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {i === 1 && photos.length > 3 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(26,45,79,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '16px', fontWeight: 700,
              backdropFilter: 'blur(2px)',
            }}>
              +{photos.length - 3} photos
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
