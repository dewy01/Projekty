import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  Plane,
  Vector3,
} from "three"

type Props = {
  isRotating: boolean
  clippingPlanePosition: number
}

export const RgbCube = ({ isRotating, clippingPlanePosition }: Props) => {
  const meshRef = useRef<Mesh | null>(null)

  const clippingPlane = new Plane(new Vector3(1, 0, 0), clippingPlanePosition)

  useFrame(() => {
    if (meshRef.current && isRotating) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })

  const getColorForVertex = (position: Vector3) => {
    const xNorm = (position.x + 1) / 2
    const yNorm = (position.y + 1) / 2
    const zNorm = (position.z + 1) / 2

    return new Color(xNorm, yNorm, zNorm)
  }

  const applyVertexColors = (geometry: BufferGeometry) => {
    const positionAttr = geometry.attributes.position
    const colorsArray: number[] = []

    for (let i = 0; i < positionAttr.count; i++) {
      const position = new Vector3().fromBufferAttribute(positionAttr, i)
      const color = getColorForVertex(position)
      colorsArray.push(color.r, color.g, color.b)
    }

    geometry.setAttribute("color", new Float32BufferAttribute(colorsArray, 3))
  }

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} onUpdate={applyVertexColors} />
      <meshStandardMaterial
        clippingPlanes={[clippingPlane]}
        vertexColors={true}
        emissiveIntensity={0.5}
        transparent={false}
        depthWrite={true}
        clipShadows={true}
        side={DoubleSide}
      />
    </mesh>
  )
}
