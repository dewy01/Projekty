import React, { useState } from "react"
import { Mode } from "../App"
import { Point, Shape } from "../hooks/useShapes"
import { calculateShapeCenter } from "../util/calculateShapeCenter"
import { isInsideShape } from "../util/isInsideShape"

interface CanvasProps {
  mode: Mode
  points: Point[]
  shapes: Shape[]
  addPoint: (point: Point) => void
  setShapeIndex: (index: number) => void
  moveShape: (dx: number, dy: number) => void
  clearShapeIndex: () => void
  selectedShapeIndex: number | null
  rotateShape: (shapeIndex: number, angle: number, center: Point) => void
  scaleShape: (shapeIndex: number, scale: number, center: Point) => void
}

const Canvas: React.FC<CanvasProps> = ({
  mode,
  points,
  shapes,
  addPoint,
  selectedShapeIndex,
  setShapeIndex,
  moveShape,
  clearShapeIndex,
  rotateShape,
  scaleShape,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<Point | null>(null)

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === "create") {
      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      addPoint({ x, y })
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (["move", "transform", "rotate", "scale"].includes(mode)) {
      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const mousePoint = { x, y }

      const shapeIndex = shapes.findIndex((shape) =>
        isInsideShape(mousePoint, shape.points)
      )

      if (shapeIndex !== -1) {
        setShapeIndex(shapeIndex)
        setIsDragging(true)
        setLastMousePos(mousePoint)
      } else {
        setIsDragging(false)
        clearShapeIndex()
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && lastMousePos && selectedShapeIndex !== null) {
      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const dx = x - lastMousePos.x
      const dy = y - lastMousePos.y

      if (mode === "move") {
        moveShape(dx, dy)
      } else if (mode === "rotate") {
        const center = calculateShapeCenter(shapes[selectedShapeIndex])
        const angle =
          Math.atan2(y - center.y, x - center.x) -
          Math.atan2(lastMousePos.y - center.y, lastMousePos.x - center.x)
        rotateShape(selectedShapeIndex, (angle * 180) / Math.PI, center)
      } else if (mode === "scale") {
        const center = calculateShapeCenter(shapes[selectedShapeIndex])
        const distancePrev = Math.hypot(
          lastMousePos.x - center.x,
          lastMousePos.y - center.y
        )
        const distanceCurr = Math.hypot(x - center.x, y - center.y)
        const scale = distanceCurr / distancePrev
        scaleShape(selectedShapeIndex, scale, center)
      }

      setLastMousePos({ x, y })
    }
  }

  const handleMouseUp = () => {
    if (["move", "transform", "rotate", "scale"].includes(mode)) {
      setIsDragging(false)
      clearShapeIndex()
    }
  }

  return (
    <div
      style={{
        width: "1000px",
        height: "500px",
        border: "1px solid black",
        position: "relative",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas
        width={1000}
        height={500}
        style={{ display: "block" }}
        onClick={handleCanvasClick}
      />
      {points.map((point, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: point.x - 5,
            top: point.y - 5,
            width: 10,
            height: 10,
            backgroundColor: "red",
            borderRadius: "50%",
          }}
        ></div>
      ))}
      {shapes.map((shape, index) => (
        <svg
          key={index}
          width={1000}
          height={500}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          <polygon
            points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="rgba(0, 0, 255, 0.3)"
            stroke="blue"
            strokeWidth={2}
          />
        </svg>
      ))}
    </div>
  )
}

export default Canvas
