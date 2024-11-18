import React from "react"
import CanvasView from "./components/CanvasView"
import ControlPanel from "./components/ControlPanel"
import { useBezier } from "./hooks/useBezier"

const App: React.FC = () => {
  const bezier = useBezier()

  return (
    <div
      style={{
        width: "90vw",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "5vh",
      }}
    >
      <h1>Bézier Curve Drawer</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "space-between",
          justifyContent: "center",
          gap: "4vw",
        }}
      >
        <CanvasView
          points={bezier.points}
          mode={bezier.mode}
          addPoint={bezier.addPoint}
          draggingPoint={bezier.draggingPoint}
          startDragging={bezier.startDragging}
          dragPoint={bezier.dragPoint}
          stopDragging={bezier.stopDragging}
          draggedPoint={bezier.draggedPoint}
        />
        <ControlPanel
          points={bezier.points}
          setPoints={bezier.setPoints}
          mode={bezier.mode}
          setMode={bezier.setMode}
          draggedPoint={bezier.draggedPoint}
        />
      </div>
    </div>
  )
}

export default App
