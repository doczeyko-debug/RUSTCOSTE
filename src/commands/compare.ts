import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../utils/database';
import { calculateRaidCost } from '../utils/calculator';
import { Command } from '../types/Command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('compare')
    .setDescription('Compara todos los métodos de raideo para un objetivo específico')
    .addStringOption(option => 
      option.setName('objetivo')
        .setDescription('El objetivo a comparar (ej. Garage Door)')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption(option => 
      option.setName('cantidad')
        .setDescription('Cantidad de objetivos (ej. 3)')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const objetivoName = interaction.options.getString('objetivo', true);
    const cantidad = interaction.options.getInteger('cantidad', true);
    
    const target = await prisma.raidTarget.findFirst({ where: { name: { contains: objetivoName } } });

    if (!target) {
      return interaction.reply({ content: `No se encontró el objetivo: ${objetivoName}`, ephemeral: true });
    }

    const explosives = await prisma.explosive.findMany();
    const costs = explosives.map(exp => calculateRaidCost(target, exp, cantidad));
    
    // Sort by cheapest (least sulfur)
    costs.sort((a, b) => a.totalSulfur - b.totalSulfur);

    // Create a markdown table
    let table = 'MÉTODO           | CANT | AZUFRE  | CARBÓN  | METAL\n';
    table += '-----------------|------|---------|---------|-------\n';

    for (const cost of costs) {
      if (cost.totalSulfur > 50000 && !['Cohete Básico', 'C4', 'Carga Explosiva (Satchel)', 'Bala Explosiva'].includes(cost.explosive.name)) continue;

      const namePad = cost.explosive.name.padEnd(16).substring(0, 16);
      const cantPad = cost.amount.toString().padEnd(4);
      const sulfPad = cost.totalSulfur.toLocaleString().padEnd(7);
      const charPad = cost.totalCharcoal.toLocaleString().padEnd(7);
      const metalPad = cost.totalMetal.toLocaleString().padEnd(5);

      table += `${namePad} | ${cantPad} | ${sulfPad} | ${charPad} | ${metalPad}\n`;
    }

    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setTitle(target.name.toUpperCase())
      .setDescription(`Comparación de métodos para destruir ${cantidad}x ${target.name}\n\n\`\`\`\n${table}\n\`\`\``)
      .setTimestamp();

    const cheapest = costs[0];
    const fastest = costs.find(c => c.explosive.name === 'C4') || costs.find(c => c.explosive.name === 'Cohete Básico') || costs[0];

    embed.addFields(
      { name: '🏆 MÁS BARATO', value: cheapest.explosive.name, inline: true },
      { name: '⚡ MÁS RÁPIDO', value: fastest.explosive.name, inline: true }
    );

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
