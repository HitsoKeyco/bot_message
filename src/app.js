import { MemoryDB } from '@builderbot/bot';
import { createBot, createProvider } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import winston from 'winston';
import dotenv from 'dotenv';
import { createFlow } from '@builderbot/bot';
dotenv.config();


const main = async () => {
    
    //Variables de entorno
    const { PORT, PORT_SOCKET_IO } = process.env;

    //--------------------------- SOCKET IO Y LOGGER CONFIG----------------------------------------------------------//
    // Crear un servidor HTTP
    const server = http.createServer();

    // Crear una instancia de Socket.IO adjunta al servidor HTTP
    const io = new SocketIOServer(server, {
        cors: {
            origin: '*', // Ajusta esto según tus necesidades de seguridad
            methods: ["GET", "POST"]
        }
    });

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message}`;
            })
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'bot.log' })
        ],
    });

    // Iniciar el servidor HTTP (que también maneja Socket.IO y API)
    server.listen(PORT_SOCKET_IO, () => {
        logger.info(`🚀 Servidor HTTP y API escuchando en el puerto ${PORT_SOCKET_IO}`);
    });

    //-------------------------------------------------------------------------------------//

    const adapterProvider = createProvider(BaileysProvider);
    const adapterDB = new MemoryDB();
    const adapterFlow = createFlow([])

    const { handleCtx, httpServer } = await createBot({   
        flow: adapterFlow,         
        provider: adapterProvider,
        database: adapterDB,
    });
    
    httpServer(+PORT);

    const connectionStatus = {
        connected: false,
    };
    
    adapterProvider.on('ready', async () => {
        logger.info('🟢 El bot está listo para recibir mensajes.');                
        connectionStatus.connected = true;        
        io.emit('status_connection', { connected: true });        
    });
    

    adapterProvider.on('require_action', (qrCode) => {
        logger.info('🟡 Necesita escanear el Código QR:');        
        connectionStatus.connected = false;
        io.emit('status_connection', { connected: false, data:qrCode});        
    })

    adapterProvider.server.post('/v1/status', handleCtx(async (bot, req, res) => {
        if(connectionStatus.connected){
            return res.end('connected');
        }else{
            return res.end('disconnected');
        }        
    }));

    adapterProvider.server.post('/v1/send-messages', handleCtx(async (bot, req, res) => {
        const { phone, message } = req.body;
        await bot.sendMessage( phone, message, {});
        return res.end('sended');
    }));

    adapterProvider.server.post('/v1/test-send-message', handleCtx(async (bot, req, res) => {        
        await bot.sendMessage( '593960423459', 'Este es un mesaje de prueba chat everchic', {});
        return res.end('sended');
    }));

    adapterProvider.server.get('/v1/log_out', handleCtx(async (bot, req, res) => {
        logger.info('😳 Intento de cerrar sesión');             
        logger.info('✅ El bot a sido liberado.');        
        return res.end('Sesión cerrada')
    }));
    
};
main();