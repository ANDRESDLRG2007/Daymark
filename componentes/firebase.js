import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs,
    updateDoc,
    deleteDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getMessaging, 
    getToken, 
    onMessage 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

const firebaseConfig = {
    apiKey: "AIzaSyDfa_R44zVIApFqLgMOUW6yaxkQdWIlOgI",
    authDomain: "planificador-objetivos.firebaseapp.com",
    projectId: "planificador-objetivos",
    storageBucket: "planificador-objetivos.firebasestorage.app",
    messagingSenderId: "525782407970",
    appId: "1:525782407970:web:f06acda0a89c388bcba37b",
    measurementId: "G-C02LKTQ3MZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export class FirebaseService {
    constructor() {
        this.auth = auth;
        this.db = db;
        this.messaging = messaging;
        this.currentUser = null;
    }

    // Observador de estado de autenticación
    onAuthChange(callback) {
        return onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            callback(user);
        });
    }

    // Registro de usuario
    async register(email, password) {
        try {
            console.log('Intentando registrar:', email);
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            
            console.log('Usuario registrado:', user.uid);
            
            // Crear documento del usuario en Firestore
            await setDoc(doc(this.db, 'users', user.uid), {
                email: user.email,
                createdAt: new Date().toISOString(),
                settings: {
                    dailyDescription: true
                }
            });
            
            console.log('Documento creado en Firestore');
            
            return { success: true, user };
        } catch (error) {
            console.error('Error en registro:', error.code, error.message);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Inicio de sesión
    async login(email, password) {
        try {
            console.log('Intentando iniciar sesión:', email);
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            console.log('Sesión iniciada:', userCredential.user.uid);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Error en login:', error.code, error.message);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Cerrar sesión
    async logout() {
        try {
            await signOut(this.auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Guardar configuraciones
    async saveSettings(settings) {
        if (!this.currentUser) return { success: false, error: 'No hay usuario autenticado' };
        
        try {
            const userRef = doc(this.db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
                await updateDoc(userRef, { settings: settings });
            } else {
                await setDoc(userRef, { 
                    email: this.currentUser.email,
                    settings: settings,
                    createdAt: new Date().toISOString()
                });
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error al guardar configuraciones:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener configuraciones
    async getSettings() {
        if (!this.currentUser) return null;
        
        try {
            const docSnap = await getDoc(doc(this.db, 'users', this.currentUser.uid));
            if (docSnap.exists()) {
                return docSnap.data().settings || { dailyDescription: true };
            }
            return { dailyDescription: true };
        } catch (error) {
            console.error('Error al obtener configuraciones:', error);
            return { dailyDescription: true };
        }
    }

    // Guardar objetivo
    async saveGoal(goal) {
        if (!this.currentUser) return { success: false, error: 'No hay usuario autenticado' };
        
        try {
            const goalRef = doc(this.db, 'users', this.currentUser.uid, 'goals', goal.id);
            await setDoc(goalRef, {
                ...goal,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('Error al guardar objetivo:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener todos los objetivos
    async getGoals() {
        if (!this.currentUser) return [];
        
        try {
            const goalsRef = collection(this.db, 'users', this.currentUser.uid, 'goals');
            const querySnapshot = await getDocs(goalsRef);
            const goals = [];
            
            querySnapshot.forEach((doc) => {
                goals.push(doc.data());
            });
            
            return goals;
        } catch (error) {
            console.error('Error al obtener objetivos:', error);
            return [];
        }
    }

    // Actualizar objetivo
    async updateGoal(goalId, updatedData) {
        if (!this.currentUser) return { success: false, error: 'No hay usuario autenticado' };
        
        try {
            const goalRef = doc(this.db, 'users', this.currentUser.uid, 'goals', goalId);
            await setDoc(goalRef, {
                ...updatedData,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar objetivo:', error);
            return { success: false, error: error.message };
        }
    }

    // Eliminar objetivo
    async deleteGoal(goalId) {
        if (!this.currentUser) return { success: false, error: 'No hay usuario autenticado' };
        
        try {
            await deleteDoc(doc(this.db, 'users', this.currentUser.uid, 'goals', goalId));
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar objetivo:', error);
            return { success: false, error: error.message };
        }
    }

    // Sincronizar datos locales con Firebase
    async syncLocalToFirebase(goals, settings) {
        if (!this.currentUser) return { success: false, error: 'No hay usuario autenticado' };
        
        try {
            // Guardar configuraciones
            await this.saveSettings(settings);
            
            // Guardar todos los objetivos
            for (const goal of goals) {
                await this.saveGoal(goal);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error en sincronización:', error);
            return { success: false, error: error.message };
        }
    }

    // Mensajes de error en español
    getErrorMessage(errorCode) {
        const errors = {
            'auth/email-already-in-use': 'Este correo ya está registrado',
            'auth/invalid-email': 'Correo electrónico inválido',
            'auth/operation-not-allowed': 'Operación no permitida',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
            'auth/user-not-found': 'No existe una cuenta con este correo',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/invalid-credential': 'Credenciales inválidas',
            'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
            'auth/configuration-not-found': 'Authentication no está configurado correctamente en Firebase'
        };
        
        return errors[errorCode] || `Error: ${errorCode}`;
    }

    // Verificar si hay usuario autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Solicitar permiso para notificaciones
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(this.messaging, { vapidKey: 'BMB__zfeNOEpmS8u30oA8FGSDXM58A6IckgnaIKuRNDyfQsQy856ouemi-v8QbU4MEuZz9huZhQydxW0MLev1Wg' });
                console.log('Token de notificación:', token);
                // Guardar token en Firestore para enviar notificaciones
                if (this.currentUser) {
                    await setDoc(doc(this.db, 'users', this.currentUser.uid, 'tokens', token), {
                        token: token,
                        createdAt: new Date().toISOString()
                    });
                }
                return token;
            }
            return null;
        } catch (error) {
            console.error('Error al solicitar permiso:', error);
            return null;
        }
    }

    // Escuchar mensajes de notificación
    onMessageReceived(callback) {
        onMessage(this.messaging, (payload) => {
            callback(payload);
        });
    }
}

export const firebaseService = new FirebaseService();