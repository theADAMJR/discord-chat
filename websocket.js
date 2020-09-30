const { messages, server } = require('./server');
const socket = require('socket.io');
const got = require('got');
const { toHTML } = require('discord-markdown');
const { textEmoji } = require('markdown-to-text-emoji'); 

const metascraper = require('metascraper')([
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-url')()
]);

const io = socket(server);

io.on('connection', (clientSocket) => {
  console.log('Made socket connection', clientSocket.id);

  clientSocket.on('chat', async (data) => {
    await setEmbed(data);

    data.html = toHTML(textEmoji(data.message));

    const newIndex = messages.push(data) - 1;
    setTimeout(() => messages.splice(newIndex, 1), 5 * 60 * 1000);
    
    io.sockets.emit('chat', data);
  });

  clientSocket.on('typing', (data) => {
    clientSocket.broadcast.emit('typing', data);
  });
});

async function setEmbed(data) {
  const containsURL = /([https://].*)/.test(data.message);
  if (containsURL) {
    try {
      const targetUrl = /([https://].*)/.exec(data.message)[0];
      const { body: html, url } = await got(targetUrl);

      data.embed = await metascraper({ html, url });
    } catch {}
  }
}
