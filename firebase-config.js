// Firebase Configuration
import { initializeApp, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, collection } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyCJNv4DDv8Gbvtw3zRzsvNk3xW3e2sog7k",
    authDomain: "card-force-472100.firebaseapp.com",
    projectId: "card-force-472100",
    storageBucket: "card-force-472100.firebasestorage.app",
    messagingSenderId: "91438507562",
    appId: "1:91438507562:web:85673cf7f40190f4310553",
    measurementId: "G-J2Q14Y5FXS"
};

// Initialize Firebase
let app, db, auth, GoogleAuthProvider;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    GoogleAuthProvider = GoogleAuthProvider;
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Try to get existing instances if already initialized
    try {
        app = getApp();
        db = getFirestore(app);
        auth = getAuth(app);
        GoogleAuthProvider = GoogleAuthProvider;
    } catch (retryError) {
        console.error('Failed to get existing Firebase instances:', retryError);
    }
}

// Make Firebase functions globally available
window.firebaseApp = app;
window.db = db;
window.auth = auth;
window.GoogleAuthProvider = GoogleAuthProvider;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.getDocs = getDocs;
window.addDoc = addDoc;
window.updateDoc = updateDoc;
window.deleteDoc = deleteDoc;
window.onSnapshot = onSnapshot;
window.query = query;
window.where = where;
window.orderBy = orderBy;
window.collection = collection;

// Firebase Collections
const COLLECTIONS = {
    USERS: 'users',
    ORDERS: 'orders',
    CARTS: 'carts',
    PRODUCTS: 'products',
    ADDRESSES: 'addresses',
    REFUNDS: 'refunds',
    CHAT_MESSAGES: 'chatMessages'
};

// Firebase Helper Functions
class FirebaseService {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Check for existing Google OAuth user in localStorage
            const googleUser = localStorage.getItem('googleUser');
            if (googleUser) {
                const userData = JSON.parse(googleUser);
                // Create a mock currentUser object for FirebaseService
                this.currentUser = {
                    uid: userData.sub,
                    email: userData.email,
                    displayName: userData.name,
                    photoURL: userData.picture
                };
                this.isInitialized = true;
                console.log('Firebase service initialized with existing Google user:', this.currentUser.uid);
                this.syncUserData(this.currentUser);
                return;
            }

            // Listen for auth state changes
            onAuthStateChanged(auth, (user) => {
                this.currentUser = user;
                this.isInitialized = true;
                
                if (user) {
                    console.log('Firebase user signed in:', user.uid);
                    this.syncUserData(user);
                } else {
                    console.log('Firebase user signed out');
                }
            });
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }

    // Authentication
    async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign-out error:', error);
        }
    }

    // User Data Management
    async syncUserData(user) {
        try {
            const userRef = doc(db, COLLECTIONS.USERS, user.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                // Create new user document
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
            } else {
                // Update last login
                await updateDoc(userRef, {
                    lastLogin: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error syncing user data:', error);
        }
    }

    // Cart Management
    async saveCartToFirebase(userId, cartItems) {
        try {
            const cartRef = doc(db, COLLECTIONS.CARTS, userId);
            await setDoc(cartRef, {
                userId: userId,
                items: cartItems,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving cart to Firebase:', error);
        }
    }

    async loadCartFromFirebase(userId) {
        try {
            const cartRef = doc(db, COLLECTIONS.CARTS, userId);
            const cartSnap = await getDoc(cartRef);
            
            if (cartSnap.exists()) {
                return cartSnap.data().items || [];
            }
            return [];
        } catch (error) {
            console.error('Error loading cart from Firebase:', error);
            return [];
        }
    }

    // Order Management
    async saveOrderToFirebase(order) {
        try {
            const orderRef = doc(db, COLLECTIONS.ORDERS, order.id.toString());
            const orderData = {
                ...order,
                firebaseCreated: new Date().toISOString(),
                firebaseLastUpdated: new Date().toISOString()
            };
            
            console.log('💾 Saving order to Firebase:', {
                orderId: order.id,
                userId: order.userId,
                orderNumber: order.orderNumber,
                totalPrice: order.totalPrice
            });
            
            await setDoc(orderRef, orderData);
            console.log('✅ Order saved to Firebase successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Error saving order to Firebase:', error);
            console.error('Order details:', {
                id: order.id,
                userId: order.userId,
                error: error.message,
                code: error.code
            });
            return false;
        }
    }

    async loadOrdersFromFirebase(userId = null) {
        try {
            let q;
            if (userId) {
                q = query(
                    collection(db, COLLECTIONS.ORDERS), 
                    where('userId', '==', userId)
                );
            } else {
                q = query(
                    collection(db, COLLECTIONS.ORDERS), 
                    orderBy('createdAt', 'desc')
                );
            }
            
            const querySnapshot = await getDocs(q);
            const orders = [];
            querySnapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📋 Loaded ${orders.length} orders from Firebase for user:`, userId || 'all');
            return orders;
        } catch (error) {
            console.error('❌ Error loading orders from Firebase:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                userId: userId
            });
            return [];
        }
    }

    // Real-time Order Updates (for admin)
    subscribeToOrders(callback) {
        try {
            const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const orders = [];
                snapshot.forEach((doc) => {
                    orders.push({ id: doc.id, ...doc.data() });
                });
                callback(orders);
            });
        } catch (error) {
            console.error('Error subscribing to orders:', error);
        }
    }

    // Address Management
    async saveAddressToFirebase(userId, address) {
        try {
            const addressRef = doc(db, COLLECTIONS.ADDRESSES, `${userId}_${address.id}`);
            await setDoc(addressRef, {
                ...address,
                userId: userId,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving address to Firebase:', error);
        }
    }

    async loadAddressesFromFirebase(userId) {
        try {
            const q = query(collection(db, COLLECTIONS.ADDRESSES), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const addresses = [];
            querySnapshot.forEach((doc) => {
                addresses.push({ id: doc.id.split('_')[1], ...doc.data() });
            });
            return addresses;
        } catch (error) {
            console.error('Error loading addresses from Firebase:', error);
            return [];
        }
    }

    // Product Management
    async saveProductToFirebase(product) {
        try {
            const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
            await setDoc(productRef, {
                ...product,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving product to Firebase:', error);
        }
    }

    async loadProductsFromFirebase() {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
            const products = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            return products;
        } catch (error) {
            console.error('Error loading products from Firebase:', error);
            return [];
        }
    }

    // Chat Messages
    async saveChatMessage(message) {
        try {
            await addDoc(collection(db, COLLECTIONS.CHAT_MESSAGES), {
                ...message,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    }

    async loadChatMessages(conversationId) {
        try {
            const q = query(
                collection(db, COLLECTIONS.CHAT_MESSAGES), 
                where('conversationId', '==', conversationId),
                orderBy('timestamp', 'asc')
            );
            const querySnapshot = await getDocs(q);
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            return messages;
        } catch (error) {
            console.error('Error loading chat messages:', error);
            return [];
        }
    }

    // Refund Management
    async saveRefundToFirebase(refund) {
        try {
            const refundRef = doc(db, COLLECTIONS.REFUNDS, refund.id);
            await setDoc(refundRef, {
                ...refund,
                firebaseCreated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving refund to Firebase:', error);
        }
    }

    // Sync Local Data with Firebase
    async syncLocalDataToFirebase() {
        if (!this.currentUser) return;

        try {
            const userId = this.currentUser.uid;
            
            // Sync cart
            const localCart = JSON.parse(localStorage.getItem(`cart_${userId}`) || '[]');
            if (localCart.length > 0) {
                await this.saveCartToFirebase(userId, localCart);
            }

            // Sync addresses
            const localAddresses = JSON.parse(localStorage.getItem(`addresses_${userId}`) || '[]');
            for (const address of localAddresses) {
                await this.saveAddressToFirebase(userId, address);
            }

            // Sync saved designs
            const localDesigns = JSON.parse(localStorage.getItem(`savedDesigns_${userId}`) || '[]');
            if (localDesigns.length > 0) {
                const designsRef = doc(db, COLLECTIONS.USERS, userId);
                await updateDoc(designsRef, {
                    savedDesigns: localDesigns,
                    lastDesignSync: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('Error syncing local data to Firebase:', error);
        }
    }

    // Load Firebase Data to Local Storage
    async loadFirebaseDataToLocal() {
        if (!this.currentUser) return;

        try {
            const userId = this.currentUser.uid;
            
            // Load cart
            const firebaseCart = await this.loadCartFromFirebase(userId);
            if (firebaseCart.length > 0) {
                localStorage.setItem(`cart_${userId}`, JSON.stringify(firebaseCart));
            }

            // Load addresses
            const firebaseAddresses = await this.loadAddressesFromFirebase(userId);
            if (firebaseAddresses.length > 0) {
                localStorage.setItem(`addresses_${userId}`, JSON.stringify(firebaseAddresses));
            }

            // Load saved designs
            const userRef = doc(db, COLLECTIONS.USERS, userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().savedDesigns) {
                localStorage.setItem(`savedDesigns_${userId}`, JSON.stringify(userSnap.data().savedDesigns));
            }

        } catch (error) {
            console.error('Error loading Firebase data to local:', error);
        }
    }
}

// Initialize Firebase Service
const firebaseService = new FirebaseService();

// Export for use in other files
window.firebaseService = firebaseService;
window.COLLECTIONS = COLLECTIONS;
