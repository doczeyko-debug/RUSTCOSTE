import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../utils/database';
import { calculateRaidCost, normalizeTargetName, normalizeExplosiveName } from '../utils/calculator';
import { Command } from '../types/Command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Calcula el costo de raideo para un objetivo específico')
    .addStringOption(option => 
      option.setName('objetivo')
        .setDescription('El objetivo a raidear (ej. Puerta de Garaje)')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption(option => 
      option.setName('cantidad')
        .setDescription('Cantidad de objetivos (ej. 3)')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option => 
      option.setName('metodo')
        .setDescription('El método de raideo a usar (ej. Cohete Básico)')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const objetivoName = interaction.options.getString('objetivo', true);
    const metodoName = interaction.options.getString('metodo', true);
    const cantidad = interaction.options.getInteger('cantidad') || 1;

    const targetNormalized = normalizeTargetName(objetivoName);
    const explosiveNormalized = normalizeExplosiveName(metodoName);

    const target = await prisma.raidTarget.findFirst({
      where: {
        OR: [
          { name: { equals: targetNormalized } },
          { name: { contains: targetNormalized } },
          { name: { contains: objetivoName } }
        ]
      }
    });

    const explosive = await prisma.explosive.findFirst({
      where: {
        OR: [
          { name: { equals: explosiveNormalized } },
          { name: { contains: explosiveNormalized } },
          { name: { contains: metodoName } }
        ]
      }
    });

    if (!target) {
      return interaction.reply({ content: `No se encontró el objetivo: ${objetivoName}`, ephemeral: true });
    }
    if (!explosive) {
      return interaction.reply({ content: `No se encontró el explosivo: ${metodoName}`, ephemeral: true });
    }

    const cost = calculateRaidCost(target, explosive, cantidad);

    const amountValue = cost.amount === Infinity ? 'No aplicable' : cost.amount.toLocaleString();
    const sulfurValue = cost.totalSulfur === Infinity ? 'No aplicable (0 daño)' : cost.totalSulfur.toLocaleString();
    const charcoalValue = cost.totalCharcoal === Infinity ? 'No aplicable' : cost.totalCharcoal.toLocaleString();
    const metalValue = cost.totalMetal === Infinity ? 'No aplicable' : cost.totalMetal.toLocaleString();

    const embed = new EmbedBuilder()
      .setColor('#D85A2B') // Naranja Rust
      .setTitle('🛡 RAID MASTER')
      .setDescription(`Cálculo de raideo para **${target.name}**`)
      .addFields(
        { name: 'OBJETIVO:', value: `${target.name} x${cantidad}` },
        { name: 'MÉTODO:', value: `${explosive.name}` },
        { name: 'NECESITAS:', value: `
🚀 **${explosive.name}s:** ${amountValue}
🪨 **Sulfur:** ${sulfurValue}
🔥 **Charcoal:** ${charcoalValue}
⚙️ **Metal Fragments:** ${metalValue}
        ` }
      )
      .setFooter({ text: 'RaidMaster Bot', iconURL: interaction.client.user?.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
