import * as fs from 'fs';
import * as path from 'path';
import { RaidMasterClient } from '../index';

export async function loadEvents(client: RaidMasterClient) {
  const eventsPath = path.join(__dirname, '../events');
  
  if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath, { recursive: true });
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath).default;
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`[Event] Cargado: ${event.name}`);
  }
}
