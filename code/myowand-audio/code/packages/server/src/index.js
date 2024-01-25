const ws = require('ws');
const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');


const port = new SerialPort({ path: 'COM5', baudRate: 115200 });
const listeners = [];
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
parser.on('data', data => {
  const arr = data.split(' ');

  const signal = arr[0];
  const note = arr[arr.length-3];
  const active = arr[arr.length-2];
  console.log(arr);
  listeners.forEach(l => {
    l.send(JSON.stringify({
      signal, active, note
    }));
  });
});



(async function main() {
  //
  // Start an Express server
  //
  // We use Express so that we can allow CORS for WS communication between client and server
  //
  const app = express();
  app.use(cors({
    origin: true,
    credentials: true
  }));

  //
  // WebSocket listener
  //
  const wsServer = new ws.Server({ noServer: true, path: '/' });
  wsServer.on('connection', socket => {
    listeners.push(socket);
    socket.on('message', message => {
      console.log(message.toString());
    });
  });

  //
  // Set the Express server to listen on 8081
  //
  const server = app.listen(8081);

  //
  // Use WebSockets to handle the ws:// connections from the Express server
  //
  server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
    });
  });
})();
