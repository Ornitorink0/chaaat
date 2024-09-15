// server\index.js

const PORT = process.env.PORT || 5173;

const http = require('http').createServer();
const io = require('socket.io')(http, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    fetch("https://api.ipify.org?format=json")
        .then(response => response.json())
        .then(data => {
            // Display the IP address
            console.log(data.ip + " is connected");
        })
        .catch(error => {
            console.error("Error fetching IP address:", error);
        });

    let username;
    socket.on('username', (name) => {
        username = name;
    });
    socket.on('message', (msg) => {
        const date = new Date();
        console.log(`[${date.toLocaleTimeString()}] from ${username}: ${msg}`);
        io.emit('message', `${username}: ${msg}`);
    });
});

http.listen(PORT, () => {
    console.log('listening on: ${PORT}');
});
