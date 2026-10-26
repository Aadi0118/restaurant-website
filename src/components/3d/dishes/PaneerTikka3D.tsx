import React, { useMemo } from 'react';
import * as THREE from 'three';

interface PaneerTikka3DProps {
  glazeColor?: string;
  hasGoldFlakes?: boolean;
}

export const PaneerTikka3D: React.FC<PaneerTikka3DProps> = ({
  glazeColor = '#D97706',
  hasGoldFlakes = true
}) => {
  // Procedural tandoor char & cottage cheese porous texture
  const paneerTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Soft ivory paneer base
      ctx.fillStyle = '#faf6ed';
      ctx.fillRect(0, 0, size, size);

      // Delicate tandoori marination glaze streaks
      ctx.fillStyle = 'rgba(217, 119, 6, 0.35)';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(0, i * 32, size, 16);
      }

      // Woodfire grill char lines
      ctx.strokeStyle = '#261208';
      ctx.lineWidth = 10;
      for (let i = -60; i < size + 60; i += 48) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 40, size);
        ctx.stroke();
      }

      // Porous micro-texture noise
      for (let i = 0; i < 2500; i++) {
        const randX = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const randY = Math.abs(Math.sin(i * 78.233) * 43758.5453) % 1;
        ctx.fillStyle = randX > 0.6 ? '#652d0a' : '#dfd2bd';
        ctx.fillRect(randX * size, randY * size, 2, 2);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Gold leaf flakes on paneer
  const goldFlakes = useMemo(() => {
    const flakes = [];
    for (let i = 0; i < 14; i++) {
      const r1 = Math.abs(Math.sin(i * 31.78) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 63.41) * 43758.5453) % 1;
      const r3 = Math.abs(Math.sin(i * 92.15) * 43758.5453) % 1;
      flakes.push({
        position: [
          (r1 - 0.5) * 0.9,
          0.42 + r2 * 0.15,
          (r3 - 0.5) * 0.9
        ] as [number, number, number],
        rotation: [(r1 - 0.5) * 0.5, r2 * Math.PI, (r3 - 0.5) * 0.5] as [number, number, number],
        scale: 0.04 + r1 * 0.05
      });
    }
    return flakes;
  }, []);

  return (
    <group position={[0, -0.42, 0]}>
      {/* Rich Saffron Makhani Velouté Pool on Plate Basin */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.55, 1.68, 0.05, 48]} />
        <meshPhysicalMaterial
          color={glazeColor}
          roughness={0.12}
          metalness={0.08}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          transmission={0.05}
          reflectivity={0.8}
        />
      </mesh>

      {/* Swirls of Saffron Cream & Coriander Herb Oil in Sauce */}
      <mesh position={[0.2, -0.02, 0.3]} receiveShadow rotation={[-Math.PI / 2, 0, 0.4]}>
        <ringGeometry args={[0.3, 0.45, 32]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.65} />
      </mesh>
      <mesh position={[-0.3, -0.02, -0.2]} receiveShadow rotation={[-Math.PI / 2, 0, -0.6]}>
        <ringGeometry args={[0.25, 0.38, 32]} />
        <meshBasicMaterial color="#173829" transparent opacity={0.7} />
      </mesh>

      {/* Paneer Cube 1: Main Centerpiece Cube */}
      <mesh position={[-0.05, 0.22, 0.08]} rotation={[0.04, 0.25, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.54, 0.68]} />
        <meshStandardMaterial
          color="#fefae0"
          roughness={0.75}
          metalness={0.08}
          bumpMap={paneerTexture}
          bumpScale={0.06}
        />
      </mesh>

      {/* Paneer Cube 2: Elevated Stacked Cube */}
      <mesh position={[0.08, 0.52, -0.05]} rotation={[-0.08, 0.65, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.48, 0.62]} />
        <meshStandardMaterial
          color="#fcf6e6"
          roughness={0.75}
          metalness={0.08}
          bumpMap={paneerTexture}
          bumpScale={0.06}
        />
      </mesh>

      {/* Paneer Cube 3: Left Flank Cube */}
      <mesh position={[-0.55, 0.18, 0.32]} rotation={[0.06, -0.35, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 0.46, 0.58]} />
        <meshStandardMaterial
          color="#faf3e0"
          roughness={0.78}
          bumpMap={paneerTexture}
          bumpScale={0.05}
        />
      </mesh>

      {/* Paneer Cube 4: Right Flank Cube */}
      <mesh position={[0.54, 0.18, -0.25]} rotation={[-0.04, 0.42, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.45, 0.56]} />
        <meshStandardMaterial
          color="#faf2db"
          roughness={0.78}
          bumpMap={paneerTexture}
          bumpScale={0.05}
        />
      </mesh>

      {/* Charred Bell Pepper Wedges (Capsicum) */}
      {/* Emerald Green Charred Pepper */}
      <mesh position={[-0.68, 0.12, -0.22]} rotation={[0.4, 0.6, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.14, 0.38]} />
        <meshPhysicalMaterial
          color="#15803d"
          roughness={0.3}
          metalness={0.15}
          clearcoat={0.7}
        />
      </mesh>
      {/* Ruby Red Charred Pepper */}
      <mesh position={[0.65, 0.14, 0.35]} rotation={[-0.2, 0.8, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.14, 0.4]} />
        <meshPhysicalMaterial
          color="#b91c1c"
          roughness={0.28}
          metalness={0.15}
          clearcoat={0.75}
        />
      </mesh>
      {/* Golden Yellow Pepper */}
      <mesh position={[0.1, 0.1, 0.72]} rotation={[0.1, -0.4, 0.25]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.12, 0.35]} />
        <meshPhysicalMaterial
          color="#eab308"
          roughness={0.3}
          clearcoat={0.7}
        />
      </mesh>

      {/* Caramelized Woodfire Pearl Onions */}
      <group position={[-0.45, 0.12, 0.65]} rotation={[0.2, 0.3, 0.1]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color="#faeed4" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 0.03, 16]} />
          <meshStandardMaterial color="#2b1406" roughness={0.8} />
        </mesh>
      </group>
      <group position={[0.58, 0.1, -0.6]} rotation={[-0.1, 0.5, 0.2]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color="#faeed4" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.06, 0.09, 0.03, 16]} />
          <meshStandardMaterial color="#2b1406" roughness={0.8} />
        </mesh>
      </group>

      {/* Fresh Micro-Coriander Sprigs on Top */}
      <group position={[0.08, 0.76, -0.05]} rotation={[0.1, 0.3, 0.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.015, 0.02, 0.35, 12]} />
          <meshStandardMaterial color="#173829" roughness={0.7} />
        </mesh>
        {[-0.08, 0.0, 0.08].map((yOffset, idx) => (
          <React.Fragment key={idx}>
            <mesh position={[0.05, yOffset, 0]} rotation={[0, 0, 0.8]}>
              <cylinderGeometry args={[0.008, 0.012, 0.12, 8]} />
              <meshStandardMaterial color="#214C38" roughness={0.6} />
            </mesh>
            <mesh position={[-0.05, yOffset, 0]} rotation={[0, 0, -0.8]}>
              <cylinderGeometry args={[0.008, 0.012, 0.12, 8]} />
              <meshStandardMaterial color="#173829" roughness={0.6} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* 24K Edible Gold Leaf Flakes Catching Light */}
      {hasGoldFlakes &&
        goldFlakes.map((flake, idx) => (
          <mesh
            key={idx}
            position={flake.position}
            rotation={flake.rotation}
            scale={[flake.scale, flake.scale * 0.3, flake.scale]}
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

      {/* Maldon Sea Salt Pyramids */}
      {[
        [-0.15, 0.49, 0.2],
        [0.2, 0.74, 0.05],
        [-0.4, 0.42, 0.3],
        [0.45, 0.4, -0.15]
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} scale={0.025}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.1}
            transmission={0.8}
            ior={1.5}
            reflectivity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};
