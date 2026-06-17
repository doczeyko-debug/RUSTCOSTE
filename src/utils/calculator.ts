import { Explosive, RaidTarget } from '@prisma/client';

export interface RaidCost {
  explosive: Explosive;
  amount: number;
  totalSulfur: number;
  totalCharcoal: number;
  totalMetal: number;
}

// Obtiene la cantidad exacta de explosivos necesarios usando datos directos de RustLabs
function getExactAmount(explosive: Explosive, target: RaidTarget): number | null {
  const exp = explosive.name.toLowerCase();
  const tgt = target.name.toLowerCase();
  const cat = target.category;

  // Mapa de costos exactos: target -> explosive -> cantidad
  const exactCosts: Record<string, Record<string, number>> = {
    // PUERTAS
    'puerta de madera': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 19, 'granada de lata (beancan)': 6 },
    'puerta doble de madera': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 19, 'granada de lata (beancan)': 6 },
    'puerta de chapa': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18 },
    'puerta doble de chapa': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18 },
    'escotilla': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18 },
    'puerta de garaje': { 'cohete básico': 3, 'c4': 2, 'carga explosiva (satchel)': 9, 'bala explosiva': 150, 'granada de lata (beancan)': 42 },
    'puerta blindada': { 'cohete básico': 5, 'c4': 3, 'carga explosiva (satchel)': 15, 'bala explosiva': 250, 'granada de lata (beancan)': 72 },
    'puerta doble blindada': { 'cohete básico': 5, 'c4': 3, 'carga explosiva (satchel)': 15, 'bala explosiva': 250, 'granada de lata (beancan)': 72 },
    
    // PAREDES, TECHOS Y CIMIENTOS
    'madera (pared/techo/cimiento)': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13 },
    'pared de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13 },
    'techo de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13 },
    'cimiento de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13 },
    
    'piedra (pared/techo/cimiento)': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46 },
    'pared de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46 },
    'techo de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46 },
    'cimiento de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46 },

    'metal (pared/techo/cimiento)': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },
    'pared de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },
    'techo de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },
    'cimiento de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },

    'blindado (pared/techo/cimiento)': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 799, 'granada de lata (beancan)': 223 },
    'pared blindada': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 799, 'granada de lata (beancan)': 223 },
    'techo blindado': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 799, 'granada de lata (beancan)': 223 },
    'cimiento blindado': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 799, 'granada de lata (beancan)': 223 },

    // EXTERNOS
    'muro externo de madera': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 6, 'bala explosiva': 98, 'granada de lata (beancan)': 28 },
    'puerta externa de madera': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 6, 'bala explosiva': 98, 'granada de lata (beancan)': 28 },
    'muro externo de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46 },
    'puerta externa de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 185, 'granada de lata (beancan)': 46 },

    // VENTANAS
    'barras de madera para ventana': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13 },
    'barras de metal para ventana': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 12, 'bala explosiva': 200, 'granada de lata (beancan)': 56 },
    'cristal reforzado': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 12, 'bala explosiva': 200, 'granada de lata (beancan)': 56 },
    'barras blindadas para ventana': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },

    // OTROS
    'armario (tc)': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 9, 'granada de lata (beancan)': 3, 'cóctel molotov': 2 },
    'torreta automática': { 'cohete básico': 4, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 100, 'cohete de alta velocidad (hv)': 3 },
    'máquina expendedora': { 'c4': 3, 'carga explosiva (satchel)': 10, 'cohete básico': 10 },
    'banco de trabajo nivel 3': { 'cohete básico': 6, 'c4': 3, 'carga explosiva (satchel)': 15, 'bala explosiva': 250 }
  };

  if (exactCosts[tgt] && exactCosts[tgt][exp]) {
    return exactCosts[tgt][exp];
  }

  // Fallback fallback: Molotovs a madera (aprox)
  if (exp === 'cóctel molotov') {
    if (cat === 'Wood' || tgt.includes('madera')) return Math.ceil(target.hp / 25);
    return null; // Molotov no hace daño real a otros materiales
  }

  return null;
}

export function calculateRaidCost(target: RaidTarget, explosive: Explosive, quantity: number = 1): RaidCost {
  const exactAmount = getExactAmount(explosive, target);
  let amountPerTarget = 0;

  if (exactAmount !== null) {
    amountPerTarget = exactAmount;
  } else {
    // Si no está mapeado explícitamente, usa la matemática tradicional (menos precisa pero sirve de fallback)
    let damage = explosive.damage;
    const expName = explosive.name.toLowerCase();
    
    // Solo aplicamos 137 a cohetes básicos, no a los HV (que tienen su propio daño estructurado en la DB)
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

  const totalAmount = amountPerTarget * quantity;
  
  // Si el explosivo no cuesta azufre (ej. Molotov), solo es "barato" (0 azufre) para madera/TC.
  // Para piedra o metal, le asignamos costo de azufre Infinito para que no se recomiende.
  const isWoodOrTC = target.category === 'Wood' || 
                      target.name.toLowerCase().includes('armario') || 
                      target.name.toLowerCase().includes('tc');
  const totalSulfur = (explosive.sulfur === 0 && !isWoodOrTC) 
                      ? Infinity 
                      : explosive.sulfur * totalAmount;

  return {
    explosive,
    amount: totalAmount,
    totalSulfur,
    totalCharcoal: explosive.charcoal * totalAmount,
    totalMetal: explosive.metalFragments * totalAmount,
  };
}
