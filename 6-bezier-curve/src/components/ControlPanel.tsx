import React, { useState } from "react"
import { Point } from "../hooks/useBezier"

interface ControlPanelProps {
  points: Point[]
  setPoints: (points: Point[]) => void
  mode: "create" | "modify"
  setMode: (mode: "create" | "modify") => void
  draggedPoint: number | null
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  points,
  setPoints,
  mode,
  setMode,
  draggedPoint,
}) => {
  const [newPoint, setNewPoint] = useState<Point>({ x: 0, y: 0 })

  const handleAddPoint = () => {
    setPoints([...points, newPoint])
    setNewPoint({ x: 0, y: 0 })
  }

  const handleEditDraggedPoint = (axis: "x" | "y", value: number) => {
    if (draggedPoint !== null) {
      setPoints(
        points.map((point, index) =>
          index === draggedPoint ? { ...point, [axis]: value } : point
        )
      )
    }
  }

  return (
    <div>
      <h3>Control Panel</h3>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => setMode("create")} disabled={mode === "create"}>
          Create
        </button>
        <button onClick={() => setMode("modify")} disabled={mode === "modify"}>
          Modify
        </button>
        <button onClick={() => setPoints([])} disabled={points.length === 0}>
          Clear
        </button>
      </div>
      <>
        <h4>Add New Point</h4>
        X:{" "}
        <input
          type="number"
          value={newPoint.x}
          onChange={(e) =>
            setNewPoint({ ...newPoint, x: parseFloat(e.target.value) })
          }
        />{" "}
        Y:{" "}
        <input
          type="number"
          value={newPoint.y}
          onChange={(e) =>
            setNewPoint({ ...newPoint, y: parseFloat(e.target.value) })
          }
        />{" "}
        <button onClick={handleAddPoint}>Add Point</button>
      </>
      <>
        <div>
          <h4>Currently Modified Point</h4>
          X:{" "}
          <input
            disabled={draggedPoint === null}
            type="number"
            value={points[draggedPoint!]?.x ?? ""}
            onChange={(e) =>
              handleEditDraggedPoint("x", parseFloat(e.target.value))
            }
          />{" "}
          Y:{" "}
          <input
            disabled={draggedPoint === null}
            type="number"
            value={points[draggedPoint!]?.y ?? ""}
            onChange={(e) =>
              handleEditDraggedPoint("y", parseFloat(e.target.value))
            }
          />
        </div>
      </>

      <h4>Control Points</h4>
      <div
        style={{
          maxHeight: "200px",
          overflow: "auto",
        }}
      >
        {points.map((point, index) => (
          <div key={index}>
            Point {index}: X:{" "}
            <input
              type="number"
              value={point.x}
              onChange={(e) =>
                setPoints(
                  points.map((p, i) =>
                    i === index ? { ...p, x: parseFloat(e.target.value) } : p
                  )
                )
              }
            />{" "}
            Y:{" "}
            <input
              type="number"
              value={point.y}
              onChange={(e) =>
                setPoints(
                  points.map((p, i) =>
                    i === index ? { ...p, y: parseFloat(e.target.value) } : p
                  )
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ControlPanel
