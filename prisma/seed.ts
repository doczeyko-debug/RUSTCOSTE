import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeding de la base de datos...');

  // Limpiar tablas existentes si las hay
  await prisma.raidCost.deleteMany({});
  await prisma.explosive.deleteMany({});
  await prisma.raidTarget.deleteMany({});

  // Insertar Explosivos en Español
  const explosives = [
    { name: 'Cohete Básico', sulfur: 1400, charcoal: 1950, metalFragments: 100, cloth: 0, techTrash: 0, damage: 137 },
    { name: 'C4', sulfur: 2200, charcoal: 3000, metalFragments: 200, cloth: 20, techTrash: 2, damage: 275 },
    { name: 'Carga Explosiva (Satchel)', sulfur: 480, charcoal: 720, metalFragments: 80, cloth: 11, techTrash: 0, damage: 68 },
    { name: 'Bala Explosiva', sulfur: 5, charcoal: 6, metalFragments: 1, cloth: 0, techTrash: 0, damage: 3 },
    { name: 'Cohete de Alta Velocidad (HV)', sulfur: 200, charcoal: 300, metalFragments: 100, cloth: 0, techTrash: 0, damage: 22 },
    { name: 'Granada de Lata (Beancan)', sulfur: 120, charcoal: 180, metalFragments: 20, cloth: 0, techTrash: 0, damage: 14 },
    { name: 'Granada F1', sulfur: 60, charcoal: 90, metalFragments: 25, cloth: 0, techTrash: 0, damage: 10 },
    { name: 'Granada HE de 40mm', sulfur: 60, charcoal: 90, metalFragments: 25, cloth: 0, techTrash: 0, damage: 14 },
    { name: 'Cohete Incendiario', sulfur: 1400, charcoal: 1950, metalFragments: 100, cloth: 0, techTrash: 0, damage: 150 },
    { name: 'Mortero', sulfur: 1000, charcoal: 1500, metalFragments: 50, cloth: 0, techTrash: 0, damage: 35 },
    { name: 'Torpedo', sulfur: 20, charcoal: 30, metalFragments: 33, cloth: 0, techTrash: 0, damage: 75 },
    { name: 'Cóctel Molotov', sulfur: 0, charcoal: 0, metalFragments: 0, cloth: 10, techTrash: 0, damage: 25 }
  ];

  const dbExplosives: Record<string, any> = {};
  for (const exp of explosives) {
    const created = await prisma.explosive.create({ data: exp });
    dbExplosives[created.name.toLowerCase()] = created;
  }

  // Insertar Objetivos de Raideo en Español
  const targets = [
    // Genéricos
    { name: 'Madera (Pared/Techo/Cimiento)', hp: 250, category: 'Wood' },
    { name: 'Piedra (Pared/Techo/Cimiento)', hp: 500, category: 'Stone' },
    { name: 'Metal (Pared/Techo/Cimiento)', hp: 1000, category: 'Sheet Metal' },
    { name: 'Blindado (Pared/Techo/Cimiento)', hp: 2000, category: 'Armored' },

    // Puertas
    { name: 'Puerta de Madera', hp: 200, category: 'Wood' },
    { name: 'Puerta Doble de Madera', hp: 200, category: 'Wood' },
    { name: 'Puerta de Chapa', hp: 250, category: 'Sheet Metal' },
    { name: 'Puerta Doble de Chapa', hp: 250, category: 'Sheet Metal' },
    { name: 'Puerta de Garaje', hp: 600, category: 'Sheet Metal' },
    { name: 'Puerta Blindada', hp: 1000, category: 'Armored' },
    { name: 'Puerta Doble Blindada', hp: 1000, category: 'Armored' },

    // Muros
    { name: 'Pared de Madera', hp: 250, category: 'Wood' },
    { name: 'Pared de Piedra', hp: 500, category: 'Stone' },
    { name: 'Pared de Chapa', hp: 1000, category: 'Sheet Metal' },
    { name: 'Pared Blindada', hp: 2000, category: 'Armored' },

    // Techos
    { name: 'Techo de Madera', hp: 250, category: 'Wood' },
    { name: 'Techo de Piedra', hp: 500, category: 'Stone' },
    { name: 'Techo de Chapa', hp: 1000, category: 'Sheet Metal' },
    { name: 'Techo Blindado', hp: 2000, category: 'Armored' },

    // Cimientos
    { name: 'Cimiento de Madera', hp: 250, category: 'Wood' },
    { name: 'Cimiento de Piedra', hp: 500, category: 'Stone' },
    { name: 'Cimiento de Chapa', hp: 1000, category: 'Sheet Metal' },
    { name: 'Cimiento Blindado', hp: 2000, category: 'Armored' },

    // Otros Elementos de Base
    { name: 'Armario (TC)', hp: 100, category: 'Wood' },
    { name: 'Escotilla', hp: 250, category: 'Sheet Metal' },
    { name: 'Muro Externo de Madera', hp: 500, category: 'Wood' },
    { name: 'Muro Externo de Piedra', hp: 1000, category: 'Stone' },
    { name: 'Puerta Externa de Madera', hp: 500, category: 'Wood' },
    { name: 'Puerta Externa de Piedra', hp: 1000, category: 'Stone' },
    
    // Ventanas y Barrotes
    { name: 'Barras de Madera para Ventana', hp: 250, category: 'Wood' },
    { name: 'Barras de Metal para Ventana', hp: 500, category: 'Sheet Metal' },
    { name: 'Cristal Reforzado', hp: 350, category: 'Glass' },
    { name: 'Barras Blindadas para Ventana', hp: 500, category: 'Armored' },

    // Solo mantenemos los esenciales
    { name: 'Torreta Automática', hp: 1000, category: 'Deployable' },
    { name: 'Máquina Expendedora', hp: 2500, category: 'Deployable' },
    { name: 'Banco de Trabajo Nivel 3', hp: 750, category: 'Deployable' },
    { name: 'Frente de Tienda Metálico', hp: 500, category: 'Sheet Metal' }
  ];

  const dbTargets: Record<string, any> = {};
  for (const target of targets) {
    const created = await prisma.raidTarget.create({ data: target });
    dbTargets[created.name.toLowerCase()] = created;
  }

  // Mapa de costos exactos iniciales (sincronizados de calculator.ts y corregidos si es necesario)
  const exactCosts: Record<string, Record<string, number>> = {
    // PUERTAS
    'puerta de madera': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 18, 'granada de lata (beancan)': 6, 'cohete de alta velocidad (hv)': 2, 'cóctel molotov': 2 },
    'puerta doble de madera': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 18, 'granada de lata (beancan)': 6, 'cohete de alta velocidad (hv)': 2, 'cóctel molotov': 2 },
    'puerta de chapa': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18, 'cohete de alta velocidad (hv)': 11 },
    'puerta doble de chapa': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18, 'cohete de alta velocidad (hv)': 11 },
    'escotilla': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 63, 'granada de lata (beancan)': 18, 'cohete de alta velocidad (hv)': 11 },
    'puerta de garaje': { 'cohete básico': 3, 'c4': 2, 'carga explosiva (satchel)': 9, 'bala explosiva': 152, 'granada de lata (beancan)': 42, 'cohete de alta velocidad (hv)': 25 },
    'puerta blindada': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 12, 'bala explosiva': 200, 'granada de lata (beancan)': 69, 'cohete de alta velocidad (hv)': 16 },
    'puerta doble blindada': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 12, 'bala explosiva': 200, 'granada de lata (beancan)': 69, 'cohete de alta velocidad (hv)': 16 },
    
    // PAREDES, TECHOS Y CIMIENTOS
    'madera (pared/techo/cimiento)': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cohete de alta velocidad (hv)': 8, 'cóctel molotov': 4 },
    'pared de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cohete de alta velocidad (hv)': 8, 'cóctel molotov': 4 },
    'techo de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cohete de alta velocidad (hv)': 8, 'cóctel molotov': 4 },
    'cimiento de madera': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cohete de alta velocidad (hv)': 8, 'cóctel molotov': 4 },
    
    'piedra (pared/techo/cimiento)': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 209, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 32 },
    'pared de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 209, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 32 },
    'techo de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 209, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 32 },
    'cimiento de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 209, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 32 },

    'metal (pared/techo/cimiento)': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 417, 'granada de lata (beancan)': 112, 'cohete de alta velocidad (hv)': 33 },
    'pared de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 417, 'granada de lata (beancan)': 112, 'cohete de alta velocidad (hv)': 33 },
    'techo de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 417, 'granada de lata (beancan)': 112, 'cohete de alta velocidad (hv)': 33 },
    'cimiento de chapa': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 417, 'granada de lata (beancan)': 112, 'cohete de alta velocidad (hv)': 33 },

    'blindado (pared/techo/cimiento)': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 834, 'granada de lata (beancan)': 262, 'cohete de alta velocidad (hv)': 67 },
    'pared blindada': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 834, 'granada de lata (beancan)': 262, 'cohete de alta velocidad (hv)': 67 },
    'techo blindado': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 834, 'granada de lata (beancan)': 262, 'cohete de alta velocidad (hv)': 67 },
    'cimiento blindado': { 'cohete básico': 15, 'c4': 8, 'carga explosiva (satchel)': 46, 'bala explosiva': 834, 'granada de lata (beancan)': 262, 'cohete de alta velocidad (hv)': 67 },

    // EXTERNOS
    'muro externo de madera': { 'cohete básico': 3, 'c4': 2, 'carga explosiva (satchel)': 6, 'bala explosiva': 98, 'granada de lata (beancan)': 26, 'cóctel molotov': 4 },
    'puerta externa de madera': { 'cohete básico': 3, 'c4': 2, 'carga explosiva (satchel)': 6, 'bala explosiva': 98, 'granada de lata (beancan)': 26, 'cóctel molotov': 4 },
    'muro externo de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 209, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 32 },
    'puerta externa de piedra': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 10, 'bala explosiva': 209, 'granada de lata (beancan)': 46, 'cohete de alta velocidad (hv)': 32 },

    // VENTANAS
    'barras de madera para ventana': { 'cohete básico': 2, 'c4': 1, 'carga explosiva (satchel)': 3, 'bala explosiva': 49, 'granada de lata (beancan)': 13, 'cóctel molotov': 4 },
    'barras de metal para ventana': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 12, 'bala explosiva': 200, 'granada de lata (beancan)': 56 },
    'cristal reforzado': { 'cohete básico': 4, 'c4': 2, 'carga explosiva (satchel)': 12, 'bala explosiva': 200, 'granada de lata (beancan)': 56 },
    'barras blindadas para ventana': { 'cohete básico': 8, 'c4': 4, 'carga explosiva (satchel)': 23, 'bala explosiva': 400, 'granada de lata (beancan)': 112 },

    // OTROS
    'armario (tc)': { 'cohete básico': 1, 'c4': 1, 'carga explosiva (satchel)': 2, 'bala explosiva': 9, 'granada de lata (beancan)': 3, 'cóctel molotov': 2 },
    'torreta automática': { 'cohete básico': 4, 'c4': 1, 'carga explosiva (satchel)': 4, 'bala explosiva': 100, 'cohete de alta velocidad (hv)': 3 },
    'máquina expendedora': { 'cohete básico': 10, 'c4': 3, 'carga explosiva (satchel)': 10, 'bala explosiva': 150 },
    'banco de trabajo nivel 3': { 'cohete básico': 6, 'c4': 3, 'carga explosiva (satchel)': 15, 'bala explosiva': 250 },
    'frente de tienda metálico': { 'cohete básico': 6, 'c4': 3, 'carga explosiva (satchel)': 18, 'bala explosiva': 300 }
  };

  for (const [tgtName, expMap] of Object.entries(exactCosts)) {
    const target = dbTargets[tgtName];
    if (!target) {
      console.warn(`Objetivo no encontrado en DB para el costo: ${tgtName}`);
      continue;
    }

    for (const [expName, qty] of Object.entries(expMap)) {
      const explosive = dbExplosives[expName];
      if (!explosive) {
        console.warn(`Explosivo no encontrado en DB para el costo: ${expName}`);
        continue;
      }

      await prisma.raidCost.create({
        data: {
          targetId: target.id,
          explosiveId: explosive.id,
          quantity: qty
        }
      });
    }
  }

  console.log('¡Seeding completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
