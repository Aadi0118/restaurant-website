import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SignatureDishMeshProps {
  glazeColor?: string;
  hasGoldFlakes?: boolean;
}

export const SignatureDishMesh: React.FC<SignatureDishMeshProps> = ({
  glazeColor = '#1f0a04',
  hasGoldFlakes = true
}) => {
  // Procedural seared crust bump map
  const searTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4a332a';
      ctx.fillRect(0, 0, size, size);
      // Dark grill / sear char lines
      ctx.strokeStyle = '#1a0c06';
      ctx.lineWidth = 14;
      for (let i = -100; i < size + 100; i += 38) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 80, size);
        ctx.stroke();
      }
      // Micro-texture noise
      for (let i = 0; i < 3000; i++) {
        const randX = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const randY = Math.abs(Math.sin(i * 78.233) * 43758.5453) % 1;
        ctx.fillStyle = randX > 0.5 ? '#150804' : '#634438';
        ctx.fillRect(randX * size, randY * size, 2, 2);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Gold flake points / meshes
  const goldFlakesData = useMemo(() => {
    const flakes = [];
    for (let i = 0; i < 16; i++) {
      const r1 = Math.abs(Math.sin(i * 45.132) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 91.827) * 43758.5453) % 1;
      const r3 = Math.abs(Math.sin(i * 13.579) * 43758.5453) % 1;
      const r4 = Math.abs(Math.sin(i * 64.218) * 43758.5453) % 1;
      const angle = r1 * Math.PI * 2;
      const radius = r2 * 0.42;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.43 + r3 * 0.04;
      const rotX = (r4 - 0.5) * 0.6;
      const rotY = r1 * Math.PI;
      const rotZ = (r2 - 0.5) * 0.6;
      const scale = 0.04 + r3 * 0.05;
      flakes.push({ position: [x, y, z] as [number, number, number], rotation: [rotX, rotY, rotZ] as [number, number, number], scale });
    }
    return flakes;
  }, []);

  // Salt crystals
  const saltCrystals = useMemo(() => {
    const crystals = [];
    for (let i = 0; i < 12; i++) {
      const r1 = Math.abs(Math.sin(i * 33.17) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 77.29) * 43758.5453) % 1;
      const r3 = Math.abs(Math.sin(i * 51.83) * 43758.5453) % 1;
      const angle = r1 * Math.PI * 2;
      const radius = 0.15 + r2 * 0.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.38 + r3 * 0.06;
      crystals.push({ position: [x, y, z] as [number, number, number], scale: 0.02 + r1 * 0.02 });
    }
    return crystals;
  }, []);

  return (
    <group position={[0, -0.42, 0]}>
      {/* Base Puree / Cauliflower & Saffron Cream Swirl on Plate */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.04, 48]} />
        <meshStandardMaterial
          color="#f4ecd8"
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Main Centerpiece Medallion (Wood-Seared Tenderloin / Wagyu Fillet) */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.78, 0.45, 48]} />
        <meshStandardMaterial
          color="#331c14"
          roughness={0.82}
          metalness={0.1}
          bumpMap={searTexture}
          bumpScale={0.06}
        />
      </mesh>

      {/* Glossy Truffle Demi-Glace Reduction Drizzle */}
      <mesh position={[0, 0.41, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.72, 0.05, 48]} />
        <meshPhysicalMaterial
          color={glazeColor}
          roughness={0.08}
          metalness={0.12}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          transmission={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Drizzle pools & drips around the medallion */}
      <mesh position={[0.45, -0.02, 0.3]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.35, 0.025, 24]} />
        <meshPhysicalMaterial
          color={glazeColor}
          roughness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
        />
      </mesh>
      <mesh position={[-0.5, -0.02, -0.2]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.025, 24]} />
        <meshPhysicalMaterial
          color={glazeColor}
          roughness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
        />
      </mesh>

      {/* Charred Baby Heirloom Carrots */}
      <group position={[-0.72, 0.06, 0.42]} rotation={[0.1, 0.6, -0.2]}>
        <mesh castShadow receiveShadow>
          <coneGeometry args={[0.11, 0.75, 24]} />
          <meshStandardMaterial
            color="#d97706"
            roughness={0.38}
            metalness={0.08}
          />
        </mesh>
        {/* Carrot green tip */}
        <mesh position={[0, -0.38, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.015, 0.02, 0.2, 12]} />
          <meshStandardMaterial color="#2d5e2e" roughness={0.6} />
        </mesh>
      </group>

      <group position={[-0.85, 0.04, 0.2]} rotation={[0.05, 0.3, -0.25]}>
        <mesh castShadow receiveShadow>
          <coneGeometry args={[0.09, 0.65, 24]} />
          <meshStandardMaterial
            color="#ea580c"
            roughness={0.35}
            metalness={0.08}
          />
        </mesh>
      </group>

      {/* Caramelized Smoked Pearl Onions */}
      <group position={[0.65, 0.06, -0.45]} rotation={[0.2, 0.5, 0.1]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial
            color="#fdf4dc"
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>
        {/* Charred top cap */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.03, 16]} />
          <meshStandardMaterial color="#201007" roughness={0.8} />
        </mesh>
      </group>

      {/* Fresh Micro-Herbs and Rosemary Sprigs on top of Medallion */}
      <group position={[0.05, 0.44, 0]} rotation={[0.1, 0.4, 0.15]}>
        {/* Stem */}
        <mesh castShadow>
          <cylinderGeometry args={[0.015, 0.02, 0.38, 12]} />
          <meshStandardMaterial color="#173829" roughness={0.7} />
        </mesh>
        {/* Needle leaves */}
        {[-0.12, -0.04, 0.04, 0.12].map((yOffset, idx) => (
          <React.Fragment key={idx}>
            <mesh position={[0.06, yOffset, 0]} rotation={[0, 0, 0.8]}>
              <cylinderGeometry args={[0.008, 0.012, 0.12, 8]} />
              <meshStandardMaterial color="#214C38" roughness={0.6} />
            </mesh>
            <mesh position={[-0.06, yOffset, 0]} rotation={[0, 0, -0.8]}>
              <cylinderGeometry args={[0.008, 0.012, 0.12, 8]} />
              <meshStandardMaterial color="#173829" roughness={0.6} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* 24K Edible Gold Leaf Flakes catching the rim lighting */}
      {hasGoldFlakes &&
        goldFlakesData.map((flake, idx) => (
          <mesh
            key={idx}
            position={flake.position}
            rotation={flake.rotation}
            scale={[flake.scale, flake.scale * 0.4, flake.scale]}
            castShadow
          >
            <boxGeometry args={[1, 0.08, 1]} />
            <meshStandardMaterial
              color="#C9A86B"
              roughness={0.15}
              metalness={0.96}
              emissive="#DEC085"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

      {/* Flaked Maldon Sea Salt Pyramids */}
      {saltCrystals.map((salt, idx) => (
        <mesh key={idx} position={salt.position} scale={salt.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.15}
            transmission={0.8}
            ior={1.5}
            reflectivity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};
