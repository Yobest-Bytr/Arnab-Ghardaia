import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';

const TaskGlobe = () => {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.cos(t / 4) / 2;
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
    meshRef.current.rotation.z = Math.sin(t / 4) / 2;
  });

  return (
    <mesh ref={meshRef} scale={2.4}>
      <sphereGeometry args={[1, 100, 100]} />
      <MeshDistortMaterial
        color="#4F46E5"
        distort={0.4}
        speed={2}
        roughness={0}
      />
    </mesh>
  );
};

const Hero3D = () => {
  return (
    <div className="w-full h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <TaskGlobe />
        </Float>
      </Canvas>
    </div>
  );
};

export default Hero3D;