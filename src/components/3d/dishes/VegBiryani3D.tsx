import React, { useMemo } from 'react';
import * as THREE from 'three';

interface VegBiryani3DProps {
  glazeColor?: string;
  hasGoldFlakes?: boolean;
}

export const VegBiryani3D: React.FC<VegBiryani3DProps> = ({
  hasGoldFlakes = true
}) => {
  // Procedural aged Basmati rice grain texture with saffron streaks
  const riceTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Pearlescent white aged basmati base
      ctx.fillStyle = '#faf7ee';
      ctx.fillRect(0, 0, size, size);

      // Saffron infusion golden streaks
      for (let s = 0; s < 12; s++) {
        const randY = Math.abs(Math.sin(s * 41.2) * 43758.5453) % 1;
        const grad = ctx.createLinearGradient(0, randY * size, size, randY * size + 40);
        grad.addColorStop(0, 'rgba(234, 179, 8, 0)');
        grad.addColorStop(0.5, 'rgba(217, 119, 6, 0.45)');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, randY * size - 15, size, 45);
      }

      // Draw thousands of individual tiny rice grain dashes
      for (let i = 0; i < 4000; i++) {
        const randX = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const randY = Math.abs(Math.sin(i * 78.233) * 43758.5453) % 1;
        const angle = ((Math.abs(Math.sin(i * 35.12) * 43758.5453) % 1) - 0.5) * Math.PI;
        const isSaffron = (Math.abs(Math.sin(i * 91.43) * 43758.5453) % 1) > 0.65;

        ctx.save();
        ctx.translate(randX * size, randY * size);
        ctx.rotate(angle);
        ctx.fillStyle = isSaffron ? '#eab308' : '#ffffff';
        ctx.fillRect(-6, -1.5, 12, 3);
        ctx.restore();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }, []);

  // Sculpted surface rice grain clusters
  const riceGrains = useMemo(() => {
    const grains = [];
    for (let i = 0; i < 70; i++) {
      const r1 = Math.abs(Math.sin(i * 17.13) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 49.82) * 43758.5453) % 1;
      const r3 = Math.abs(Math.sin(i * 83.45) * 43758.5453) % 1;
      const angle = r1 * Math.PI * 2;
      const radius = 0.3 + r2 * 0.95;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Dome profile curve
      const y = Math.max(0.08, 0.65 * (1 - (radius / 1.4) ** 2) + r3 * 0.06);
      const isSaffron = r3 > 0.45;
      grains.push({
        pos: [x, y, z] as [number, number, number],
        rot: [r1 * 0.4, angle, r2 * 0.4] as [number, number, number],
        color: isSaffron ? '#f59e0b' : '#fefce8'
      });
    }
    return grains;
  }, []);

  // Caramelized crispy golden fried onions (birista ribbons)
  const biristaRibbons = useMemo(() => {
    const ribbons = [];
    for (let i = 0; i < 18; i++) {
      const r1 = Math.abs(Math.sin(i * 29.4) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 68.7) * 43758.5453) % 1;
      const r3 = Math.abs(Math.sin(i * 14.2) * 43758.5453) % 1;
      const angle = r1 * Math.PI * 2;
      const radius = 0.15 + r2 * 0.65;
      ribbons.push({
        pos: [Math.cos(angle) * radius, 0.48 + (1 - radius) * 0.25 + r3 * 0.05, Math.sin(angle) * radius] as [number, number, number],
        rot: [r2 * 0.6, r1 * Math.PI * 2, r3 * 0.6] as [number, number, number],
        scale: [0.12 + r1 * 0.15, 0.02, 0.04] as [number, number, number]
      });
    }
    return ribbons;
  }, []);

  // Roasted golden cashews
  const cashews = useMemo(() => {
    return [
      { pos: [0.42, 0.52, 0.28], rot: [0.2, 0.4, 0.3] },
      { pos: [-0.48, 0.48, -0.32], rot: [0.3, -0.6, 0.2] },
      { pos: [0.18, 0.65, -0.38], rot: [-0.2, 0.8, -0.1] },
      { pos: [-0.35, 0.58, 0.38], rot: [0.4, 0.1, -0.4] }
    ];
  }, []);

  // Ruby red pomegranate seeds
  const pomegranates = useMemo(() => {
    const seeds = [];
    for (let i = 0; i < 16; i++) {
      const r1 = Math.abs(Math.sin(i * 38.6) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 74.1) * 43758.5453) % 1;
      const angle = r1 * Math.PI * 2;
      const radius = 0.25 + r2 * 0.85;
      seeds.push([
        Math.cos(angle) * radius,
        0.35 + (1 - radius * 0.65) * 0.35,
        Math.sin(angle) * radius
      ] as [number, number, number]);
    }
    return seeds;
  }, []);

  return (
    <group position={[0, -0.42, 0]}>
      {/* Dum Biryani Main Rice Mound / Dome */}
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.38, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
        <meshStandardMaterial
          color="#fef9ee"
          roughness={0.88}
          metalness={0.05}
          bumpMap={riceTexture}
          bumpScale={0.07}
        />
      </mesh>

      {/* Individual Sculpted 3D Basmati Rice Grains */}
      {riceGrains.map((g, idx) => (
        <mesh
          key={idx}
          position={g.pos}
          rotation={g.rot}
          scale={[0.02, 0.015, 0.08]}
          castShadow
        >
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial
            color={g.color}
            roughness={0.7}
            metalness={0.06}
          />
        </mesh>
      ))}

      {/* Caramelized Crispy Fried Onions (Birista) */}
      {biristaRibbons.map((b, idx) => (
        <mesh
          key={idx}
          position={b.pos}
          rotation={b.rot}
          scale={b.scale}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial
            color="#602909"
            roughness={0.25}
            clearcoat={0.8}
            metalness={0.15}
          />
        </mesh>
      ))}

      {/* Golden Roasted Cashew Nuts */}
      {cashews.map((c, idx) => (
        <group key={idx} position={c.pos as [number, number, number]} rotation={c.rot as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <torusGeometry args={[0.09, 0.045, 12, 24, Math.PI * 1.3]} />
            <meshStandardMaterial
              color="#d97706"
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Ruby Red Pomegranate Jewels */}
      {pomegranates.map((pos, idx) => (
        <mesh key={idx} position={pos} scale={0.035} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#991b1b"
            roughness={0.12}
            clearcoat={1.0}
            transmission={0.4}
            ior={1.4}
          />
        </mesh>
      ))}

      {/* Centerpiece Whole Star Anise Pod on Crest */}
      <group position={[0, 0.72, 0]} rotation={[0.2, 0.4, 0.1]} scale={0.85}>
        <mesh castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#3b1d11" roughness={0.8} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.2, 0, Math.sin(angle) * 0.2]}
              rotation={[0, -angle, 0]}
              castShadow
            >
              <coneGeometry args={[0.065, 0.32, 8]} />
              <meshStandardMaterial color="#451a03" roughness={0.85} />
            </mesh>
          );
        })}
      </group>

      {/* Green Cardamom Pod */}
      <mesh position={[0.28, 0.68, 0.18]} rotation={[0.3, 0.8, -0.2]} scale={[0.05, 0.09, 0.05]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#3f6212" roughness={0.65} />
      </mesh>

      {/* Whole Black Peppercorns */}
      {[
        [-0.22, 0.68, 0.2],
        [0.32, 0.62, -0.25],
        [-0.38, 0.58, -0.15]
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} scale={0.032} castShadow>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} />
        </mesh>
      ))}

      {/* Fresh Mint Sprig Crown on Peak */}
      <group position={[0.05, 0.82, -0.02]} rotation={[0.1, -0.4, 0.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.012, 0.016, 0.25, 8]} />
          <meshStandardMaterial color="#173829" roughness={0.7} />
        </mesh>
        {/* Mint leaves */}
        {[
          { pos: [0.06, 0.08, 0], rot: [0, 0, 0.9] },
          { pos: [-0.06, 0.08, 0], rot: [0, 0, -0.9] },
          { pos: [0, 0.14, 0.06], rot: [0.9, 0, 0] },
          { pos: [0, 0.14, -0.06], rot: [-0.9, 0, 0] }
        ].map((leaf, idx) => (
          <mesh
            key={idx}
            position={leaf.pos as [number, number, number]}
            rotation={leaf.rot as [number, number, number]}
            scale={[0.08, 0.01, 0.14]}
            castShadow
          >
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color="#214C38" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* 24K Edible Gold Leaf Varq Flakes on Rice */}
      {hasGoldFlakes &&
        [
          { pos: [-0.28, 0.66, 0.12], rot: [0.2, 0.5, 0.1], scale: 0.07 },
          { pos: [0.25, 0.69, -0.15], rot: [-0.3, 0.2, 0.4], scale: 0.06 },
          { pos: [0.05, 0.76, 0.28], rot: [0.1, -0.4, 0.2], scale: 0.08 }
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
