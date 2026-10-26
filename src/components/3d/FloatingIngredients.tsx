import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingIngredientsProps {
  reducedMotion?: boolean;
}

// Procedural 3D Star Anise
const StarAnise: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const points = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <group scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#442111" roughness={0.8} />
      </mesh>
      {points.map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0.22, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
              <coneGeometry args={[0.07, 0.35, 8]} />
              <meshStandardMaterial color="#532a16" roughness={0.85} />
            </mesh>
            {/* Seed inside pod */}
            <mesh position={[0.16, 0.03, 0]} castShadow>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshPhysicalMaterial
                color="#78350f"
                roughness={0.2}
                clearcoat={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Procedural 3D Rosemary Sprig
const RosemarySprig: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  return (
    <group scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.018, 0.024, 0.65, 8]} />
        <meshStandardMaterial color="#173829" roughness={0.7} />
      </mesh>
      {[-0.2, -0.1, 0, 0.1, 0.2].map((y, idx) => (
        <group key={idx} position={[0, y, 0]}>
          <mesh position={[0.08, 0.02, 0]} rotation={[0, 0, 0.9]} castShadow>
            <cylinderGeometry args={[0.008, 0.012, 0.18, 6]} />
            <meshStandardMaterial color="#214C38" roughness={0.6} />
          </mesh>
          <mesh position={[-0.08, 0.02, 0]} rotation={[0, 0, -0.9]} castShadow>
            <cylinderGeometry args={[0.008, 0.012, 0.18, 6]} />
            <meshStandardMaterial color="#173829" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.02, 0.08]} rotation={[0.9, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.012, 0.16, 6]} />
            <meshStandardMaterial color="#214C38" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Procedural Peppercorn
const Peppercorn: React.FC<{ color: string; scale?: number }> = ({ color, scale = 1 }) => {
  return (
    <mesh castShadow scale={scale}>
      <dodecahedronGeometry args={[0.09, 1]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

// Saffron Filament Curl
const SaffronFilament: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, -0.1, 0),
      new THREE.Vector3(-0.05, 0.08, 0.05),
      new THREE.Vector3(0.08, -0.02, -0.04),
      new THREE.Vector3(0.18, 0.12, 0.02)
    ]);
  }, []);

  return (
    <group scale={scale}>
      <mesh castShadow>
        <tubeGeometry args={[curve, 20, 0.012, 8, false]} />
        <meshStandardMaterial
          color="#d9480f"
          emissive="#b43403"
          emissiveIntensity={0.2}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};

export const FloatingIngredients: React.FC<FloatingIngredientsProps> = ({ reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate deterministic floating positions in 3D orbit around the dish
  const items = useMemo(() => {
    return [
      // Star Anise pods
      { type: 'star_anise', pos: [2.5, 0.8, -1.2], rotSpeed: [0.3, 0.4, 0.2], bobSpeed: 1.2, bobAmp: 0.15, scale: 0.95 },
      { type: 'star_anise', pos: [-2.6, 1.2, 0.8], rotSpeed: [-0.2, 0.3, 0.1], bobSpeed: 0.9, bobAmp: 0.18, scale: 0.8 },
      { type: 'star_anise', pos: [1.8, -0.8, 1.9], rotSpeed: [0.1, -0.3, 0.2], bobSpeed: 1.4, bobAmp: 0.12, scale: 0.75 },

      // Rosemary sprigs
      { type: 'rosemary', pos: [-2.8, -0.4, -1.0], rotSpeed: [0.2, 0.1, 0.4], bobSpeed: 0.8, bobAmp: 0.22, scale: 1.1 },
      { type: 'rosemary', pos: [2.7, 1.6, 0.5], rotSpeed: [-0.3, 0.2, -0.1], bobSpeed: 1.1, bobAmp: 0.16, scale: 0.9 },
      { type: 'rosemary', pos: [-1.4, 1.8, -1.8], rotSpeed: [0.15, -0.2, 0.3], bobSpeed: 1.3, bobAmp: 0.2, scale: 0.85 },

      // Peppercorns (black and pink)
      { type: 'peppercorn_black', pos: [1.6, 1.4, -1.5], rotSpeed: [0.5, 0.3, 0.4], bobSpeed: 1.6, bobAmp: 0.1, scale: 1.1 },
      { type: 'peppercorn_pink', pos: [-1.9, 0.5, 1.7], rotSpeed: [0.4, 0.5, 0.2], bobSpeed: 1.4, bobAmp: 0.12, scale: 1.2 },
      { type: 'peppercorn_black', pos: [2.2, -0.6, -0.8], rotSpeed: [-0.3, 0.4, 0.3], bobSpeed: 1.8, bobAmp: 0.08, scale: 0.9 },
      { type: 'peppercorn_pink', pos: [-2.2, -1.0, 1.2], rotSpeed: [0.2, -0.4, 0.5], bobSpeed: 1.2, bobAmp: 0.14, scale: 1.0 },

      // Saffron filaments
      { type: 'saffron', pos: [-1.2, 1.3, 1.6], rotSpeed: [0.3, 0.6, 0.2], bobSpeed: 1.5, bobAmp: 0.2, scale: 1.4 },
      { type: 'saffron', pos: [1.4, 0.6, 2.1], rotSpeed: [-0.2, 0.5, -0.4], bobSpeed: 1.7, bobAmp: 0.18, scale: 1.3 },
      { type: 'saffron', pos: [2.9, -0.2, 1.0], rotSpeed: [0.4, -0.3, 0.3], bobSpeed: 1.1, bobAmp: 0.15, scale: 1.2 }
    ];
  }, []);

  // Glowing hearth ember sparks
  const emberParticles = useMemo(() => {
    const embers = [];
    for (let i = 0; i < 28; i++) {
      const r1 = Math.abs(Math.sin(i * 19.34) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 47.91) * 43758.5453) % 1;
      const r3 = Math.abs(Math.sin(i * 83.12) * 43758.5453) % 1;
      const r4 = Math.abs(Math.sin(i * 12.55) * 43758.5453) % 1;
      embers.push({
        basePos: [
          (r1 - 0.5) * 6,
          -1.5 + r2 * 4,
          (r3 - 0.5) * 5
        ] as [number, number, number],
        speedY: 0.15 + r4 * 0.3,
        driftSpeed: 0.4 + r1 * 0.8,
        offset: r2 * Math.PI * 2,
        scale: 0.02 + r3 * 0.03
      });
    }
    return embers;
  }, []);

  const itemRefs = useRef<(THREE.Group | null)[]>([]);
  const emberRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const time = state.clock.getElapsedTime();

    // Animate floating culinary ingredients
    items.forEach((item, idx) => {
      const ref = itemRefs.current[idx];
      if (ref) {
        ref.position.y = item.pos[1] + Math.sin(time * item.bobSpeed) * item.bobAmp;
        ref.rotation.x += item.rotSpeed[0] * delta;
        ref.rotation.y += item.rotSpeed[1] * delta;
        ref.rotation.z += item.rotSpeed[2] * delta;
      }
    });

    // Animate glowing embers rising like woodfire hearth sparklets
    emberParticles.forEach((ember, idx) => {
      const ref = emberRefs.current[idx];
      if (ref) {
        ref.position.y += ember.speedY * delta;
        ref.position.x = ember.basePos[0] + Math.sin(time * ember.driftSpeed + ember.offset) * 0.15;
        if (ref.position.y > 3) {
          ref.position.y = -1.5;
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, idx) => (
        <group
          key={idx}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          position={item.pos as [number, number, number]}
        >
          {item.type === 'star_anise' && <StarAnise scale={item.scale} />}
          {item.type === 'rosemary' && <RosemarySprig scale={item.scale} />}
          {item.type === 'peppercorn_black' && <Peppercorn color="#1f1b18" scale={item.scale} />}
          {item.type === 'peppercorn_pink' && <Peppercorn color="#993848" scale={item.scale} />}
          {item.type === 'saffron' && <SaffronFilament scale={item.scale} />}
        </group>
      ))}

      {/* Luminous Champagne Gold Ambient Spark Particles */}
      {emberParticles.map((ember, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            emberRefs.current[idx] = el;
          }}
          position={ember.basePos}
          scale={ember.scale}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color="#C9A86B"
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
};
