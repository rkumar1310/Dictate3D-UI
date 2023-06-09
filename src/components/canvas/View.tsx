'use client'

import { ContactShadows, Environment, OrbitControls, PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Outline, Select, Selection } from '@react-three/postprocessing'
import dynamic from 'next/dynamic'
import { BlendFunction, Resolution } from 'postprocessing'
import {
  createContext,
  forwardRef,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import { Three } from '../../helpers/components/Three'

import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'
import Editor3DContext from '../../templates/hooks/contexts/Editor3DContext'
import { AnimationTypes, Entity3DDetails, Entity3DType } from '../../types/types'

const cameraProps: any = { makeDefault: true, fov: 80, position: [0, 0, 6] }
const shadowProps: any = { resolution: 1024, position: [0, -2, 0], opacity: 1, scale: 1000, blur: 4, far: 3 }
const context = createContext<any>({})

function useHover() {
  const ref = useRef()
  const setHovered: (state) => void = useContext(context)
  const onPointerOver = useCallback(() => setHovered((state) => [...state, ref.current]), [])
  const onPointerOut = useCallback(() => setHovered((state) => state.filter((mesh) => mesh !== ref.current)), [])
  return { ref, onPointerOver, onPointerOut }
}

const Thing = ({ radius = 1, detail = 64, color = 'indianred', ...props }) => {
  return (
    <mesh {...props} {...useHover()}>
      <dodecahedronGeometry attach='geometry' args={[1]} />
      <meshStandardMaterial attach='material' color={color} />
    </mesh>
  )
}

export const Common = ({ objects }: { objects: any }) => {
  const { gl, raycaster, camera } = useThree()
  const editor3DContext = useContext(Editor3DContext)

  const line = useMemo(() => {
    const points = []
    points.push(new THREE.Vector3(-5, 0, 2))
    points.push(new THREE.Vector3(-4, 3, 2))
    points.push(new THREE.Vector3(5, 0, 2))

    const material = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 5 })
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return new THREE.Line(geometry, material)
  }, [])

  const line2 = useMemo(() => {
    const geometry = new LineGeometry().fromLine(line)

    const material = new LineMaterial({ color: 0xffff00, linewidth: 5 })
    material.resolution.set(gl.domElement.width, gl.domElement.height)
    const l = new LineSegments2(geometry, material)
    l.computeLineDistances()
    l.scale.set(1, 1, 1)
    return l
  }, [line, gl.domElement.width, gl.domElement.height])

  useEffect(() => {
    raycaster.params.Line.threshold = 0.2
    raycaster.params.Line2 = { threshold: 20 }
  }, [raycaster])

  useEffect(() => {
    editor3DContext.cameraRef.current = camera
  }, [camera, editor3DContext.cameraRef])

  return (
    <Suspense fallback={null}>
      <Environment files='empty_warehouse_01_1k.hdr' background blur={2} />
      <ContactShadows {...shadowProps} />
      <PerspectiveCamera {...cameraProps} />
      <Selection>
        <EffectComposer multisampling={8} autoClear={false}>
          <Outline
            visibleEdgeColor={0x00ff00}
            edgeStrength={1}
            width={Resolution.AUTO_SIZE}
            resolutionX={Resolution.AUTO_SIZE}
            resolutionY={Resolution.AUTO_SIZE}
            xRay={false}
            blendFunction={BlendFunction.ALPHA}
          />
        </EffectComposer>

        {objects.map((objectDetails, index) => (
          <DynamicMesh key={index} objectDetails={objectDetails} />
        ))}
      </Selection>
    </Suspense>
  )
}

interface SelectableMeshProps {
  mesh?: any
  objectDetails: any
  children?: React.ReactNode
  position: any
  scale: any
  rotation: any
  [key: string]: any
}

const SelectableMesh = forwardRef<THREE.Mesh, SelectableMeshProps>(
  ({ mesh, objectDetails, children, ...rest }, ref) => {
    const [hovered, hover] = useState(false)
    const editor3DContext = useContext(Editor3DContext)

    const toggleSelection = () => {
      editor3DContext.onClickObject(objectDetails.id)
    }

    return (
      <Select enabled={hovered || editor3DContext.activeObjectId === objectDetails.id}>
        {mesh ? (
          <primitive
            ref={ref}
            object={mesh}
            {...rest}
            onPointerOver={(e) => {
              hover(true)
              e.stopPropagation()
            }}
            onPointerOut={() => hover(false)}
            onClick={() => toggleSelection()}
          />
        ) : (
          <mesh
            ref={ref}
            {...rest}
            onPointerOver={(e) => {
              hover(true)
              e.stopPropagation()
            }}
            onPointerOut={() => hover(false)}
            onClick={() => toggleSelection()}
          >
            {children}
          </mesh>
        )}
      </Select>
    )
  },
)

SelectableMesh.displayName = 'SelectableMesh'

function DynamicMesh({ objectDetails }: { objectDetails: Entity3DDetails }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const worldAxis = new THREE.Vector3(0, 1, 0) // World y-axis

  useFrame(() => {
    if (!meshRef.current) return
    if (objectDetails.animations.includes(AnimationTypes.Jump)) {
      meshRef.current.position.y = objectDetails.position[1] + Math.abs(Math.sin(Date.now() / 500))
    }
    if (objectDetails.animations.includes(AnimationTypes.Spin)) {
      meshRef.current.rotateOnWorldAxis(worldAxis, 0.01)
    }
  })

  return (
    <SelectableMesh
      ref={meshRef}
      position={objectDetails.position}
      scale={objectDetails.scale}
      objectDetails={objectDetails}
      rotation={objectDetails.rotation}
    >
      {objectDetails.type === Entity3DType.Cube && <boxGeometry />}
      {objectDetails.type === Entity3DType.Sphere && <sphereGeometry args={[1, 32, 32]} />}
      {objectDetails.type === Entity3DType.Cylinder && <cylinderGeometry args={[1, 1, 5, 32]} />}
      {objectDetails.type === Entity3DType.Plane && <planeGeometry args={[1, 1]} />}
      {objectDetails.type === Entity3DType.Torus && <torusGeometry args={[10, 3, 16, 100]} />}
      <meshStandardMaterial color={objectDetails.color} />
    </SelectableMesh>
  )
}

interface ViewProps {
  orbit?: boolean
  className?: string
  children?: React.ReactNode
}
const View = forwardRef(({ children, orbit, ...props }: ViewProps, ref) => {
  const localRef = useRef(null)
  useImperativeHandle(ref, () => localRef.current)

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>
          {children}
          {orbit && <OrbitControls />}
        </ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }
