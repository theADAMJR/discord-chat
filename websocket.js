const { messages, server } = require('./server');
const socket = require('socket.io');
const { getPreview } = require('kahaki');

const io = socket(server);

io.on('connection', (clientSocket) => {
  console.log('Made socket connection', clientSocket.id);

  clientSocket.on('chat', async (data) => {
    const containsURL = /([https://].*)/.test(data.message);
    if (containsURL) {
      try {
        const url = /([https://].*)/.exec(data.message)[0];
        data.embed = await getPreview(url, {
          standardizeArray: ['title', 'description', 'image', 'domain']
        });
      } catch {}
    }

    const newIndex = messages.push(data) - 1;
    setTimeout(() => messages.splice(newIndex, 1), 5 * 60 * 1000);
    
    io.sockets.emit('chat', data);
  });

  clientSocket.on('typing', (data) => {
    clientSocket.broadcast.emit('typing', data);
  });
});