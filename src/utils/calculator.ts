import { Explosive, RaidTarget } from '@prisma/client';

export interface RaidCost {
  explosive: Explosive;
  amount: number;
  totalSulfur: number;
  totalCharcoal: number;
  totalMetal: number;
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
    'workbench level 3': 'banco de trabajo nivel 3'
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

// Obtiene la cantidad exacta de explosivos necesarios usando datos directos de RustLabs
function getExactAmount(explosive: Explosive, target: RaidTarget): number | null {
  const exp = explosive.name.toLowerCase();
  const tgt = target.name.toLowerCase();

  // Mapa de costos exactos: target -> explosive -> cantidad
  const exactCosts: Record<string, Record<string, number>> = {
    // PUERTAS
    'puerta de madera': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 19, 'granada de lata (beancan)': 6, 'cohete de alta velocidad (hv)': 2, 'cóctel molotov': 2 },
    'puerta doble de madera': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 19, 'granada de lata (beancan)': 6, 'cohete de alta velocidad (hv)': 2, 'cóctel molotov': 2 },
    'puerta de chapa': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18, 'cohete de alta velocidad (hv)': 5 },
    'puerta doble de chapa': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18, 'cohete de alta velocidad (hv)': 5 },
    'escotilla': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18, 'cohete de alta velocidad (hv)': 5 },
    'puerta de garaje': { 'cohete básico': 3, 'c4': 2, 'carga explosiva (satchel)': 9, 'bala explosiva': 150, 'granada de lata (beancan)': 42, 'cohete de alta velocidad (hv)': 12 },
    'puerta blindada': { 'cohete básico': 5, 'c4': 3, 'carga explosiva (satchel)': 15, 'bala explosiva': 250, 'granada de lata (beancan)': 69, 'cohete de alta velocidad (hv)': 16 },
    'puerta doble blindada': { 'cohete básico': 5, 'c4': 3, 'carga explosiva (satchel)': 15, 'bala explosiva': 250, 'granada de lata (beancan)': 69, 'cohete de alta velocidad (hv)': 16 },
    
    // PAREDES, TECHOS Y CIMIENTOS
    'madera (pared/techo/cimiento)': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cohete de alta velocidad (hv)': 8, 'cóctel molotov': 4 },
    'pared de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cohete de alta velocidad (hv)': 8, 'cóctel molotov': 4 },
    'techo de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cohete de alta velocidad (hv)': 8, 'cóctel molotov': 4 },
    'cimiento de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cohete de alta velocidad (hv)': 8, 'cóctel molotov': 4 },
    
    'piedra (pared/techo/cimiento)': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 33 },
    'pared de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 33 },
    'techo de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 33 },
    'cimiento de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 33 },

    'metal (pared/techo/cimiento)': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },
    'pared de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },
    'techo de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },
    'cimiento de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },

    'blindado (pared/techo/cimiento)': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 799, 'granada de lata (beancan)': 262 },
    'pared blindada': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 799, 'granada de lata (beancan)': 262 },
    'techo blindado': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 799, 'granada de lata (beancan)': 262 },
    'cimiento blindado': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 799, 'granada de lata (beancan)': 262 },

    // EXTERNOS
    'muro externo de madera': { 'cohete básico': 3, 'c4': 2, 'carga explosiva (satchel)': 6, 'bala explosiva': 98, 'granada de lata (beancan)': 26, 'cóctel molotov': 4 },
    'puerta externa de madera': { 'cohete básico': 3, 'c4': 2, 'carga explosiva (satchel)': 6, 'bala explosiva': 98, 'granada de lata (beancan)': 26, 'cóctel molotov': 4 },
    'muro externo de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 33 },
    'puerta externa de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 33 },

    // VENTANAS
    'barras de madera para ventana': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cóctel molotov': 4 },
    'barras de metal para ventana': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 12, 'bala explosiva': 200, 'granada de lata (beancan)': 56 },
    'cristal reforzado': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 12, 'bala explosiva': 200, 'granada de lata (beancan)': 56 },
    'barras blindadas para ventana': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },

    // OTROS
    'armario (tc)': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 9, 'granada de lata (beancan)': 3, 'cóctel molotov': 2 },
    'torreta automática': { 'cohete básico': 4, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 100, 'cohete de alta velocidad (hv)': 3 },
    'máquina expendedora': { 'cohete básico': 10, 'c4': 3, 'carga explosiva (satchel)': 10, 'bala explosiva': 150 },
    'banco de trabajo nivel 3': { 'cohete básico': 6, 'c4': 3, 'carga explosiva (satchel)': 15, 'bala explosiva': 250 }
  };

  if (exactCosts[tgt] && exactCosts[tgt][exp]) {
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
