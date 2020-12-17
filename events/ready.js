module.exports = async (client) => {
  console.log(`[API] Logged in as ${client.user.username}`);
  await client.user.setActivity("https://discord.gg/camiland", {
    type: "PLAYING",//can be LISTENING, WATCHING, PLAYING, STREAMING
  });
};
