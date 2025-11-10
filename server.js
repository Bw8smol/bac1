/**
 * Eaglercraft WebSocket Proxy (Render Edition)
 * Conecta clientes WebSocket del navegador con un servidor Minecraft real por TCP.
 */

const WebSocket = require('ws');
const http = require('http');
const net = require('net');

// ⚙️ Configuración de tu servidor Minecraft (Magmanode)
const MINECRAFT_SERVER_HOST = '144.76.58.217';  // IP pública o hostname
const MINECRAFT_SERVER_PORT = 33534;            // Puerto del servidor

// ⚙️ Puerto del proxy (Render usa uno asignado por variable de entorno)
const PORT = process.env.PORT || 10000;

// Servidor HTTP simple (Render necesita algo que escuche peticiones)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('✅ Proxy Eaglercraft activo y funcionando.\n');
});

// Servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log(`🌐 Cliente Web conectado desde ${req.socket.remoteAddress}`);
  console.log(`🔗 Intentando conectar a Minecraft (${MINECRAFT_SERVER_HOST}:${MINECRAFT_SERVER_PORT})...`);

  // Conexión TCP al servidor de Minecraft
  const mcSocket = net.createConnection(MINECRAFT_SERVER_PORT, MINECRAFT_SERVER_HOST, () => {
    console.log('✅ Conexión establecida con el servidor de Minecraft.');
  });

  // Mensajes desde Minecraft → cliente web
  mcSocket.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  // Mensajes desde cliente web → Minecraft
  ws.on('message', (message) => {
    if (mcSocket.writable) {
      mcSocket.write(message);
    }
  });

  // Cuando el cliente cierra
  ws.on('close', () => {
    console.log('❌ Cliente Web desconectado.');
    mcSocket.end();
  });

  // Cuando el servidor de Minecraft cierra
  mcSocket.on('end', () => {
    console.log('🛑 Conexión con Minecraft cerrada.');
    ws.close();
  });

  // Errores TCP
  mcSocket.on('error', (err) => {
    console.error('💥 Error en la conexión TCP con Minecraft:', err.message);
    ws.close();
  });

  // Errores WebSocket
  ws.on('error', (err) => {
    console.error('💥 Error en el cliente WebSocket:', err.message);
    mcSocket.end();
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Proxy Eaglercraft escuchando en el puerto ${PORT}`);
});
