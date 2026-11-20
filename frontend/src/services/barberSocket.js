
import { io } from 'socket.io-client';
import { API_CONFIG } from '../constants/config';

let barberSocket = null;

export const connectBarberSocket = (token) => {
  if (!token) {
    console.log('Socket connection skipped: Token missing');
    return null;
  }

  // Reuse an existing connection
  if (barberSocket?.connected) {
    return barberSocket;
  }

  // Disconnect an old socket before creating another
  if (barberSocket) {
    barberSocket.disconnect();
  }

  barberSocket = io(API_CONFIG.BASE_URL, {
    autoConnect: false,
    auth: {
      token,
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  barberSocket.on('connect', () => {
    console.log('Barber Socket Connected:', barberSocket.id);
  });

  barberSocket.on('connect_error', (error) => {
    console.log('Barber Socket Error:', error.message);
  });

  barberSocket.on('disconnect', (reason) => {
    console.log('Barber Socket Disconnected:', reason);
  });

  barberSocket.connect();

  return barberSocket;
};

export const disconnectBarberSocket = () => {
  if (barberSocket) {
    barberSocket.disconnect();
    barberSocket = null;
    console.log('Barber Socket Disconnected Successfully');
  }
};

export const getBarberSocket = () => barberSocket;
