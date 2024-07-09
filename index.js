import { Client, GatewayIntentBits, Collection, Events } from "discord.js";
import getCommands from "./commands/getCommands.js";
import removeMode from "./commands/removemode.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commands = await getCommands();

for (const command of commands) {
  if ("data" in command && "execute" in command)
    client.commands.set(command.data.name, command);
  else logger.verbose("discord", 1, `The command missing! in index.js`);
}

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.on(Events.InteractionCreate, async (interaction) => {
    const command = interaction.client.commands.get(interaction.commandName);

    if (interaction.isChatInputCommand()) {
      try {
        await command.execute(interaction);
      } catch (error) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    }
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() && !interaction.isButton()) return;

  try {
    if (interaction.isCommand()) {
      const removeMode = commands[interaction.commandName];
      if (!removeMode) return;

      await removeMode.execute(interaction);
    } else if (interaction.isButton()) {
      await removeMode.buttonInteraction(interaction);
    }
  } catch (error) {
    console.error("Ошибка при обработке взаимодействия:", error);
    await interaction.reply({
      content: "Произошла ошибка при обработке взаимодействия.",
      ephemeral: true,
    });
  }
});

await client.login(process.env.CLIENT_TOKEN);
