module.exports = (client) => {
  const channelId = "1231174104334467164";
  client.on("guildMemberAdd", (member) => {
    const message = `Bem vindo <@${member.id}> ao servidor de discord da ESSM! Visita o nosso site em https://agml.pt/`;

    const channel = member.guild.channels.cache.get(channelId);
    channel.send(message);
  });
};
