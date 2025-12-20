// Service Worker para notificaciones push
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyDfa_R44zVIApFqLgMOUW6yaxkQdWIlOgI",
    authDomain: "planificador-objetivos.firebaseapp.com",
    projectId: "planificador-objetivos",
    storageBucket: "planificador-objetivos.firebasestorage.app",
    messagingSenderId: "525782407970",
    appId: "1:525782407970:web:f06acda0a89c388bcba37b",
    measurementId: "G-C02LKTQ3MZ"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Manejar mensajes en background
messaging.onBackgroundMessage((payload) => {
    console.log('Mensaje recibido en background:', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png'
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('Notificación clickeada');
    event.notification.close();
    
    // Abrir la app
    event.waitUntil(
        clients.openWindow('/')
    );
});