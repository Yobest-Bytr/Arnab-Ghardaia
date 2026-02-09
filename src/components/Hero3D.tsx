import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

const TaskGlobe = () => {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.y = t * 0.2;
  });

  return (
    <mesh 
      ref={meshRef} 
      scale={2.5}
      // Disable raycasting at the mesh level
      raycast={() => null}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial 
        color="#6366f1" 
        roughness={0.3} 
        metalness={0.8}
        emissive="#4f46e5"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const Hero3D = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[500px]" />;

  return (
    <div className="w-full h-[500px] pointer-events-none select-none overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        // Use a null event manager to completely bypass the R3F event system
        events={() => ({ 
          enabled: false,
          priority: 1,
          compute: () => {},
          connected: false,
          handlers: {}
        })}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <TaskGlobe />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3D;