import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeding de la base de datos...');

  // Limpiar tablas existentes si las hay
  await prisma.explosive.deleteMany({});
  await prisma.raidTarget.deleteMany({});

  // Insertar Explosivos en Español
  const explosives = [
    { name: 'Cohete Básico', sulfur: 1400, charcoal: 1950, metalFragments: 100, cloth: 0, techTrash: 0, damage: 137 },
    { name: 'C4', sulfur: 2200, charcoal: 3000, metalFragments: 200, cloth: 5, techTrash: 2, damage: 275 },
    { name: 'Carga Explosiva (Satchel)', sulfur: 480, charcoal: 720, metalFragments: 80, cloth: 11, techTrash: 0, damage: 68 },
    { name: 'Bala Explosiva', sulfur: 25, charcoal: 30, metalFragments: 5, cloth: 0, techTrash: 0, damage: 3 },
    { name: 'Cohete de Alta Velocidad (HV)', sulfur: 200, charcoal: 300, metalFragments: 100, cloth: 0, techTrash: 0, damage: 22 },
    { name: 'Granada de Lata (Beancan)', sulfur: 120, charcoal: 180, metalFragments: 20, cloth: 0, techTrash: 0, damage: 14 },
    { name: 'Granada F1', sulfur: 60, charcoal: 90, metalFragments: 25, cloth: 0, techTrash: 0, damage: 10 },
    { name: 'Granada HE de 40mm', sulfur: 60, charcoal: 90, metalFragments: 25, cloth: 0, techTrash: 0, damage: 14 },
    { name: 'Cohete Incendiario', sulfur: 1400, charcoal: 1950, metalFragments: 100, cloth: 0, techTrash: 0, damage: 150 },
    { name: 'Mortero', sulfur: 1000, charcoal: 1500, metalFragments: 50, cloth: 0, techTrash: 0, damage: 35 },
    { name: 'Torpedo', sulfur: 20, charcoal: 30, metalFragments: 33, cloth: 0, techTrash: 0, damage: 75 },
    { name: 'Cóctel Molotov', sulfur: 0, charcoal: 0, metalFragments: 0, cloth: 10, techTrash: 0, damage: 25 }
  ];

  for (const exp of explosives) {
    await prisma.explosive.create({ data: exp });
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
    { name: 'Muro Externo de Piedra', hp: 500, category: 'Stone' },
    { name: 'Puerta Externa de Madera', hp: 500, category: 'Wood' },
    { name: 'Puerta Externa de Piedra', hp: 500, category: 'Stone' },
    
    // Ventanas y Barrotes
    { name: 'Barras de Madera para Ventana', hp: 250, category: 'Wood' },
    { name: 'Barras de Metal para Ventana', hp: 500, category: 'Sheet Metal' },
    { name: 'Cristal Reforzado', hp: 500, category: 'Glass' },
    { name: 'Barras Blindadas para Ventana', hp: 1000, category: 'Armored' },

    // Solo mantenemos los esenciales
    { name: 'Torreta Automática', hp: 1000, category: 'Deployable' },
    { name: 'Máquina Expendedora', hp: 2500, category: 'Deployable' },
    { name: 'Banco de Trabajo Nivel 3', hp: 750, category: 'Deployable' }
  ];

  for (const target of targets) {
    await prisma.raidTarget.create({ data: target });
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
