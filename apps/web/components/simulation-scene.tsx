"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { layerContent } from "@/lib/content";

type Phase = "idle" | "encapsulating" | "transmitting" | "decapsulating" | "complete";

type SimulationSceneProps = {
  phase: Phase;
  senderLayer: number | null;
  receiverLayer: number | null;
  selectedLayer: number | null;
  onSelectLayer: (layer: number) => void;
};

const layers = layerContent.map(({ number, name }) => ({ number, name }));

function layerY(number: number) {
  return 1.42 - (7 - number) * 0.47;
}

function DeviceModel({
  src,
  position,
}: {
  src: string;
  position: [number, number, number];
}) {
  const { scene } = useGLTF(src);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 1.65 / Math.max(size.x, size.y, size.z, 0.01);

    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    return clone;
  }, [scene]);

  return (
    <group position={position}>
      <primitive object={model} />
    </group>
  );
}

function LayerStack({
  side,
  offset,
  activeLayer,
  selectedLayer,
  onSelectLayer,
}: {
  side: "Sender" | "Receiver";
  offset: number;
  activeLayer: number | null;
  selectedLayer: number | null;
  onSelectLayer: (layer: number) => void;
}) {
  const x = side === "Sender" ? -offset : offset;

  return (
    <group>
      {layers.map((layer) => {
        const isActive = activeLayer === layer.number;
        const isSelected = selectedLayer === layer.number;

        return (
          <group key={`${side}-${layer.number}`} position={[x, layerY(layer.number), 0]}>
            <RoundedBox
              args={[1.72, 0.36, 0.48]}
              radius={0.065}
              smoothness={3}
              onClick={(event) => {
                event.stopPropagation();
                onSelectLayer(layer.number);
              }}
            >
              <meshStandardMaterial
                color={isActive ? "#ffe228" : isSelected ? "#130e30" : "#dce3d5"}
                emissive={isActive ? "#ffe228" : "#000000"}
                emissiveIntensity={isActive ? 0.22 : 0}
                roughness={0.68}
              />
            </RoundedBox>
            <Html position={[0, 0, 0.27]} center distanceFactor={10}>
              <button
                className="sim3d-layer-button"
                data-active={isActive}
                data-selected={isSelected}
                type="button"
                aria-label={`Inspect ${side.toLowerCase()} Layer ${layer.number}, ${layer.name}`}
                aria-pressed={isSelected}
                onClick={() => onSelectLayer(layer.number)}
              >
                <span>Layer {layer.number}</span>
                <span>{layer.name}</span>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function DataPacket({
  phase,
  senderLayer,
  receiverLayer,
  stackOffset,
  reduceMotion,
}: Pick<SimulationSceneProps, "phase" | "senderLayer" | "receiverLayer"> & {
  stackOffset: number;
  reduceMotion: boolean;
}) {
  const packet = useRef<THREE.Group>(null);
  const target = useMemo(() => {
    if (phase === "transmitting") return new THREE.Vector3(0, -1.48, 0.2);
    if (phase === "complete") return new THREE.Vector3(stackOffset, layerY(7), 0.2);
    if (phase === "decapsulating") {
      return new THREE.Vector3(stackOffset, layerY(receiverLayer ?? 1), 0.2);
    }
    return new THREE.Vector3(-stackOffset, layerY(senderLayer ?? 7), 0.2);
  }, [phase, receiverLayer, senderLayer, stackOffset]);
  const initialPosition = useMemo(
    () => new THREE.Vector3(-stackOffset, layerY(7), 0.2),
    [stackOffset],
  );

  useFrame((_, delta) => {
    if (!packet.current) return;
    if (reduceMotion) {
      packet.current.position.copy(target);
      return;
    }
    packet.current.position.lerp(target, 1 - Math.exp(-7 * delta));
  });

  return (
    <group ref={packet} position={initialPosition}>
      <mesh>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color="#ffe228" emissive="#ffe228" emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.23, 0.018, 8, 32]} />
        <meshBasicMaterial color="#130e30" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function ResponsiveOrbitCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    const narrow = size.width < 720;
    perspective.position.set(0, narrow ? 4.3 : 3.4, narrow ? 19.2 : 10.2);
    perspective.lookAt(0, -0.12, 0);
    perspective.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={8}
      maxDistance={23}
      minPolarAngle={0.55}
      maxPolarAngle={Math.PI / 2.05}
      target={[0, -0.12, 0]}
    />
  );
}

function NetworkWorld(props: SimulationSceneProps & { reduceMotion: boolean }) {
  const { size } = useThree();
  const narrow = size.width < 720;
  const stackOffset = narrow ? 1.5 : 1.72;
  const hostOffset = narrow ? 3.35 : 3.45;
  const platformWidth = narrow ? 9 : 9.5;
  const path = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(-stackOffset * 0.55, -1.5, 0),
      new THREE.Vector3(-0.45, -1.72, 0),
      new THREE.Vector3(0.45, -1.72, 0),
      new THREE.Vector3(stackOffset * 0.55, -1.5, 0),
    ]),
    [stackOffset],
  );

  return (
    <>
      <ResponsiveOrbitCamera />
      <ambientLight intensity={1.8} />
      <directionalLight position={[-4, 7, 6]} intensity={2.2} />
      <pointLight position={[0, 3, 4]} intensity={0.7} color="#ffffff" />

      <RoundedBox position={[0, -1.86, -0.12]} args={[platformWidth, 0.16, 2.25]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color="#eff2e5" roughness={0.82} />
      </RoundedBox>

      <mesh>
        <tubeGeometry args={[path, 48, 0.025, 8, false]} />
        <meshStandardMaterial color="#130e30" transparent opacity={0.48} roughness={0.5} />
      </mesh>

      <LayerStack
        side="Sender"
        offset={stackOffset}
        activeLayer={props.senderLayer}
        selectedLayer={props.selectedLayer}
        onSelectLayer={props.onSelectLayer}
      />
      <LayerStack
        side="Receiver"
        offset={stackOffset}
        activeLayer={props.receiverLayer}
        selectedLayer={props.selectedLayer}
        onSelectLayer={props.onSelectLayer}
      />

      <DeviceModel src="/models/desktop_computer.glb" position={[-hostOffset, -1.65, -0.1]} />
      <DeviceModel src="/models/laptop.glb" position={[hostOffset, -1.65, -0.1]} />
      <DataPacket
        phase={props.phase}
        senderLayer={props.senderLayer}
        receiverLayer={props.receiverLayer}
        stackOffset={stackOffset}
        reduceMotion={props.reduceMotion}
      />
    </>
  );
}

export default function SimulationScene(props: SimulationSceneProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <section className="sim3d-stage" aria-label="Interactive three-dimensional OSI simulation">
      <div className="sim3d-zones" aria-hidden="true">
        <span>Sender host</span>
        <span>Network medium</span>
        <span>Receiver host</span>
      </div>
      <Canvas
        camera={{ position: [0, 3.4, 10.2], fov: 32 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        fallback={<div className="sim3d-fallback">3D graphics are unavailable here. Use the layer controls below to follow the simulation.</div>}
      >
        <Suspense fallback={<Html center><span className="sim3d-loading">Loading the 3D devices…</span></Html>}>
          <NetworkWorld {...props} reduceMotion={reduceMotion} />
        </Suspense>
      </Canvas>
      <p className="sim3d-hint">Drag to rotate · Scroll or pinch to zoom · Select a layer to inspect it</p>
    </section>
  );
}
