import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
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
  isVisible: boolean
  clippingPlanePosition: number
}

const CUBE_SIZE = 2

export const RgbCube = ({ isVisible, clippingPlanePosition }: Props) => {
  const meshRef = useRef<Mesh | null>(null)

  const clippingPlane = new Plane(new Vector3(1, 0, 0), clippingPlanePosition)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.visible = isVisible
    }
  })

  const getColorForVertex = (position: Vector3) => {
    const xNorm = (position.x + CUBE_SIZE / 2) / CUBE_SIZE
    const yNorm = (position.y + CUBE_SIZE / 2) / CUBE_SIZE
    const zNorm = (position.z + CUBE_SIZE / 2) / CUBE_SIZE

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
      <boxGeometry
        args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]}
        onUpdate={applyVertexColors}
      />
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

const SlicePlane = ({
  clippingPlanePosition,
}: {
  clippingPlanePosition: number
}) => {
  const sliceRef = useRef<Mesh | null>(null)

  useEffect(() => {
    if (sliceRef.current) {
      const geometry = sliceRef.current.geometry as BufferGeometry
      const positionAttr = geometry.attributes.position
      const colorsArray: number[] = []

      for (let i = 0; i < positionAttr.count; i++) {
        const position = new Vector3().fromBufferAttribute(positionAttr, i)
        position.z = clippingPlanePosition

        const color = new Color(
          (position.x + CUBE_SIZE / 2) / CUBE_SIZE,
          (position.y + CUBE_SIZE / 2) / CUBE_SIZE,
          (position.z + CUBE_SIZE / 2) / CUBE_SIZE
        )
        colorsArray.push(color.r, color.g, color.b)
      }

      geometry.setAttribute("color", new Float32BufferAttribute(colorsArray, 3))
      geometry.attributes.color.needsUpdate = true
    }
  }, [clippingPlanePosition])

  return (
    <mesh ref={sliceRef} position={[0, 0, clippingPlanePosition]}>
      <planeGeometry args={[CUBE_SIZE, CUBE_SIZE]} />
      <meshStandardMaterial vertexColors={true} side={DoubleSide} />
    </mesh>
  )
}

export const RgbCubeWithSlice = ({
  isVisible,
  clippingPlanePosition,
}: Props) => {
  return (
    <>
      <RgbCube
        isVisible={isVisible}
        clippingPlanePosition={clippingPlanePosition}
      />
      <SlicePlane clippingPlanePosition={clippingPlanePosition} />
    </>
  )
}
