type Props = {
  isRotating: boolean
  setIsRotating: (value: boolean) => void
}

export const Controls = ({ isRotating, setIsRotating }: Props) => {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isRotating}
          onChange={() => setIsRotating(!isRotating)}
        />
        Rotate Cube
      </label>
    </div>
  )
}
