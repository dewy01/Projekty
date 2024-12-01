import React, { useState } from "react"
import Canvas from "./components/Canvas"
import Sidebar from "./components/Sidebar"
import { useShapes } from "./hooks/useShapes"

export type Mode = "create" | "move" | "rotate" | "scale"

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>("create")
  const {
    points,
    shapes,
    selectedShapeIndex,
    addPoint,
    finalizeShape,
    resetPoints,
    clearShapes,
    setSelectedShapeIdx,
    moveShape,
    clearShapeIndex,
    rotateShape,
    scaleShape,
  } = useShapes()

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Canvas
        mode={mode}
        points={points}
        shapes={shapes}
        addPoint={addPoint}
        setShapeIndex={setSelectedShapeIdx}
        moveShape={moveShape}
        clearShapeIndex={clearShapeIndex}
        selectedShapeIndex={selectedShapeIndex}
        rotateShape={rotateShape}
        scaleShape={scaleShape}
      />
      <Sidebar
        mode={mode}
        setMode={setMode}
        addPoint={addPoint}
        finalizeShape={finalizeShape}
        resetPoints={resetPoints}
        clearShapes={clearShapes}
      />
    </div>
  )
}

export default App
