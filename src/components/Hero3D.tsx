import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const TaskGlobe = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.cos(t / 4) / 2;
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
  });

  return (
    <mesh 
      ref={meshRef} 
      scale={2.4} 
      raycast={() => null} // Disable raycasting to prevent event resolution errors
    >
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color="#4F46E5"
        distort={0.4}
        speed={2}
        roughness={0.1}
      />
    </mesh>
  );
};

const Hero3D = () => {
  return (
    <div className="w-full h-[500px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <TaskGlobe />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3D;