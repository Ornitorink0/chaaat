const socket = io("wss://web-production-d1ecd.up.railway.app/", {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

const input = document.querySelector("input");
const button = document.querySelector("button");

// Chiave e IV predefiniti per AES-256-CBC
const key = CryptoJS.enc.Hex.parse('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'); // 256-bit

let username = document.cookie.split(';').filter(item => item.trim().startsWith('username=')).map(item => item.split('=')[1])[0];
if (!username) {
  let randomNumber = Math.floor(Math.random() * 100000) + 1;
  username = prompt("What's your name?", `anonymous${randomNumber}`);
  document.cookie = `username=${username};`;
}
console.log(`${username} is connected`);
socket.emit('username', username);

function encrypt(message) {
  const iv = CryptoJS.lib.WordArray.random(16); // Genera un IV nuovo per ogni crittografia
  const encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv });
  return {
    iv: iv.toString(CryptoJS.enc.Hex), // Invia l'IV come esadecimale
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
  const encryptedMsg = encrypt(input.value); // Cripta il messaggio prima di inviarlo
  socket.emit('message', encryptedMsg); // Invia il messaggio cifrato
  input.value = "";
}
