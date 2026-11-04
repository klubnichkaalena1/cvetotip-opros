import { PreviewPhoto, SamplePhotos } from './SamplePhotos'

type Props = {
  photo: string
  placeholderColor: string
  label: string
}

export function OptionVisual({ photo, placeholderColor, label }: Props) {
  return (
    <div className="option-visual">
      <PreviewPhoto
        photo={photo}
        placeholderColor={placeholderColor}
        altHint={label}
      />
      <div className="option-body">
        <span className="option-label">{label}</span>
        <span className="samples-caption">Примеры оттенков</span>
        <SamplePhotos
          photo={photo}
          placeholderColor={placeholderColor}
          altHint={label}
        />
      </div>
    </div>
  )
}
