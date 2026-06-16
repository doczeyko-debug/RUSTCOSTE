import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../utils/database';
import { calculateRaidCost } from '../utils/calculator';
import { Command } from '../types/Command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('path')
    .setDescription('Calcula un camino completo de raideo')
    .addStringOption(option => 
      option.setName('objetivos')
        .setDescription('Ejemplo: "2 Garage Door, 1 Stone Wall"')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const rawInput = interaction.options.getString('objetivos', true);
    
    // Parse input like: "2 Garage Door, 1 Stone Wall"
    const items = rawInput.split(',').map(i => i.trim());
    
    let totalSulfur = 0;
    let totalCharcoal = 0;
    let totalMetal = 0;
    
    // Let's assume the user wants the cheapest method overall for each. Or maybe a specific method.
    // The prompt shows "Método más económico: Rocket + Explosive Ammo"
    // So we calculate the cheapest method per item.
    
    const targetsFound: { name: string, qty: number, cheapestExp: string, expQty: number }[] = [];
    const explosivesDb = await prisma.explosive.findMany();

    for (const item of items) {
      // Extract number and name: "2 Garage Door" -> qty: 2, name: "Garage Door"
      const match = item.match(/^(\d+)?\s*(.+)$/i);
      if (!match) continue;
      
      const qty = parseInt(match[1] || '1');
      const name = match[2].trim();
      
      const target = await prisma.raidTarget.findFirst({ where: { name: { contains: name } } });
      if (!target) continue;

      // Find cheapest
      const costs = explosivesDb.map(exp => calculateRaidCost(target, exp, qty));
      costs.sort((a, b) => a.totalSulfur - b.totalSulfur);
      const cheapest = costs[0];

      totalSulfur += cheapest.totalSulfur;
      totalCharcoal += cheapest.totalCharcoal;
      totalMetal += cheapest.totalMetal;

      targetsFound.push({
        name: target.name,
        qty,
        cheapestExp: cheapest.explosive.name,
        expQty: cheapest.amount
      });
    }

    if (targetsFound.length === 0) {
      return interaction.reply({ content: 'No se reconocieron objetivos en tu lista.', ephemeral: true });
    }

    let description = '**RAID TOTAL**\n\n';
    const methodCounts: Record<string, number> = {};

    targetsFound.forEach(t => {
      description += `+ ${t.qty}x ${t.name} -> ${t.expQty}x ${t.cheapestExp}\n`;
      methodCounts[t.cheapestExp] = (methodCounts[t.cheapestExp] || 0) + t.expQty;
    });

    description += '\n**EXPLOSIVOS TOTALES (Método más económico):**\n';
    for (const [exp, qty] of Object.entries(methodCounts)) {
      description += `- ${qty}x ${exp}\n`;
    }

    const embed = new EmbedBuilder()
      .setColor('#D85A2B')
      .setTitle('Calculadora de Camino de Raideo')
      .setDescription(description)
      .addFields(
        { name: '🪨 Sulfur Total:', value: totalSulfur.toLocaleString(), inline: true },
        { name: '🔥 Charcoal:', value: totalCharcoal.toLocaleString(), inline: true },
        { name: '⚙️ Metal Fragments:', value: totalMetal.toLocaleString(), inline: true },
        { name: '⛏️ Tiempo de farmeo:', value: 'Aprox ' + Math.floor(totalSulfur / 5000) + 'h ' + Math.floor((totalSulfur % 5000) / 83) + 'm', inline: true },
        { name: '🏆 Método más económico:', value: Object.keys(methodCounts).join(' + '), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
