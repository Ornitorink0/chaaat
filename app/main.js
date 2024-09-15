// app\main.js

const socket = io("wss://web-production-d1ecd.up.railway.app/", {
  reconnectionAttempts: 5, // Tentativi di riconnessione
  reconnectionDelay: 1000, // 1 secondo tra ogni tentativo
  timeout: 20000, // Timeout per la connessione
});

const input = document.querySelector("input");
const button = document.querySelector("button");

let username = document.cookie.split(';').filter(item => item.trim().startsWith('username=')).map(item => item.split('=')[1])[0];
if (!username) {
  let randomNumber = Math.floor(Math.random() * 100000) + 1;
  username = prompt("What's your name?", `anonymous${randomNumber}`);
  document.cookie = `username=${username};`;
}
console.log(`${username} is connected`);

socket.emit('username', username);

socket.on('message', (msg) => {
  const message = document.createElement('p');
  message.innerText = msg;
  document.querySelector("#messages").appendChild(message);
})

input.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
})

button.addEventListener("click", () => {
  sendMessage();
})

function sendMessage() {
  if (!input.value) return;
  socket.emit('message', `${input.value}`);
  input.value = "";
}
