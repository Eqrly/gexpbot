exports.run = (client, message, args) => {
    message.channel.send("How dare you ping me "+"<@"+message.author.id+">").catch(console.error);
}
