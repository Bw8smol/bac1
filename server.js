const WebSocket = require('ws');
const http = require('http');

// Configura la IP y el PUERTO de tu servidor de Minecraft en MagmaNode
// Asegúrate de usar la IP pública que te dio MagmaNode y el puerto correcto (ej: 25565)
const MINECRAFT_SERVER_HOST = 'TU_IP_DE_MAGMANODE'; 
const MINECRAFT_SERVER_PORT = 25565; // O el puerto específico de EaglerX si es diferente

const PORT = process.env.PORT || 10000; // Render usa el puerto 10000 por defecto

const server = http.createServer((req, res) => {
    // Esto es solo para que Render sepa que el servicio está vivo
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Proxy de Eaglercraft funcionando.\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('Cliente WSS conectado. Intentando conectar a Minecraft...');
    const minecraftSocket = new WebSocket(`ws://${MINECRAFT_SERVER_HOST}:${MINECRAFT_SERVER_PORT}`);

    minecraftSocket.onopen = () => {
        console.log('Conexión con Minecraft establecida.');
    };

    minecraftSocket.onmessage = message => {
        // Reenviar mensajes del servidor de Minecraft al cliente web
        ws.send(message.data);
    };

    ws.onmessage = message => {
        // Reenviar mensajes del cliente web al servidor de Minecraft
        if (minecraftSocket.readyState === WebSocket.OPEN) {
            minecraftSocket.send(message.data);
        }
    };

    ws.onclose = () => {
        console.log('Cliente WSS desconectado.');
        minecraftSocket.close();
    };

    minecraftSocket.onclose = () => {
        console.log('Conexión con Minecraft cerrada.');
        ws.close();
    };

    minecraftSocket.onerror = err => {
        console.error('Error en la conexión con Minecraft:', err);
        ws.close();
    };
});

server.listen(PORT, () => {
    console.log(`Proxy escuchando en el puerto ${PORT}`);
});
