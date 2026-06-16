import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../utils/database';
import { Command } from '../types/Command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Panel de administración para la base de datos')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit-explosive')
        .setDescription('Modificar los valores de un explosivo')
        .addStringOption(option => option.setName('nombre').setDescription('Nombre exacto del explosivo').setRequired(true))
        .addIntegerOption(option => option.setName('sulfur').setDescription('Nuevo valor de sulfur').setRequired(false))
        .addIntegerOption(option => option.setName('charcoal').setDescription('Nuevo valor de charcoal').setRequired(false))
        .addIntegerOption(option => option.setName('damage').setDescription('Nuevo valor de daño').setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit-target')
        .setDescription('Modificar los valores de un objetivo (HP)')
        .addStringOption(option => option.setName('nombre').setDescription('Nombre exacto del objetivo').setRequired(true))
        .addIntegerOption(option => option.setName('hp').setDescription('Nuevo valor de HP').setRequired(true))
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'edit-explosive') {
      const nombre = interaction.options.getString('nombre', true);
      const sulfur = interaction.options.getInteger('sulfur');
      const charcoal = interaction.options.getInteger('charcoal');
      const damage = interaction.options.getInteger('damage');

      const explosive = await prisma.explosive.findUnique({ where: { name: nombre } });
      if (!explosive) {
        return interaction.reply({ content: `No se encontró el explosivo: ${nombre}`, ephemeral: true });
      }

      const updateData: any = {};
      if (sulfur !== null) updateData.sulfur = sulfur;
      if (charcoal !== null) updateData.charcoal = charcoal;
      if (damage !== null) updateData.damage = damage;

      if (Object.keys(updateData).length === 0) {
        return interaction.reply({ content: 'No enviaste valores para actualizar.', ephemeral: true });
      }

      await prisma.explosive.update({
        where: { name: nombre },
        data: updateData
      });

      return interaction.reply({ content: `Explosivo **${nombre}** actualizado exitosamente.`, ephemeral: true });
    }

    if (subcommand === 'edit-target') {
      const nombre = interaction.options.getString('nombre', true);
      const hp = interaction.options.getInteger('hp', true);

      const target = await prisma.raidTarget.findUnique({ where: { name: nombre } });
      if (!target) {
        return interaction.reply({ content: `No se encontró el objetivo: ${nombre}`, ephemeral: true });
      }

      await prisma.raidTarget.update({
        where: { name: nombre },
        data: { hp }
      });

      return interaction.reply({ content: `Objetivo **${nombre}** actualizado a ${hp} HP.`, ephemeral: true });
    }
  }
};

export default command;
