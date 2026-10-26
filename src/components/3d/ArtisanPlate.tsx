import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ArtisanPlateProps {
  accentColor?: string;
}

export const ArtisanPlate: React.FC<ArtisanPlateProps> = ({ accentColor = '#C9A86B' }) => {
  // Create artisan slate texture procedurally with subtle matte organic speckling
  const slateBumpMap = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 4000; i++) {
        const rand1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const rand2 = Math.abs(Math.sin(i * 78.233) * 43758.5453) % 1;
        const rand3 = Math.abs(Math.sin(i * 37.719) * 43758.5453) % 1;
        const x = rand1 * size;
        const y = rand2 * size;
        const radius = rand3 * 1.5;
        const gray = Math.floor(rand1 * 80 + 100);
        ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);

  return (
    <group position={[0, -0.65, 0]}>
      {/* Main Artisan Slate Ceramic Plate */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[2.7, 2.3, 0.22, 64]} />
        <meshStandardMaterial
          color="#0E1310"
          roughness={0.88}
          metalness={0.12}
          bumpMap={slateBumpMap}
          bumpScale={0.03}
        />
      </mesh>

      {/* Raised Plate Rim */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <torusGeometry args={[2.58, 0.12, 24, 64]} />
        <meshStandardMaterial
          color="#121814"
          roughness={0.75}
          metalness={0.2}
        />
      </mesh>

      {/* Recessed Basin / Inner Dish Well */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.05, 0.08, 64]} />
        <meshStandardMaterial
          color="#0A0D0B"
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>

      {/* 24K Gold Inlay Rim Accent */}
      <mesh position={[0, 0.15, 0]}>
        <torusGeometry args={[2.48, 0.022, 16, 64]} />
        <meshStandardMaterial
          color={accentColor}
          roughness={0.18}
          metalness={0.95}
          emissive={accentColor}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Inner Delicate Gold Ring */}
      <mesh position={[0, 0.125, 0]}>
        <torusGeometry args={[1.75, 0.012, 16, 64]} />
        <meshStandardMaterial
          color={accentColor}
          roughness={0.2}
          metalness={0.92}
          emissive={accentColor}
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
};

