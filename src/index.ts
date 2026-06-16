import { Client, Collection, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { Command } from './types/Command';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';

dotenv.config();

export class RaidMasterClient extends Client {
  public commands: Collection<string, Command>;

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds],
    });
    this.commands = new Collection();
  }

  public async start() {
    await loadCommands(this);
    await loadEvents(this);
    await this.login(process.env.DISCORD_TOKEN);
  }
}

const client = new RaidMasterClient();
client.start();
