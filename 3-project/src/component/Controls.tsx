type Props = {
  isRotating: boolean
  setIsRotating: (value: boolean) => void
  clipPosition: number
  setClipPosition: (value: number) => void
}

export const Controls = ({
  isRotating,
  setIsRotating,
  clipPosition,
  setClipPosition,
}: Props) => {
  return (
    <div style={{ position: "relative", padding: "20px" }}>
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
      <div>
        <label>Clip Position: {clipPosition.toFixed(2)}</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={clipPosition}
          onChange={(e) => setClipPosition(parseFloat(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  )
}
