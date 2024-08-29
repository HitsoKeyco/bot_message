import { MemoryDB } from '@builderbot/bot';
import { createBot, createProvider, createFlow } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys';

const PORT = 3010;

const main = async () => {
    const adapterFlow = createFlow([]);
    const adapterProvider = createProvider(BaileysProvider);
    const adapterDB = new MemoryDB();
    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
    adapterProvider.server.post('/v1/send-messages', handleCtx(async (bot, req, res) => {
        const { phone, message } = req.body;
        await bot.sendMessage(phone, message, {});
        return res.end('sended');
    }));
    httpServer(+PORT);
};
main();