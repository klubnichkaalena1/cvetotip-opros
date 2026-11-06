import { PreviewPhoto } from './SamplePhotos'

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
      <span className="option-label">{label}</span>
    </div>
  )
}
