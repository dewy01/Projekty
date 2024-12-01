import React, { useState } from "react"
import Canvas from "./components/Canvas"
import Sidebar from "./components/Sidebar"
import { useShapes } from "./hooks/useShapes"
import { calculateShapeCenter } from "./util/calculateShapeCenter"

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
    saveShapesToFile,
    handleFileUpload,
  } = useShapes()

  const moveShapeByVector = (dx: number, dy: number) => {
    if (selectedShapeIndex !== null) {
      moveShape(selectedShapeIndex, dx, dy)
    }
  }

  const rotateShapeByAngle = (angle: number) => {
    if (selectedShapeIndex !== null) {
      const center = calculateShapeCenter(shapes[selectedShapeIndex])
      rotateShape(selectedShapeIndex, angle, center)
    }
  }

  const scaleShapeByValue = (scale: number) => {
    if (selectedShapeIndex !== null) {
      const center = calculateShapeCenter(shapes[selectedShapeIndex])
      scaleShape(selectedShapeIndex, scale, center)
    }
  }

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
        moveShapeByVector={moveShapeByVector}
        rotateShapeByAngle={rotateShapeByAngle}
        scaleShapeByValue={scaleShapeByValue}
        saveShapes={saveShapesToFile}
        handleFileUpload={handleFileUpload}
      />
    </div>
  )
}

export default App
