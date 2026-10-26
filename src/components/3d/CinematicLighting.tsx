import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface CinematicLightingProps {
  accentLightColor?: string;
}

export const CinematicLighting: React.FC<CinematicLightingProps> = ({
  accentLightColor = '#ff9e1b'
}) => {
  const hearthLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (hearthLightRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle woodfire hearth glow pulse
      hearthLightRef.current.intensity = 1.3 + Math.sin(time * 3.5) * 0.25 + Math.sin(time * 7.1) * 0.1;
    }
  });

  return (
    <>
      {/* Warm Ambient Radiance */}
      <ambientLight color="#241d19" intensity={0.8} />

      {/* Main Overhead Warm Key Light */}
      <directionalLight
        position={[-2.5, 4.5, 3.2]}
        intensity={2.2}
        color="#fff1db"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Cinematic Amber Rim / Back Light for Gold Edge Highlights */}
      <directionalLight
        position={[4.2, 2.5, -3.5]}
        intensity={4.2}
        color={accentLightColor}
      />

      {/* Soft Secondary Rim Light from Left */}
      <directionalLight
        position={[-4.5, 1.8, -2.5]}
        intensity={1.8}
        color="#f5a623"
      />

      {/* Subtle Slate Blue Cold Fill Light for High-End Shadow Contrast */}
      <directionalLight
        position={[-3.5, -2, 2.5]}
        intensity={0.6}
        color="#2b3b4f"
      />

      {/* Pulsing Hearth Woodfire Ember Point Light */}
      <pointLight
        ref={hearthLightRef}
        position={[0, -0.7, 1.6]}
        distance={5}
        color="#ff6600"
        intensity={1.3}
      />

      {/* Ground Contact Soft Shadows */}
      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={0.8}
        scale={7}
        blur={2.4}
        far={3.5}
        color="#080605"
      />
    </>
  );
};
