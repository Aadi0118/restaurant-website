import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PhotoDish3D } from './PhotoDish3D';
import { FloatingIngredients } from './FloatingIngredients';
import { CinematicLighting } from './CinematicLighting';
import { SignatureDishOption } from '../../types/dining';

interface SignatureDishSceneProps {
  dishOption: SignatureDishOption;
  reducedMotion?: boolean;
  scrollProgress: number;
}

export const SignatureDishScene: React.FC<SignatureDishSceneProps> = ({
  dishOption,
  reducedMotion = false,
  scrollProgress
}) => {
  const dishGroupRef = useRef<THREE.Group>(null);
  const transitionRef = useRef(1.0);
  const prevDishId = useRef(dishOption.id);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5.5;

  // Touch & Pointer Drag state for direct tactile rotation
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentDrag = useRef({ x: 0, y: 0 });

  // Trigger gentle scale-flourish transition when dish swaps
  useEffect(() => {
    if (prevDishId.current !== dishOption.id) {
      prevDishId.current = dishOption.id;
      transitionRef.current = 0.65; // brief scale down then smooth spring back
    }
  }, [dishOption.id]);

  // Attach touch/mouse drag handlers for tactile 360-degree plate rotation
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Only drag if left click or touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = (e.clientX - dragStart.current.x) * 0.006;
      const deltaY = (e.clientY - dragStart.current.y) * 0.004;
      currentDrag.current = {
        x: currentDrag.current.x + deltaX,
        y: Math.max(-0.4, Math.min(0.4, currentDrag.current.y + deltaY))
      };
      setDragOffset({ ...currentDrag.current });
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!dishGroupRef.current) return;

    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    // Smooth transition spring when swapping dishes
    transitionRef.current = THREE.MathUtils.damp(transitionRef.current, 1.0, 4.5, delta);

    if (reducedMotion) {
      // Fixed elegant presentation for users with vestibular sensitivity
      dishGroupRef.current.position.set(isMobile ? 0 : 0.8, -0.2, 0);
      dishGroupRef.current.rotation.set(0.42, 0.35, 0);
      return;
    }

    // Dynamic scroll parallax:
    const scrollTargetX = isMobile ? 0 : 0.9 - scrollProgress * 0.4;
    const scrollTargetY = -0.15 + Math.sin(time * 1.2) * 0.06 - scrollProgress * 0.3;
    const scrollTargetZ = scrollProgress * 0.8;

    // Smooth position lerp
    dishGroupRef.current.position.x = THREE.MathUtils.damp(dishGroupRef.current.position.x, scrollTargetX, 4, delta);
    dishGroupRef.current.position.y = THREE.MathUtils.damp(dishGroupRef.current.position.y, scrollTargetY, 4, delta);
    dishGroupRef.current.position.z = THREE.MathUtils.damp(dishGroupRef.current.position.z, scrollTargetZ, 4, delta);

    // Target rotation combining:
    // 1. Initial gourmet tilt (0.45 rad ~ 25 deg downward)
    // 2. Continuous slow presentation spin
    // 3. Pointer tilt
    // 4. User touch-drag offset
    // 5. Scroll-driven angle transition
    const baseRotationX = 0.45 - pointer.y * 0.28 + dragOffset.y + scrollProgress * 0.2;
    const baseRotationY = (time * 0.22) + (pointer.x * 0.45) + dragOffset.x + (scrollProgress * Math.PI * 0.6);
    const baseRotationZ = (pointer.x * -0.08) + Math.sin(time * 0.8) * 0.03;

    dishGroupRef.current.rotation.x = THREE.MathUtils.damp(dishGroupRef.current.rotation.x, baseRotationX, 5, delta);
    dishGroupRef.current.rotation.y = THREE.MathUtils.damp(dishGroupRef.current.rotation.y, baseRotationY, 5, delta);
    dishGroupRef.current.rotation.z = THREE.MathUtils.damp(dishGroupRef.current.rotation.z, baseRotationZ, 5, delta);

    // Apply smooth swap scale
    const baseScale = (isMobile ? 0.72 : 1.0) * transitionRef.current;
    dishGroupRef.current.scale.set(baseScale, baseScale, baseScale);
  });

  return (
    <>
      <CinematicLighting accentLightColor={dishOption.accentLight} />

      {/* Floating ingredients orbiting in 3D space */}
      <FloatingIngredients reducedMotion={reducedMotion} />

      {/* Main Signature Dish Centerpiece with dynamic swap */}
      <group ref={dishGroupRef}>
        <PhotoDish3D
          dishOption={dishOption}
          accentColor={dishOption.accentLight}
          hasGoldFlakes={dishOption.goldFlakes}
        />
      </group>
    </>
  );
};


