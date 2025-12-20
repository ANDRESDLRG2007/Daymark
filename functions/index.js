const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.dailyReminder = functions.pubsub
    .schedule('0 9 * * *') // Todos los días a las 9 AM
    .timeZone('America/Bogota')
    .onRun(async (context) => {
        console.log('Ejecutando recordatorio diario');
        
        try {
            // Obtener todos los usuarios con notificaciones activadas
            const usersSnapshot = await admin.firestore()
                .collection('users')
                .where('settings.notifications', '==', true)
                .get();
            
            const tokens = [];
            
            for (const userDoc of usersSnapshot.docs) {
                // Obtener tokens de notificación del usuario
                const tokensSnapshot = await admin.firestore()
                    .collection('users')
                    .doc(userDoc.id)
                    .collection('tokens')
                    .get();
                
                tokensSnapshot.forEach(tokenDoc => {
                    tokens.push(tokenDoc.data().token);
                });
            }
            
            if (tokens.length > 0) {
                const message = {
                    notification: {
                        title: '¡Recuerda tus objetivos diarios!',
                        body: 'Tienes metas pendientes para completar hoy'
                    },
                    tokens: tokens
                };
                
                const response = await admin.messaging().sendMulticast(message);
                console.log('Notificaciones enviadas:', response.successCount);
            }
            
            return null;
        } catch (error) {
            console.error('Error en dailyReminder:', error);
            return null;
        }
    });