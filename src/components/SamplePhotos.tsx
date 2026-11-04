import { useState } from 'react'

type Props = {
  /** Один файл — три крупных плана (кожа, волосы, глаза и т.д.) */
  photo: string
  placeholderColor: string
  altHint: string
}

const CROP_POSITIONS = ['18% 42%', '50% 50%', '82% 55%'] as const

function SampleTile({
  src,
  position,
  failed,
  onFail,
  placeholderColor,
}: {
  src: string
  position: string
  failed: boolean
  onFail: () => void
  placeholderColor: string
}) {
  if (failed) {
    return (
      <div
        className="sample-tile sample-tile--placeholder"
        style={{ backgroundColor: placeholderColor }}
      />
    )
  }

  return (
    <img
      src={src}
      alt=""
      className="sample-tile"
      loading="lazy"
      style={{ objectPosition: position }}
      onError={onFail}
    />
  )
}

export function SamplePhotos({ photo, placeholderColor, altHint }: Props) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="sample-photos" aria-label={`Примеры: ${altHint}`}>
      {CROP_POSITIONS.map((position) => (
        <SampleTile
          key={position}
          src={photo}
          position={position}
          failed={failed}
          onFail={() => setFailed(true)}
          placeholderColor={placeholderColor}
        />
      ))}
    </div>
  )
}

export function PreviewPhoto({
  photo,
  placeholderColor,
}: Props) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="option-thumb" aria-hidden="true">
      {!failed ? (
        <img
          src={photo}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="option-thumb-placeholder"
          style={{ backgroundColor: placeholderColor }}
        />
      )}
    </div>
  )
}
