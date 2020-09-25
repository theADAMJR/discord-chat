const express = require('express');
const socket = require('socket.io');

const app = express();
const server = app.listen(3000,
  () => console.log('Server listening on port 3000'));
  
app.use(express.static('public'));
  
const messages = [];

app.get('/messages', (req, res) => res.json(messages));

// Socket Setup
const io = socket(server);

io.on('connection', (clientSocket) => {
  console.log('Made socket connection', clientSocket.id);

  clientSocket.on('chat', (data) => {
    io.sockets.emit('chat', data);

    const newIndex = messages.push(data) - 1;
    setTimeout(() => deleteMessage(newIndex), 5 * 60 * 1000)
  });

  clientSocket.on('typing', (data) => {
    clientSocket.broadcast.emit('typing', data);
  });
});

function deleteMessage(index) {
  const oldMessage = messages[index];
  messages.splice(index, 1);

  io.sockets.emit('message-delete', oldMessage);
}