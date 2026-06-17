import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../utils/database';
import { Command } from '../types/Command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('tengo')
    .setDescription('Calculadora inversa: te dice qué puedes craftear con tus recursos')
    .addIntegerOption(option => 
      option.setName('sulfur')
        .setDescription('Cantidad de sulfur disponible')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sulfurAvailable = interaction.options.getInteger('sulfur', true);
    const explosives = await prisma.explosive.findMany();

    const embed = new EmbedBuilder()
      .setColor('#D85A2B')
      .setTitle('Calculadora Inversa')
      .setDescription(`Con **${sulfurAvailable.toLocaleString()} sulfur** puedes fabricar:`)
      .setTimestamp();

    const results = explosives.map(exp => {
      const maxCraftable = Math.floor(sulfurAvailable / exp.sulfur);
      return { explosive: exp, maxCraftable };
    }).filter(r => r.maxCraftable > 0);

    // Sort descending by sulfur cost (to show "biggest" items first)
    results.sort((a, b) => b.explosive.sulfur - a.explosive.sulfur);

    if (results.length === 0) {
      embed.setDescription(`Con **${sulfurAvailable.toLocaleString()} sulfur** no puedes fabricar ningún explosivo de la base de datos.`);
    } else {
      results.forEach((res, index) => {
        embed.addFields({
          name: res.explosive.name,
          value: `**${res.maxCraftable.toLocaleString()}** unidades`
        });
      });
      
      const recommended = results.find(r => r.explosive.name === 'Cohete Básico' || r.explosive.name === 'Rocket') || results[0];
      embed.addFields(
        { name: '\u200B', value: '\u200B' },
        { name: 'Método recomendado:', value: recommended.explosive.name }
      );
    }

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
