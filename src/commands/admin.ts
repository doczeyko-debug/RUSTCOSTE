import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { prisma } from '../utils/database';
import { Command } from '../types/Command';
import { reloadCalculatorCache } from '../utils/calculator';

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
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit-cost')
        .setDescription('Modifica o registra la cantidad necesaria de un explosivo para un objetivo')
        .addStringOption(option => option.setName('objetivo').setDescription('El objetivo (ej. Puerta de Garaje)').setRequired(true).setAutocomplete(true))
        .addStringOption(option => option.setName('metodo').setDescription('El explosivo (ej. Cohete Básico)').setRequired(true).setAutocomplete(true))
        .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad necesaria (pon 0 para eliminar este costo exacto)').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list-costs')
        .setDescription('Muestra la lista de costos de raideo exactos guardados en la base de datos')
        .addStringOption(option => option.setName('objetivo').setDescription('Filtrar por nombre del objetivo').setRequired(false).setAutocomplete(true))
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

    if (subcommand === 'edit-cost') {
      const objetivoName = interaction.options.getString('objetivo', true);
      const metodoName = interaction.options.getString('metodo', true);
      const cantidad = interaction.options.getInteger('cantidad', true);

      const target = await prisma.raidTarget.findFirst({
        where: { name: { equals: objetivoName } }
      });
      const explosive = await prisma.explosive.findFirst({
        where: { name: { equals: metodoName } }
      });

      if (!target) {
        return interaction.reply({ content: `No se encontró el objetivo: ${objetivoName}`, ephemeral: true });
      }
      if (!explosive) {
        return interaction.reply({ content: `No se encontró el explosivo: ${metodoName}`, ephemeral: true });
      }

      if (cantidad <= 0) {
        await prisma.raidCost.deleteMany({
          where: {
            targetId: target.id,
            explosiveId: explosive.id
          }
        });
        await reloadCalculatorCache();
        return interaction.reply({ content: `Costo eliminado: **${explosive.name}** ya no tiene un costo exacto mapeado para **${target.name}**.`, ephemeral: true });
      }

      await prisma.raidCost.upsert({
        where: {
          targetId_explosiveId: {
            targetId: target.id,
            explosiveId: explosive.id
          }
        },
        update: { quantity: cantidad },
        create: {
          targetId: target.id,
          explosiveId: explosive.id,
          quantity: cantidad
        }
      });

      await reloadCalculatorCache();
      return interaction.reply({ content: `Costo de raideo actualizado: se necesitan **${cantidad}x ${explosive.name}** para destruir **${target.name}**.`, ephemeral: true });
    }

    if (subcommand === 'list-costs') {
      const filterObjetivo = interaction.options.getString('objetivo');

      const whereClause = filterObjetivo 
        ? { target: { name: { contains: filterObjetivo } } }
        : {};

      const costs = await prisma.raidCost.findMany({
        where: whereClause,
        include: {
          target: true,
          explosive: true
        },
        orderBy: [
          { target: { name: 'asc' } },
          { explosive: { name: 'asc' } }
        ]
      });

      if (costs.length === 0) {
        return interaction.reply({ content: 'No se encontraron costos de raideo en la base de datos.', ephemeral: true });
      }

      const grouped: Record<string, string[]> = {};
      for (const cost of costs) {
        if (!grouped[cost.target.name]) {
          grouped[cost.target.name] = [];
        }
        grouped[cost.target.name].push(`- **${cost.explosive.name}**: ${cost.quantity}`);
      }

      const embeds: EmbedBuilder[] = [];
      let currentEmbed = new EmbedBuilder()
        .setColor('#D85A2B')
        .setTitle('📋 Tabla de Costos de Raideo (Base de Datos)')
        .setDescription('Lista de explosivos exactos requeridos para destruir cada objetivo:')
        .setTimestamp();

      let currentLength = currentEmbed.data.description?.length || 0;

      for (const [targetName, lines] of Object.entries(grouped)) {
        const fieldName = targetName.toUpperCase();
        const fieldValue = lines.join('\n');
        const addedLength = fieldName.length + fieldValue.length;

        if (currentLength + addedLength > 5000 || (currentEmbed.data.fields?.length || 0) >= 25) {
          embeds.push(currentEmbed);
          currentEmbed = new EmbedBuilder()
            .setColor('#D85A2B')
            .setTitle('📋 Tabla de Costos de Raideo (Continuación)')
            .setTimestamp();
          currentLength = 0;
        }

        currentEmbed.addFields({ name: fieldName, value: fieldValue });
        currentLength += addedLength;
      }
      embeds.push(currentEmbed);

      await interaction.reply({ embeds: [embeds[0]], ephemeral: true });
      for (let i = 1; i < embeds.length; i++) {
        await interaction.followUp({ embeds: [embeds[i]], ephemeral: true });
      }
      return;
    }
  }
};

export default command;
