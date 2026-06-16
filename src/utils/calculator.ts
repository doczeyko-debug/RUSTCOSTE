import { Explosive, RaidTarget } from '@prisma/client';

export interface RaidCost {
  explosive: Explosive;
  amount: number;
  totalSulfur: number;
  totalCharcoal: number;
  totalMetal: number;
}

// Factor de mitigación de daño (aproximaciones para balancear el daño base vs daño real a estructuras)
function getEffectiveDamage(explosive: Explosive, target: RaidTarget): number {
  let damage = explosive.damage;
  
  // Ajustes de Rust: los explosivos tienen daños distintos en estructuras
  if (explosive.name === 'Rocket') {
    damage = 137.5; // Daño real a estructuras
  } else if (explosive.name === 'C4') {
    damage = 275; // Daño real a estructuras
  } else if (explosive.name === 'Explosive Ammo') {
    if (target.category === 'Sheet Metal') damage = 15;
    else if (target.category === 'Wood') damage = 20;
    else if (target.category === 'Stone') damage = 5;
    else damage = 10;
  }
  
  return damage;
}

export function calculateRaidCost(target: RaidTarget, explosive: Explosive, quantity: number = 1): RaidCost {
  const effectiveDamage = getEffectiveDamage(explosive, target);
  
  // Cuántos explosivos se necesitan para 1 objetivo
  const amountPerTarget = Math.ceil(target.hp / effectiveDamage);
  const totalAmount = amountPerTarget * quantity;
  
  return {
    explosive,
    amount: totalAmount,
    totalSulfur: explosive.sulfur * totalAmount,
    totalCharcoal: explosive.charcoal * totalAmount,
    totalMetal: explosive.metalFragments * totalAmount,
  };
}
