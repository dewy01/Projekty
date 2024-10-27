type Props = {
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  clipPosition: number
  setClipPosition: (value: number) => void
}

export const Controls = ({
  isVisible,
  setIsVisible,
  clipPosition,
  setClipPosition,
}: Props) => {
  return (
    <div style={{ position: "relative", padding: "20px" }}>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isVisible}
            onChange={() => setIsVisible(!isVisible)}
          />
          Show Cube
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
