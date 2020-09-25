// establish connection
const socket = io.connect('/');

// query DOM
const message = document.getElementById('message');
const username = document.getElementById('username');
const btn = document.getElementById('send');
const output = document.getElementById('output');
const feedback = document.getElementById('feedback');

// emit events
btn.addEventListener('click', () => {
  socket.emit('chat', {
    message: message.value,
    username: username.value,
    createdAt: new Date(),
    id: new Date().getTime()
  });
  message.value = '';
});

message.addEventListener('keypress', () => {
  socket.emit('typing', username.value);
});

// listen for events
socket.on('chat', (data) => appendMessage(data));
socket.on('message-delete', (data) => deleteMessage(data));

socket.on('typing', (data) => {
  feedback.innerHTML = `<p><em>${data} is typing a message...</em></p>`;
  
  setTimeout(() => feedback.innerHTML = '', 5 * 1000);
});

// load message history
fetch('/messages')
.then(async(data) => {
  const messages = await data.json();
  for (const message of messages)
    appendMessage(message);
}) 

function appendMessage(data) {
  output.innerHTML += extremelyLongMessagePreview(data);
}

function deleteMessage(data) {
  document.querySelector(`#message-${data.id}`).innerHTML = '';
}

// special discord theme code

function extremelyLongMessagePreview(data) {
  return `<div id="message-${data.id}" class="rounded flex-vertical whitney theme-dark">
    <div class="rounded chat flex-vertical flex-spacer">
        <div class="rounded content flex-spacer flex-horizontal">
            <div class="rounded flex-spacer flex-vertical messages-wrapper">
                <div class="scroller-wrap">
                    <div class="scroller messages">
                        <div class="message-group hide-overflow">
                            <div class="avatar-large animate" style="background-image: url(https://cdn.discordapp.com/embed/avatars/0.png)"></div>
                            <div class="comment">
                                <div class="message first">
                                    <h2 style="line-height: 16px;">
                                        <span class="username-wrapper v-btm">
                                            <strong class="user-name">${data.username}</strong>
                                        </span>
                                        <span class="highlight-separator"> - </span>
                                        <span class="timestamp">${toTimestamp(new Date(data.createdAt))}</span>
                                    </h2>
                                    <div innerHtml="processed" class="message-text">${data.message}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>`;
}

function toTimestamp(date) {
  const timestamp = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
    minute: 'numeric'
  });

  const wasToday = new Date().getDay() / date.getDay() === 1;
  const wasYesterday = new Date().getDate() % date.getDate() === 1;
  const isTommorow = date.getTime() % new Date().getDate() === 1;
  
  if (wasToday || wasYesterday)
    return `Today at ${timestamp}`;
  if (wasYesterday)
    return `Yesterday at ${timestamp}`;
  else if (isTommorow)
    return `Tommorow at ${timestamp}`;

  return date
    .toJSON()
    .slice(0,10)
    .split('-')
    .reverse()
    .join('/');
}