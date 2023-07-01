import Discord from 'discord.js';
const { Client, MessageEmbed} = Discord;
import {Events, GatewayIntentBits, REST, Routes} from 'discord.js';

import dotenv from "dotenv";
dotenv.config();

import pkg from '@giphy/js-fetch-api';
const {GiphyFetch} = pkg;

const apiGifToken = process.env.API_GIF_TOKEN;
const token = process.env.DISCORD_TOKEN
const clientApi = process.env.CLIENT_ID;
const chuckNorrisApiUrl = 'https://api.chucknorris.io/jokes/random';

const commands = [
    {
        name: 'pingme',
        description: 'Replies with ...',
    },
    {
        name: 'blague',
        description: 'génère une blague',
    },
    {
        name: 'gif',
        description: 'Chercher un GIF',
        options: [{
            name: 'terme',
            type: 3,
            description: 'Le terme à rechercher sur Giphy',
            required: true,
        }],
        async execute(interaction, options) {
            const termeRecherche = options.getString('terme');
            try {
                const gf = new GiphyFetch(apiGifToken);
                const resultats = await gf.search(termeRecherche, { sort: 'relevant', limit: 1, type: 'gifs'});
                const messages = resultats.data.map(resultat => resultat.url);
                await interaction.reply({ content: messages.join('\n'), ephemeral: true });
            } catch (erreur) {
                console.error(erreur);
                await interaction.reply({ content: "Une erreur s'est produite lors de la recherche. Veuillez réessayer plus tard.", ephemeral: true });
            }
        },
    }
]

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(clientApi), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'pingme') {
        function getRandomEmoji() {
            const emojis = [];
            client.guilds.cache.each(guild => {
                if (guild.available) {
                    guild.emojis.cache.each(emoji => {
                        emojis.push(emoji);
                    });
                }
            });
            if (emojis.length === 0) {
                return null;
            }
            const randomIndex = Math.floor(Math.random() * emojis.length);
            return emojis[randomIndex];
        }
        const emoji = getRandomEmoji();
        if (emoji) {
            await interaction.reply(`Hello ${emoji}`);
        } 
        else {
            await interaction.reply('Sorry, there are no emojis available.');
        }
    }

    if(interaction.commandName === "blague"){
        fetch(chuckNorrisApiUrl)
            .then(response => response.json())
            .then(data => {
                const joke = data.value;
                interaction.reply(joke);
            })
            .catch(error => {
                console.error(error);
                interaction.reply('Désolé, je n\'ai pas pu récupérer de blague pour le moment. Réessayez plus tard !');
            });
    }

    if(interaction.commandName === 'gif'){
        try {
            //await interaction.deferReply({ ephemeral: true });
            const options = interaction.options;
            await commands.find(cmd => cmd.name === 'gif').execute(interaction, options);
        } catch (erreur) {
            console.error(erreur);
            await interaction.reply({ content: "Une erreur s'est produite lors de la commande.", ephemeral: true });
        }
    }
});

client.login(token);