import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useState } from "react"
import "./App.css"
import { ColorConverter, Controls, RgbCubeWithSlice } from "./component"

function App() {
  const [isVisible, setIsVisible] = useState(true)
  const [clipPosition, setClipPosition] = useState(0)

  const containerStyle = {
    display: "flex",
    width: "100%",
    gap: "5rem",
  }

  const converterStyle = {
    flex: 1,
    padding: "20px",
  }

  const visualizationStyle = {
    flex: 1,
    padding: "20px",
  }

  return (
    <div className="App">
      <div style={containerStyle} className="flex-container">
        <div style={converterStyle} className="converter">
          <h2>RGB to CMYK Converter</h2>
          <ColorConverter />
        </div>
        <div style={visualizationStyle} className="visualization">
          <h2>RGB Cube</h2>
          <Canvas style={{ height: "500px" }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            <RgbCubeWithSlice
              isVisible={isVisible}
              clippingPlanePosition={clipPosition}
            />
            <OrbitControls />
          </Canvas>
          <Controls
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            clipPosition={clipPosition}
            setClipPosition={setClipPosition}
          />
        </div>
      </div>
    </div>
  )
}

export default App
