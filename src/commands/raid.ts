import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../utils/database';
import { calculateRaidCost } from '../utils/calculator';
import { Command } from '../types/Command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Calcula el costo de raideo para un objetivo específico')
    .addStringOption(option => 
      option.setName('objetivo')
        .setDescription('El objetivo a raidear (ej. Stone Wall)')
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
        .setDescription('El método de raideo a usar (ej. Rocket)')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const objetivoName = interaction.options.getString('objetivo', true);
    const metodoName = interaction.options.getString('metodo', true);
    const cantidad = interaction.options.getInteger('cantidad') || 1;

    const target = await prisma.raidTarget.findFirst({ where: { name: { contains: objetivoName } } });
    const explosive = await prisma.explosive.findFirst({ where: { name: { contains: metodoName } } });

    if (!target) {
      return interaction.reply({ content: `No se encontró el objetivo: ${objetivoName}`, ephemeral: true });
    }
    if (!explosive) {
      return interaction.reply({ content: `No se encontró el explosivo: ${metodoName}`, ephemeral: true });
    }

    const cost = calculateRaidCost(target, explosive, cantidad);

    const embed = new EmbedBuilder()
      .setColor('#D85A2B') // Naranja Rust
      .setTitle('🛡 RAID MASTER')
      .setDescription(`Cálculo de raideo para **${target.name}**`)
      .addFields(
        { name: 'OBJETIVO:', value: `${target.name} x${cantidad}` },
        { name: 'MÉTODO:', value: `${explosive.name}` },
        { name: 'NECESITAS:', value: `
🚀 **${explosive.name}s:** ${cost.amount}
🪨 **Sulfur:** ${cost.totalSulfur.toLocaleString()}
🔥 **Charcoal:** ${cost.totalCharcoal.toLocaleString()}
⚙️ **Metal Fragments:** ${cost.totalMetal.toLocaleString()}
        ` }
      )
      .setFooter({ text: 'RaidMaster Bot', iconURL: interaction.client.user?.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
