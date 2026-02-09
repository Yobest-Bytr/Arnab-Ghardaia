import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';

const TaskGlobe = () => {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
  });

  return (
    <mesh 
      ref={meshRef} 
      scale={2.5} 
      raycast={() => null} // Explicitly disable raycasting on this mesh
    >
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color="#6366f1"
        speed={2}
        distort={0.4}
        radius={1}
      />
    </mesh>
  );
};

const Hero3D = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure the component is fully mounted before starting the 3D engine
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[500px]" />;

  return (
    <div className="w-full h-[500px] pointer-events-none select-none overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        // Completely disable the event system to prevent the raycaster from running
        events={() => ({ enabled: false })}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
            <TaskGlobe />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3D;