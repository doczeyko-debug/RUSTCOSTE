import { Explosive, RaidTarget } from '@prisma/client';
import { prisma } from './database';

export interface RaidCost {
  explosive: Explosive;
  amount: number;
  totalSulfur: number;
  totalCharcoal: number;
  totalMetal: number;
}

// Caché en memoria para costos de raideo exactos de la base de datos
let exactCosts: Record<string, Record<string, number>> = {};

export async function loadCalculatorCache() {
  const costs = await prisma.raidCost.findMany({
    include: {
      target: true,
      explosive: true
    }
  });

  const newCosts: Record<string, Record<string, number>> = {};
  for (const c of costs) {
    const tgt = c.target.name.toLowerCase();
    const exp = c.explosive.name.toLowerCase();
    if (!newCosts[tgt]) {
      newCosts[tgt] = {};
    }
    newCosts[tgt][exp] = c.quantity;
  }
  exactCosts = newCosts;
}

export async function reloadCalculatorCache() {
  await loadCalculatorCache();
}

// Diccionario de traducción bilingüe para objetivos de raideo
export function normalizeTargetName(name: string): string {
  const clean = name.toLowerCase().trim();
  
  const targetMap: Record<string, string> = {
    'wood wall': 'pared de madera',
    'wooden wall': 'pared de madera',
    'stone wall': 'pared de piedra',
    'sheet metal wall': 'pared de chapa',
    'metal wall': 'pared de chapa',
    'armored wall': 'pared blindada',
    
    'wood door': 'puerta de madera',
    'wooden door': 'puerta de madera',
    'double wood door': 'puerta doble de madera',
    'double wooden door': 'puerta doble de madera',
    'sheet metal door': 'puerta de chapa',
    'double sheet metal door': 'puerta doble de chapa',
    'garage door': 'puerta de garaje',
    'armored door': 'puerta blindada',
    'double armored door': 'puerta doble blindada',
    
    'wood ceiling': 'techo de madera',
    'wooden ceiling': 'techo de madera',
    'stone ceiling': 'techo de piedra',
    'sheet metal ceiling': 'techo de chapa',
    'metal ceiling': 'techo de chapa',
    'armored ceiling': 'techo blindado',
    
    'wood foundation': 'cimiento de madera',
    'wooden foundation': 'cimiento de madera',
    'stone foundation': 'cimiento de piedra',
    'sheet metal foundation': 'cimiento de chapa',
    'metal foundation': 'cimiento de chapa',
    'armored foundation': 'cimiento blindado',
    
    'tool cupboard': 'armario (tc)',
    'tc': 'armario (tc)',
    'hatch': 'escotilla',
    'high external wooden wall': 'muro externo de madera',
    'high external wood wall': 'muro externo de madera',
    'high external stone wall': 'muro externo de piedra',
    'high external wooden gate': 'puerta externa de madera',
    'high external wood gate': 'puerta externa de madera',
    'high external stone gate': 'puerta externa de piedra',
    
    'wooden window bars': 'barras de madera para ventana',
    'metal window bars': 'barras de metal para ventana',
    'reinforced glass': 'cristal reforzado',
    'reinforced glass window': 'cristal reforzado',
    'reinforced window bars': 'barras blindadas para ventana',
    
    'auto turret': 'torreta automática',
    'vending machine': 'máquina expendedora',
    'workbench 3': 'banco de trabajo nivel 3',
    'workbench level 3': 'banco de trabajo nivel 3',
    'metal shop front': 'frente de tienda metálico'
  };

  return targetMap[clean] || clean;
}

// Diccionario de traducción bilingüe para explosivos
export function normalizeExplosiveName(name: string): string {
  const clean = name.toLowerCase().trim();
  
  const explosiveMap: Record<string, string> = {
    'rocket': 'cohete básico',
    'basic rocket': 'cohete básico',
    'c4': 'c4',
    'timed explosive charge': 'c4',
    'satchel': 'carga explosiva (satchel)',
    'satchel charge': 'carga explosiva (satchel)',
    'explosive ammo': 'bala explosiva',
    'explosive 5.56': 'bala explosiva',
    'hv rocket': 'cohete de alta velocidad (hv)',
    'high velocity rocket': 'cohete de alta velocidad (hv)',
    'beancan': 'granada de lata (beancan)',
    'beancan grenade': 'granada de lata (beancan)',
    'f1': 'granada f1',
    'f1 grenade': 'granada f1',
    '40mm he': 'granada he de 40mm',
    '40mm grenade': 'granada he de 40mm',
    'incendiary rocket': 'cohete incendiario',
    'mortar': 'mortero',
    'torpedo': 'torpedo',
    'molotov': 'cóctel molotov',
    'molotov cocktail': 'cóctel molotov'
  };

  return explosiveMap[clean] || clean;
}

// Obtiene la cantidad exacta de explosivos necesarios usando la caché de base de datos
function getExactAmount(explosive: Explosive, target: RaidTarget): number | null {
  const exp = explosive.name.toLowerCase();
  const tgt = target.name.toLowerCase();

  if (exactCosts[tgt] && exactCosts[tgt][exp] !== undefined) {
    return exactCosts[tgt][exp];
  }

  return null;
}

export function calculateRaidCost(target: RaidTarget, explosive: Explosive, quantity: number = 1): RaidCost {
  const exactAmount = getExactAmount(explosive, target);
  let amountPerTarget = 0;

  const expName = explosive.name.toLowerCase();
  const tgtName = target.name.toLowerCase();

  // Validar si el explosivo es aplicable al objetivo
  let isApplicable = true;
  if (expName.includes('molotov')) {
    isApplicable = target.category === 'Wood' || 
                   tgtName.includes('madera') || 
                   tgtName.includes('armario') || 
                   tgtName.includes('tc') ||
                   target.category === 'Glass' ||
                   tgtName.includes('cristal');
  } else if (expName.includes('f1')) {
    isApplicable = target.category === 'Wood' || 
                   tgtName.includes('madera') || 
                   tgtName.includes('armario') || 
                   tgtName.includes('tc') ||
                   tgtName.includes('torreta');
  } else if (expName.includes('torpedo')) {
    isApplicable = tgtName.includes('torpedo') || tgtName.includes('bote') || tgtName.includes('submarino');
  }

  if (!isApplicable) {
    amountPerTarget = Infinity;
  } else if (exactAmount !== null) {
    amountPerTarget = exactAmount;
  } else {
    // Si no está mapeado explícitamente, usa la matemática tradicional de fallback
    let damage = explosive.damage;
    
    // Solo aplicamos 137 a cohetes básicos, no a los HV
    if ((expName.includes('rocket') || expName.includes('cohete')) && 
        !expName.includes('hv') && 
        !expName.includes('alta velocidad')) {
      damage = 137;
    } else if (expName.includes('c4')) {
      damage = 275;
    } else if (expName.includes('satchel')) {
      damage = 69;
    }
    
    amountPerTarget = Math.ceil(target.hp / damage);
  }

  const totalAmount = amountPerTarget === Infinity ? Infinity : amountPerTarget * quantity;
  
  const isWoodOrTC = target.category === 'Wood' || 
                      target.name.toLowerCase().includes('armario') || 
                      target.name.toLowerCase().includes('tc');

  const totalSulfur = (explosive.sulfur === 0 && !isWoodOrTC) || totalAmount === Infinity
                      ? Infinity 
                      : explosive.sulfur * totalAmount;

  return {
    explosive,
    amount: totalAmount,
    totalSulfur,
    totalCharcoal: totalAmount === Infinity ? Infinity : explosive.charcoal * totalAmount,
    totalMetal: totalAmount === Infinity ? Infinity : explosive.metalFragments * totalAmount,
  };
}
