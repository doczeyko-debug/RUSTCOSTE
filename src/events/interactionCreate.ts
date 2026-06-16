import { Events, Interaction } from 'discord.js';
import { RaidMasterClient } from '../index';

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: RaidMasterClient) {
    if (interaction.isAutocomplete()) {
      const { name, value } = interaction.options.getFocused(true);
      const { prisma } = require('../utils/database');

      try {
        if (name === 'objetivo' || name === 'objetivo1' || name === 'objetivo2') {
          const targets = await prisma.raidTarget.findMany({
            where: { name: { contains: value } },
            orderBy: [
              { category: 'asc' },
              { name: 'asc' }
            ],
            take: 25
          });
          
          // Mapeamos las categorías del inglés al español para que luzcan mejor
          const catMap: Record<string, string> = {
            'Wood': 'Madera',
            'Stone': 'Piedra',
            'Sheet Metal': 'Chapa',
            'Armored': 'Blindado',
            'Glass': 'Cristal',
            'Deployable': 'Desplegable',
            'Cloth': 'Tela'
          };

          await interaction.respond(
            targets.map((t: any) => ({
              name: `[${catMap[t.category] || t.category}] ${t.name}`,
              value: t.name 
            }))
          );
        } else if (name === 'metodo' || name === 'metodo1' || name === 'metodo2' || name === 'explosivo') {
          const explosives = await prisma.explosive.findMany({
            where: { name: { contains: value } },
            orderBy: { name: 'asc' },
            take: 25
          });
          await interaction.respond(
            explosives.map((e: any) => ({ name: e.name, value: e.name }))
          );
        }
      } catch (error) {
        console.error(error);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
      }
    }
  },
};
