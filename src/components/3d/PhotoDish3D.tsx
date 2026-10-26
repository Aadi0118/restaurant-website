import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SignatureDishOption } from '../../types/dining';

interface PhotoDish3DProps {
  dishOption: SignatureDishOption;
  accentColor?: string;
  hasGoldFlakes?: boolean;
}

export const PhotoDish3D: React.FC<PhotoDish3DProps> = ({
  dishOption,
  accentColor = '#C9A86B',
  hasGoldFlakes = true
}) => {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Load and configure high-resolution texture with optimal filtering & color space
  const dishTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const imagePath = dishOption.image || '/assets/paneer_lababdar.png';
    const texture = loader.load(imagePath);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    // Custom crop/offset so circular bowls fit the 3D platter
    if (dishOption.dishType === 'paneer' || imagePath.includes('paneer')) {
      texture.repeat.set(0.80, 0.80);
      texture.offset.set(0.10, 0.10);
    } else if (dishOption.dishType === 'biryani' || imagePath.includes('biryani')) {
      texture.repeat.set(0.92, 0.92);
      texture.offset.set(0.04, 0.04);
    } else if (imagePath.includes('chole') || imagePath.includes('bhature')) {
      texture.repeat.set(0.85, 0.85);
      texture.offset.set(0.08, 0.08);
    } else {
      texture.repeat.set(0.90, 0.90);
      texture.offset.set(0.05, 0.05);
    }

    return texture;
  }, [dishOption.image, dishOption.dishType]);

  // Procedural subtle ceramic bump for the artisan platter
  const slateBumpMap = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 3000; i++) {
        const rand1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const rand2 = Math.abs(Math.sin(i * 78.233) * 43758.5453) % 1;
        const x = rand1 * size;
        const y = rand2 * size;
        const gray = Math.floor(rand1 * 60 + 100);
        ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, []);

  // 24K Edible Gold leaf varq flakes
  const goldFlakes = useMemo(() => {
    const flakes = [];
    for (let i = 0; i < 12; i++) {
      const r1 = Math.abs(Math.sin(i * 45.132) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 91.827) * 43758.5453) % 1;
      const r3 = Math.abs(Math.sin(i * 13.579) * 43758.5453) % 1;
      const angle = r1 * Math.PI * 2;
      const radius = 0.2 + r2 * 0.95;
      flakes.push({
        position: [
          Math.cos(angle) * radius,
          0.12 + r3 * 0.06,
          Math.sin(angle) * radius
        ] as [number, number, number],
        rotation: [(r1 - 0.5) * 0.4, r2 * Math.PI, (r3 - 0.5) * 0.4] as [number, number, number],
        scale: 0.05 + r1 * 0.05
      });
    }
    return flakes;
  }, []);

  // Gentle breathing shimmer
  useFrame((state) => {
    if (!materialRef.current) return;
    const time = state.clock.getElapsedTime();
    materialRef.current.clearcoatRoughness = 0.08 + Math.sin(time * 1.5) * 0.03;
  });

  return (
    <group position={[0, -0.45, 0]}>
      {/* Artisan Obsidian Ceramic Platter Base */}
      <mesh receiveShadow castShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[2.55, 2.15, 0.22, 64]} />
        <meshStandardMaterial
          color="#0E1310"
          roughness={0.85}
          metalness={0.15}
          bumpMap={slateBumpMap}
          bumpScale={0.03}
        />
      </mesh>

      {/* Raised Ceramic Rim */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <torusGeometry args={[2.46, 0.12, 24, 64]} />
        <meshStandardMaterial
          color="#121814"
          roughness={0.75}
          metalness={0.2}
        />
      </mesh>

      {/* 24K Brushed Champagne Gold Inlay Rim */}
      <mesh position={[0, 0.08, 0]}>
        <torusGeometry args={[2.36, 0.024, 16, 64]} />
        <meshStandardMaterial
          color={accentColor}
          roughness={0.16}
          metalness={0.96}
          emissive={accentColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Inner Champagne Gold Filigree Ring */}
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[2.04, 0.016, 16, 64]} />
        <meshStandardMaterial
          color={accentColor}
          roughness={0.2}
          metalness={0.92}
          emissive={accentColor}
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* High-Resolution Real Dish Visual Disc with Satin Clearcoat */}
      <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.0, 1.95, 0.06, 64]} />
        <meshPhysicalMaterial
          ref={materialRef}
          map={dishTexture}
          roughness={0.22}
          metalness={0.05}
          clearcoat={0.65}
          clearcoatRoughness={0.08}
          reflectivity={0.85}
        />
      </mesh>

      {/* 24K Edible Gold Leaf Varq Flakes catching the rim lighting */}
      {hasGoldFlakes &&
        goldFlakes.map((flake, idx) => (
          <mesh
            key={idx}
            position={flake.position}
            rotation={flake.rotation}
            scale={[flake.scale, flake.scale * 0.25, flake.scale]}
            castShadow
          >
            <boxGeometry args={[1, 0.08, 1]} />
            <meshStandardMaterial
              color="#C9A86B"
              roughness={0.14}
              metalness={0.98}
              emissive="#DEC085"
              emissiveIntensity={0.35}
            />
          </mesh>
        ))}

      {/* Subtle Warm Amber Hearth Glow beneath the Platter */}
      <pointLight
        position={[0, 0.6, 0]}
        color={accentColor}
        intensity={0.8}
        distance={3.5}
      />
    </group>
  );
};
