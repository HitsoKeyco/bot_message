import jwt from 'jsonwebtoken';

const secretKey = process.env.TOKEN_IO_SOCKET;

export function verificarToken(token) {
  try {
    const decodedToken = jwt.verify(token, secretKey);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

export function autenticarSocket(socket) {
  const token = socket.handshake.auth.token;
  if (!token) {
    return socket.disconnect();
  }
  const decodedToken = verificarToken(token);
  if (!decodedToken) {
    return socket.disconnect();
  }
  socket.usuario = decodedToken.usuario;
}