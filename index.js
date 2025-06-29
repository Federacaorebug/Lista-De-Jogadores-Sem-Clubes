require('dotenv').config();
const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

const CARGOS = {
  GOLEIRO: "1388710544013398136",
  ZAGUEIRO: "1388711161729646765",
  MEIA: "1388711287243931819",
  ATACANTE: "1388711380290375710",
  TECNICO: "1387508046686851183",
  SEM_CLUBE: "1388712352827965460"
};

const POSICOES = [
  { nome: "🧤 Goleiros", id: CARGOS.GOLEIRO },
  { nome: "🛡️ Zagueiros", id: CARGOS.ZAGUEIRO },
  { nome: "🎯 Meias", id: CARGOS.MEIA },
  { nome: "⚡ Atacantes", id: CARGOS.ATACANTE },
  { nome: "🎩 Técnicos", id: CARGOS.TECNICO }
];

let mensagemId = null;

async function atualizarLista(guild) {
  const canal = guild.channels.cache.get(process.env.CANAL_LISTA_ID);
  if (!canal) return;

  const membros = await guild.members.fetch();
  let texto = "📋 **Jogadores Sem Clube**\n\n";

  for (const pos of POSICOES) {
    const jogadores = membros.filter(
      m => m.roles.cache.has(CARGOS.SEM_CLUBE) && m.roles.cache.has(pos.id)
    );

    texto += `**${pos.nome}:**\n`;
    if (jogadores.size === 0) {
      texto += "(nenhum)\n\n";
    } else {
      jogadores.forEach(j => texto += `• <@${j.id}>\n`);
      texto += "\n";
    }
  }

  try {
    if (mensagemId) {
      const mensagem = await canal.messages.fetch(mensagemId);
      await mensagem.edit(texto);
    } else {
      const mensagem = await canal.send(texto);
      await mensagem.pin();
      mensagemId = mensagem.id;
    }
  } catch (err) {
    console.error("Erro ao atualizar lista:", err);
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot logado como ${client.user.tag}`);
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  await atualizarLista(guild);
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const guild = newMember.guild;
  await atualizarLista(guild);
});

client.login(process.env.TOKEN);
