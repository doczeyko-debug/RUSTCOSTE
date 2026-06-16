import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { RaidMasterClient } from '../index';
import { Command } from '../types/Command';

export async function loadCommands(client: RaidMasterClient) {
  const commandsPath = path.join(__dirname, '../commands');
  
  if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  const commandsToRegister: any[] = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: Command = require(filePath).default;
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commandsToRegister.push(command.data.toJSON());
      console.log(`[Command] Cargado: ${command.data.name}`);
    } else {
      console.warn(`[Warning] El comando en ${filePath} le falta 'data' o 'execute'.`);
    }
  }

  // Register commands globally or locally
  if (process.env.DISCORD_TOKEN && process.env.CLIENT_ID) {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
      console.log(`Started refreshing ${commandsToRegister.length} application (/) commands.`);

      if (process.env.GUILD_ID) {
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
          { body: commandsToRegister },
        );
        console.log(`Successfully reloaded guild (/) commands.`);
      } else {
        await rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID),
          { body: commandsToRegister },
        );
        console.log(`Successfully reloaded global (/) commands.`);
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("No DISCORD_TOKEN or CLIENT_ID found. Skipping command registration.");
  }
}
