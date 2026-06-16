import { Events } from 'discord.js';
import { RaidMasterClient } from '../index';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: RaidMasterClient) {
    console.log(`¡Listo! Conectado como ${client.user?.tag}`);
    client.user?.setActivity({ name: '/raid | Calculando costos', type: 0 }); // 0 = Playing
  },
};
