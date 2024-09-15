const PORT = process.env.PORT || 8080;

const crypto = require('crypto');
const http = require('http').createServer();
const io = require('socket.io')(http, { cors: { origin: "*" } });

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // Chiave segreta, dovrebbe essere condivisa in modo sicuro

function encrypt(text) {
    const iv = crypto.randomBytes(16); // Genera un IV nuovo per ogni crittografia
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(encryptedText, ivHex) {
    let ivBuffer = Buffer.from(ivHex, 'hex');
    let encryptedBuffer = Buffer.from(encryptedText, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

io.on('connection', (socket) => {
    fetch("https://api.ipify.org?format=json")
        .then(response => response.json())
        .then(data => {
            console.log(data.ip + " is connected");
        })
        .catch(error => {
            console.error("Error fetching IP address:", error);
        });

    let username;
    socket.on('username', (name) => {
        username = name;
    });

    socket.on('message', (encryptedMsg) => {
        // Decripta il messaggio ricevuto
        const decryptedMessage = decrypt(encryptedMsg.encryptedData, encryptedMsg.iv);
        const date = new Date();
        console.log(`[${date.toLocaleTimeString()}] from ${username}: ${decryptedMessage}`);

        // Cripta il messaggio da inviare agli altri client
        const encryptedResponse = encrypt(`${username}: ${decryptedMessage}`);
        io.emit('message', encryptedResponse); // Invia il messaggio criptato
    });
});

http.listen(PORT, () => {
    console.log(`listening on: ${PORT}`);
});
