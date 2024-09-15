// app\main.js

const socket = io("ws://62.240.135.14:8080", {
  reconnectionAttempts: 5, // Tentativi di riconnessione
  reconnectionDelay: 1000, // 1 secondo tra ogni tentativo
  timeout: 20000, // Timeout per la connessione
});

const input = document.querySelector("input");
const button = document.querySelector("button");

const username = prompt("What's your name?");
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
