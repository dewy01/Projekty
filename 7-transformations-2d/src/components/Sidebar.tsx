import React, { useState } from "react"
import { Mode } from "../App"

interface SidebarProps {
  mode: Mode
  setMode: (mode: Mode) => void
  addPoint: (point: { x: number; y: number }) => void
  finalizeShape: () => void
  resetPoints: () => void
  clearShapes: () => void
  moveShapeByVector: (x: number, y: number) => void
  rotateShapeByAngle: (angle: number) => void
  scaleShapeByValue: (scale: number) => void
  saveShapes: () => void
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  mode,
  setMode,
  addPoint,
  finalizeShape,
  resetPoints,
  clearShapes,
  moveShapeByVector,
  rotateShapeByAngle,
  scaleShapeByValue,
  saveShapes,
  handleFileUpload,
}) => {
  const [x, setX] = useState<number | "">("")
  const [y, setY] = useState<number | "">("")
  const [moveX, setMoveX] = useState(0)
  const [moveY, setMoveY] = useState(0)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [scaleValue, setScaleValue] = useState(1)

  const handleAddPoint = () => {
    if (x !== "" && y !== "") {
      addPoint({ x: Number(x), y: Number(y) })
      setX("")
      setY("")
    }
  }

  const handleMove = () => {
    moveShapeByVector(moveX, moveY)
    setMoveX(0)
    setMoveY(0)
  }

  const handleRotate = () => {
    rotateShapeByAngle(rotationAngle)
    setRotationAngle(0)
  }

  const handleScale = () => {
    scaleShapeByValue(scaleValue)
    setScaleValue(1)
  }

  return (
    <div
      style={{
        maxHeight: "480px",
        width: "400px",
        padding: "15px",
        display: "flex",
        flexDirection: "column",

        boxSizing: "border-box",
      }}
    >
      {/* Main Layout */}
      <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
        {/* First Section: Shape Creator */}
        <div style={{ flex: "1", paddingRight: "20px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>
            Shape Creator
          </h3>
          <div style={{ marginBottom: "10px" }}>
            <label>Mode:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              style={{
                marginLeft: "10px",
                padding: "5px",
                width: "100%",
              }}
            >
              <option value="create">Create</option>
              <option value="move">Move</option>
              <option value="rotate">Rotate</option>
              <option value="scale">Scale</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>
              X:
              <input
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "5px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>
              Y:
              <input
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "5px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />
            </label>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "10px",
              marginTop: "10px",
            }}
          >
            <button
              onClick={handleAddPoint}
              style={{
                padding: "8px 12px",
                backgroundColor: "#4CAF50",

                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Add Point
            </button>
            <button
              onClick={resetPoints}
              style={{
                padding: "8px 12px",
                backgroundColor: "#f44336",

                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Reset Points
            </button>
            <button
              onClick={finalizeShape}
              style={{
                padding: "8px 12px",
                backgroundColor: "#2196F3",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Finalize Shape
            </button>
            <button
              onClick={clearShapes}
              style={{
                padding: "8px 12px",
                backgroundColor: "#9E9E9E",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Clear All Shapes
            </button>
          </div>
        </div>

        {/* Second Section: Transformations (Move, Rotate, Scale) */}
        <div style={{ flex: "1" }}>
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", marginBottom: "10px" }}>
              Move by Vector
            </h4>
            <input
              type="number"
              value={moveX}
              onChange={(e) => setMoveX(Number(e.target.value))}
              placeholder="X"
              style={{
                padding: "5px",
                width: "45%",
                marginBottom: "10px",
                boxSizing: "border-box",
              }}
            />
            <input
              type="number"
              value={moveY}
              onChange={(e) => setMoveY(Number(e.target.value))}
              placeholder="Y"
              style={{
                padding: "5px",
                width: "45%",
                marginBottom: "10px",
                marginLeft: "10px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleMove}
              style={{
                padding: "8px 12px",
                backgroundColor: "#FFC107",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
                width: "100%",
              }}
            >
              Move
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", marginBottom: "10px" }}>Rotate</h4>
            <input
              type="number"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(Number(e.target.value))}
              placeholder="Angle (degrees)"
              style={{
                padding: "5px",
                width: "100%",
                marginBottom: "10px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleRotate}
              style={{
                padding: "8px 12px",
                backgroundColor: "#FFC107",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
                width: "100%",
              }}
            >
              Rotate
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", marginBottom: "10px" }}>Scale</h4>
            <input
              type="number"
              value={scaleValue}
              onChange={(e) => setScaleValue(Number(e.target.value))}
              placeholder="Scale (e.g., 1.5)"
              style={{
                padding: "5px",
                width: "100%",
                marginBottom: "10px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleScale}
              style={{
                padding: "8px 12px",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
                width: "100%",
              }}
            >
              Scale
            </button>
          </div>
        </div>
      </div>

      {/* Third Section: Save/Load */}
      <div
        style={{
          marginTop: "20px",
          paddingTop: "10px",
        }}
      >
        <button
          onClick={saveShapes}
          style={{
            width: "100%",
            padding: "8px 12px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        >
          Save Shapes
        </button>
        <label style={{ display: "block", fontSize: "14px" }}>
          Load Shapes
          <input
            type="file"
            onChange={handleFileUpload}
            style={{
              display: "block",
              marginTop: "5px",
              fontSize: "14px",
              padding: "5px",
            }}
          />
        </label>
      </div>
    </div>
  )
}

export default Sidebar
