import React, { useState } from "react"
import { Mode } from "../App"

interface SidebarProps {
  mode: Mode
  setMode: (mode: Mode) => void
  addPoint: (point: { x: number; y: number }) => void
  finalizeShape: () => void
  resetPoints: () => void
  clearShapes: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  mode,
  setMode,
  addPoint,
  finalizeShape,
  resetPoints,
  clearShapes,
}) => {
  const [x, setX] = useState<number | "">("")
  const [y, setY] = useState<number | "">("")

  const handleAddPoint = () => {
    if (x !== "" && y !== "") {
      addPoint({ x: Number(x), y: Number(y) })
      setX("")
      setY("")
    }
  }

  return (
    <div
      style={{
        maxHeight: "480px",
        padding: "10px",
        border: "1px solid black",
      }}
    >
      <h3>Shape Creator</h3>
      <div>
        <label>Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="create">Create</option>
          <option value="move">Move</option>
          <option value="rotate">rotate</option>
          <option value="scale">scale</option>
        </select>
      </div>
      <div>
        <label>
          X:
          <input
            type="number"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Y:
          <input
            type="number"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
          />
        </label>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "10px",
        }}
      >
        <button onClick={handleAddPoint} style={{ marginLeft: "10px" }}>
          Add Point
        </button>
        <button onClick={resetPoints} style={{ marginLeft: "10px" }}>
          Reset Points
        </button>
        <button onClick={finalizeShape} style={{ marginLeft: "10px" }}>
          Finalize Shape
        </button>
        <button onClick={clearShapes} style={{ marginLeft: "10px" }}>
          Clear All Shapes
        </button>
      </div>
    </div>
  )
}

export default Sidebar
