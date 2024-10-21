import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Color, Mesh } from "three"

type Props = {
  isRotating: boolean
}
export const RgbCube = ({ isRotating }: Props) => {
  const meshRef = useRef<Mesh | null>(null)

  useFrame(() => {
    if (meshRef.current && isRotating) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })

  const colors = [
    new Color("red"), // Right
    new Color("green"), // Left
    new Color("blue"), // Top
    new Color("yellow"), // Bottom
    new Color("cyan"), // Front
    new Color("magenta"), // Back
  ]

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      {colors.map((color, index) => (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          color={color}
        />
      ))}
    </mesh>
  )
}
