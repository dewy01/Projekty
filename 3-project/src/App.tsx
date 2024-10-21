import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useState } from "react"
import "./App.css"
import { ColorConverter, Controls, RgbCube } from "./component"

function App() {
  const [isRotating, setIsRotating] = useState(true)

  return (
    <div className="App">
      <h1>Color Converter and RGB Cube</h1>
      <ColorConverter />
      <Canvas style={{ height: "500px" }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <RgbCube isRotating={isRotating} />
        <OrbitControls />
      </Canvas>
      <Controls isRotating={isRotating} setIsRotating={setIsRotating} />
    </div>
  )
}

export default App
