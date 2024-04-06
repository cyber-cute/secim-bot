const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const { fetchNews } = require("../utils/fetchNews");

const db = new QuickDB();
module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('genel-seçimler')
        .setDescription("Seçim bilgilerini gösterir.")
        .addChannelOption((option) =>
            option.setName("channel")
                .setDescription("Bir kanal seçin")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("category")
                .setDescription("Bir şehir belirtin")
                .setRequired(true)
                .addChoices(
                    { name: 'Gaming', value: 'gif_funny' },
                    { name: 'Entertainment', value: 'gif_meme' },
                    { name: 'TV & Movies', value: 'gif_movie' },
                    { name: 'Esports', value: 'gif_movie' },
                    { name: 'Tech', value: 'gif_movie' },
                )),
    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel("channel");
            const category = interaction.options.getString("category");

            // Kullanici yetkisi kontrol et
            if(!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                        .setColor("#2F3136")
                         .setAuthor({ name: interaction.user.tag, iconURL: `${interaction.user.avatarURL() || client.user?.avatarURL()}` })
                        .setTitle(`İşlem başarısız`)
                        .setDescription(`> <:kirmizi:1064928050363519038> **|** Deprem bildirimlerin gönderilmesi için bota yetki vermeniz gerekiyor.`)
                        .setFooter({ text: `Bizi tercih ettiğiniz için teşekkürler!`, iconURL: `${client.user?.avatarURL()}` })
                        .setTimestamp()
                    ],
                })
    
                return;
            }

            if (!channel || !category) {
                console.log("channel ve il değerleri alınmadı");
            }

            const embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${interaction.user.globalName || interaction.user.username || "bulunamadı"} - News Channel`, iconURL: interaction.user.displayAvatarURL() })
                 .setDescription("> Server information has been updated.")
                .setFooter({ text: `© Powered by News#6259` });
            interaction.reply({ embeds: [embed] });

            const data = await fetchNews(category);
            await db.set(`news_${interaction.user.id}`, channel.id, category);
            
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: `Dexerto - ${category}`,
                            url: `https://www.dexerto.com/${data[0].href}`,
                            iconURL: "https://pbs.twimg.com/profile_images/1714301666445402112/5U5myYFv_400x400.jpg",
                        })
                        .setDescription(`**${data[0].heading}** \n\n${data[0].timePublished}`) 
                        .setImage(data[0].img.src)
                        .setColor("#ff0080"),
                        ]
            })
        } catch (error) {
            console.error("Error fetching election results:", error);
        }
        
    },
};
