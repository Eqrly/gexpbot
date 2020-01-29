exports.run = (client, message, args) => {
  try {
    eval(message.content.substr(6, message.content.length-6));
  } catch (e) {
    console.error(e);
    message.channel.send("Error!").catch(console.error);
  }
}
