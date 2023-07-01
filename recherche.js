import giphyApi from 'giphy-api';

const apiGifToken = process.env.API_GIF_TOKEN;

export const commande = {
    name: 'gif',
    description: 'Chercher un GIF',
    options: [{
        name: 'terme',
        type: 'STRING',
        description: 'Le terme à rechercher sur Giphy',
        required: true,
    }],
    async execute(interaction, options) {
        const termeRecherche = options.getString('terme');
        try {
            const gf = new giphyApi(apiGifToken);
            const resultats = await gf.search(termeRecherche, { sort: 'recent' });
            const messages = resultats.map(resultat => resultat.url);
            await interaction.reply({ content: messages.join('\n'), ephemeral: true });
        } catch (erreur) {
            console.error(erreur);
            await interaction.reply({ content: "Une erreur s'est produite lors de la recherche. Veuillez réessayer plus tard.", ephemeral: true });
        }
    },
};

