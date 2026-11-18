import type { MapPower } from '../appTypes';
import { SimulationEngine } from '../simulation';
import React, { useCallback } from 'react';

export interface usePowersParams {
  simulationRef: React.RefObject<SimulationEngine>;
  followedMarbleIdRef: React.RefObject<string | null>;
  flashToast: (msg: string, ms?: number) => void;
  boostCooldownRef: React.RefObject<number>;
  setBoostCooldown: React.Dispatch<React.SetStateAction<number>>;
  shieldCooldownRef: React.RefObject<number>;
  setShieldCooldown: React.Dispatch<React.SetStateAction<number>>;
  healCooldownRef: React.RefObject<number>;
  setHealCooldown: React.Dispatch<React.SetStateAction<number>>;
  camXRef: React.RefObject<number>;
  camYRef: React.RefObject<number>;
  empCooldownRef: React.RefObject<number>;
  setEmpCooldown: React.Dispatch<React.SetStateAction<number>>;
  setSelectedPower: React.Dispatch<React.SetStateAction<MapPower | null>>;
  barricadeCooldownRef: React.RefObject<number>;
  setBarricadeCooldown: React.Dispatch<React.SetStateAction<number>>;
  airdropCooldownRef: React.RefObject<number>;
  setAirdropCooldown: React.Dispatch<React.SetStateAction<number>>;
}

/** Targeted marble powers (boost/shield/heal) and commander map powers (EMP/barricade/airdrop), with cooldowns. */
export function usePowers({
  simulationRef,
  followedMarbleIdRef,
  flashToast,
  boostCooldownRef,
  setBoostCooldown,
  shieldCooldownRef,
  setShieldCooldown,
  healCooldownRef,
  setHealCooldown,
  camXRef,
  camYRef,
  empCooldownRef,
  setEmpCooldown,
  setSelectedPower,
  barricadeCooldownRef,
  setBarricadeCooldown,
  airdropCooldownRef,
  setAirdropCooldown,
}: usePowersParams) {
  // Targeted Marble Powers (Boost, Shield, Heal) on followed marble
  const activateTargetedPower = useCallback(
    (kind: 'boost' | 'shield' | 'heal') => {
      const sim = simulationRef.current;
      const targetId =
        followedMarbleIdRef.current || sim.getPlayerMarbles().find((m) => !m.isZombie && !m.finished && !m.gone)?.id;
      if (!targetId) {
        flashToast('NO HAY SUPERVIVIENTE ACTIVO');
        return;
      }

      if (kind === 'boost') {
        if (boostCooldownRef.current > 0) return;
        if (sim.triggerBoost(targetId)) {
          boostCooldownRef.current = 8;
          setBoostCooldown(8);
          flashToast('⚡ TURBO BOOST ACTIVADO');
        } else {
          flashToast('ELIGE UN HUMANO VIVO PARA BOOST');
        }
      } else if (kind === 'shield') {
        if (shieldCooldownRef.current > 0) return;
        if (sim.triggerShield(targetId)) {
          shieldCooldownRef.current = 12;
          setShieldCooldown(12);
          flashToast('🛡️ ESCUDO ENERGÉTICO ACTIVO');
        } else {
          flashToast('ELIGE UN HUMANO VIVO PARA ESCUDO');
        }
      } else if (kind === 'heal') {
        if (healCooldownRef.current > 0) return;
        if (sim.triggerHeal(targetId)) {
          healCooldownRef.current = 14;
          setHealCooldown(14);
          flashToast('❤️ CURACIÓN +2 HP APLICADA');
        } else {
          flashToast('HP AL MÁXIMO O CANICA NO VÁLIDA');
        }
      }
    },
    [flashToast],
  );

  // Map-Click Commander Powers (EMP, Barricade, Airdrop)
  const activateMapPower = useCallback(
    (power: MapPower, targetX?: number, targetY?: number) => {
      const sim = simulationRef.current;
      let tx = targetX;
      let ty = targetY;
      if (tx === undefined || ty === undefined) {
        const leader = sim.getLeader();
        tx = leader ? (leader.renderX ?? leader.x) : camXRef.current;
        ty = leader ? (leader.renderY ?? leader.y) : camYRef.current;
      }

      if (power === 'emp') {
        if (empCooldownRef.current > 0) return;
        sim.triggerEmp(tx, ty);
        empCooldownRef.current = 12;
        setEmpCooldown(12);
        setSelectedPower(null);
        flashToast('💥 ¡ONDA EMP DESCARGADA!');
      } else if (power === 'barricade') {
        if (barricadeCooldownRef.current > 0) return;
        sim.deployBarricade(tx, ty);
        barricadeCooldownRef.current = 10;
        setBarricadeCooldown(10);
        setSelectedPower(null);
        flashToast('🛡️ ¡BARRICADA LÁSER DESPLEGADA!');
      } else if (power === 'airdrop') {
        if (airdropCooldownRef.current > 0) return;
        sim.deployAirdrop(tx, ty);
        airdropCooldownRef.current = 15;
        setAirdropCooldown(15);
        setSelectedPower(null);
        flashToast('📦 ¡SUMINISTRO AÉREO LANZADO!');
      }
    },
    [flashToast],
  );

  return { activateTargetedPower, activateMapPower };
}
