import { useState } from 'react'

type Props = {
  photo: string
  placeholderColor: string
  altHint: string
}

export function PreviewPhoto({
  photo,
  placeholderColor,
  altHint,
}: Props) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="option-thumb" aria-hidden="true">
      {!failed ? (
        <img
          src={photo}
          alt={altHint}
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
