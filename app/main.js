// app\main.js

const socket = io("wss://web-production-d1ecd.up.railway.app/", {
  reconnectionAttempts: 5, // Tentativi di riconnessione
  reconnectionDelay: 1000, // 1 secondo tra ogni tentativo
  timeout: 20000, // Timeout per la connessione
});

const input = document.querySelector("input");
const button = document.querySelector("button");

const key = CryptoJS.enc.Hex.parse('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'); // 256-bit
const iv = CryptoJS.enc.Hex.parse('abcdef9876543210abcdef9876543210'); // 128-bit


let username = document.cookie.split(';').filter(item => item.trim().startsWith('username=')).map(item => item.split('=')[1])[0];
if (!username) {
  let randomNumber = Math.floor(Math.random() * 100000) + 1;
  username = prompt("What's your name?", `anonymous${randomNumber}`);
  document.cookie = `username=${username};`;
}
console.log(`${username} is connected`);
socket.emit('username', username);

function encrypt(message) {
  const encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv });
  return {
    iv: iv.toString(),
    encryptedData: encrypted.toString()
  };
}

function decrypt(encryptedMessage, ivHex) {
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key, { iv: iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

socket.on('message', (encryptedMsg) => {
  const decryptedMessage = decrypt(encryptedMsg.encryptedData, encryptedMsg.iv);
  const message = document.createElement('p');
  message.innerText = decryptedMessage;
  document.querySelector("#messages").appendChild(message);
});

input.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

button.addEventListener("click", () => {
  sendMessage();
});

function sendMessage() {
  if (!input.value) return;
  socket.emit('message', `${input.value}`);
  input.value = "";
}
