import React, { useMemo } from 'react';
import * as THREE from 'three';

interface MalaiKofta3DProps {
  glazeColor?: string;
  hasGoldFlakes?: boolean;
}

export const MalaiKofta3D: React.FC<MalaiKofta3DProps> = ({
  hasGoldFlakes = true
}) => {
  // Procedural golden-crusted kofta texture
  const koftaTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Warm golden brown fried exterior
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, size, size);

      // Deep caramelized char spots
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 4 + Math.random() * 12;
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pistachio green specks
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x, y, 3, 3);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // 4 Kofta positions arranged harmoniously
  const koftas = [
    { pos: [0, 0.28, 0.28], scale: 0.36 },
    { pos: [-0.42, 0.26, -0.15], scale: 0.34 },
    { pos: [0.42, 0.26, -0.15], scale: 0.34 },
    { pos: [0, 0.42, -0.05], scale: 0.38 }
  ];

  return (
    <group position={[0, -0.42, 0]}>
      {/* Silken Royal Saffron Ivory Korma Pool */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.52, 1.65, 0.045, 48]} />
        <meshPhysicalMaterial
          color="#fef3c7"
          roughness={0.15}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          reflectivity={0.8}
        />
      </mesh>

      {/* Emerald Coriander Oil Drops in Gravy */}
      {[
        [-0.65, -0.02, 0.3],
        [0.7, -0.02, 0.25],
        [-0.3, -0.02, -0.65],
        [0.4, -0.02, -0.6]
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} receiveShadow>
          <cylinderGeometry args={[0.09, 0.12, 0.02, 16]} />
          <meshPhysicalMaterial
            color="#173829"
            roughness={0.08}
            clearcoat={1.0}
          />
        </mesh>
      ))}

      {/* Black Truffle Reduction Swirls */}
      {[
        [0.55, -0.02, -0.2],
        [-0.55, -0.02, -0.3],
        [0.1, -0.02, 0.7]
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} receiveShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.02, 16]} />
          <meshPhysicalMaterial
            color="#140e0a"
            roughness={0.08}
            clearcoat={1.0}
          />
        </mesh>
      ))}

      {/* 4 Golden Crisp Malai Kofta Spheres */}
      {koftas.map((k, idx) => (
        <group key={idx} position={k.pos as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[k.scale, 32, 32]} />
            <meshStandardMaterial
              color="#d97706"
              roughness={0.65}
              metalness={0.1}
              bumpMap={koftaTexture}
              bumpScale={0.05}
            />
          </mesh>

          {/* Toasted Slivered Almonds on top of Kofta */}
          {[
            { offset: [0, k.scale * 0.95, 0], rot: [0.1, 0.3, 0] },
            { offset: [k.scale * 0.2, k.scale * 0.92, k.scale * 0.2], rot: [0.3, -0.2, 0.2] }
          ].map((a, aIdx) => (
            <mesh
              key={aIdx}
              position={a.offset as [number, number, number]}
              rotation={a.rot as [number, number, number]}
              scale={[0.08, 0.015, 0.04]}
              castShadow
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#fde68a" roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Fresh Micro-Herbs on top Kofta */}
      <group position={[0, 0.82, -0.05]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.25, 8]} />
          <meshStandardMaterial color="#173829" roughness={0.7} />
        </mesh>
        <mesh position={[0.05, 0.08, 0]} rotation={[0, 0, 0.8]} scale={[0.08, 0.01, 0.12]} castShadow>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#214C38" roughness={0.5} />
        </mesh>
        <mesh position={[-0.05, 0.08, 0]} rotation={[0, 0, -0.8]} scale={[0.08, 0.01, 0.12]} castShadow>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#173829" roughness={0.5} />
        </mesh>
      </group>

      {/* 24K Edible Gold Leaf Varq Flakes */}
      {hasGoldFlakes &&
        [
          { pos: [0, 0.83, 0.02], rot: [0.2, 0.3, 0.1], scale: 0.07 },
          { pos: [-0.38, 0.58, -0.1], rot: [0.4, 0.1, -0.3], scale: 0.06 },
          { pos: [0.38, 0.58, -0.1], rot: [-0.3, 0.4, 0.2], scale: 0.06 },
          { pos: [0.02, 0.62, 0.35], rot: [0.2, -0.5, 0.1], scale: 0.06 }
        ].map((flake, idx) => (
          <mesh
            key={idx}
            position={flake.pos as [number, number, number]}
            rotation={flake.rot as [number, number, number]}
            scale={[flake.scale, flake.scale * 0.25, flake.scale]}
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
    </group>
  );
};
