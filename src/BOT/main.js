import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const client = new Client();

// Objeto para guardar el estado de cada usuario
const userStates = {};

client.on('ready', () => {
    console.log('Conexion!');
});

client.on('qr', qr => {
    console.log('QR RECIBIDO, escanea con tu teléfono:');
    qrcode.generate(qr, {small: true});
});

// Escuchando mensajes entrantes
client.on('message', async message => {
    const userId = message.from;
    const userMessage = message.body.trim();

    // Inicializar estado del usuario si no existe
    if (!userStates[userId]) {
        userStates[userId] = { step: 'start' };
    }

    const userState = userStates[userId];

    // Flujo de conversación
    if (userState.step === 'start') {
        // Primer mensaje: pedir nombre
        await message.reply('¡Hola! Bienvenido a Fissio 👋\n\n¿Cuál es tu nombre?');
        userState.step = 'waiting_name';
    } 
    else if (userState.step === 'waiting_name') {
        // Guardar nombre y mostrar menú
        userState.name = userMessage;
        
        const menu = `¡Perfecto ${userState.name}! 😊\n\n` +
                    `¿En qué puedo ayudarte hoy?\n\n` +
                    `1️⃣ Información sobre servicios\n` +
                    `2️⃣ Hablar con un asesor\n` +
                    `3️⃣ Ver nuestros productos\n` +
                    `4️⃣ Soporte técnico\n\n` +
                    `Por favor, escribe el número de la opción que deseas.`;
        
        await message.reply(menu);
        userState.step = 'waiting_option';
    }
    else if (userState.step === 'waiting_option') {
        // Procesar la opción elegida
        switch(userMessage) {
            case '1':
                await message.reply(`Excelente ${userState.name}! 📋\n\nOfrecemos servicios de calidad en múltiples áreas. ¿Te gustaría conocer más detalles?`);
                break;
            case '2':
                await message.reply(`Claro ${userState.name}! 👨‍💼\n\nEn breve un asesor se pondrá en contacto contigo. ¿Podrías indicarme tu consulta?`);
                break;
            case '3':
                await message.reply(`Perfecto ${userState.name}! 🛍️\n\nAquí puedes ver nuestro catálogo de productos. ¿Qué tipo de producto te interesa?`);
                break;
            case '4':
                await message.reply(`Entendido ${userState.name}! 🔧\n\n¿Qué problema técnico estás experimentando? Descríbelo brevemente.`);
                break;
            default:
                await message.reply(`Lo siento ${userState.name}, no entendí tu opción. Por favor escribe un número del 1 al 4.`);
                return;
        }
        // Reiniciar conversación después de procesar opción
        userState.step = 'start';
    }
});

client.initialize();