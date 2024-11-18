import React, { useEffect, useRef } from "react"
import { Point } from "../hooks/useBezier"

interface CanvasViewProps {
  points: Point[]
  mode: "create" | "modify"
  addPoint: (point: Point) => void
  draggingPoint: number | null
  startDragging: (index: number) => void
  dragPoint: (point: Point) => void
  stopDragging: () => void
  draggedPoint: number | null
}

const bezierPoint = (t: number, points: Point[]): Point => {
  const n = points.length - 1

  const bernstein = (i: number, n: number, t: number): number => {
    const binomial = (n: number, k: number): number => {
      let res = 1
      for (let j = 1; j <= k; j++) {
        res *= (n - j + 1) / j
      }
      return res
    }
    return binomial(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i)
  }

  let x = 0,
    y = 0
  points.forEach((point, i) => {
    const b = bernstein(i, n, t)
    x += point.x * b
    y += point.y * b
  })

  return { x, y }
}

const CanvasView: React.FC<CanvasViewProps> = ({
  points,
  mode,
  addPoint,
  draggingPoint,
  startDragging,
  dragPoint,
  stopDragging,
  draggedPoint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "gray"
    ctx.lineWidth = 1
    for (let i = 0; i < points.length - 1; i++) {
      ctx.beginPath()
      ctx.moveTo(points[i].x, points[i].y)
      ctx.lineTo(points[i + 1].x, points[i + 1].y)
      ctx.stroke()
    }

    points.forEach((point, index) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = index === draggedPoint ? "green" : "blue"
      ctx.fill()
    })

    if (points.length > 1) {
      ctx.strokeStyle = "red"
      ctx.lineWidth = 2
      ctx.beginPath()

      const steps = 100
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const { x, y } = bezierPoint(t, points)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }
  }, [points])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (mode === "create") {
      addPoint({ x, y })
    } else if (mode === "modify") {
      const index = points.findIndex(
        (point) => Math.hypot(point.x - x, point.y - y) < 10
      )
      if (index !== -1) startDragging(index)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingPoint === null) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    dragPoint({ x, y })
  }

  const handleMouseUp = () => stopDragging()

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: "1px solid black" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}

export default CanvasView
