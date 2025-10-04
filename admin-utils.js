// Admin utilities and common functions
const ADMIN_EMAIL = 'cardforcehelp@gmail.com';

// Check if current user is admin
function isAdmin() {
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return false;
    
    try {
        const userData = JSON.parse(googleUser);
        return userData.email === ADMIN_EMAIL;
    } catch (e) {
        return false;
    }
}

// Clear admin mode when user changes
function clearAdminMode() {
    const adminIndicator = document.getElementById('adminIndicator');
    if (adminIndicator) {
        adminIndicator.remove();
    }
    
    // Remove admin CSS
    const adminStyle = document.getElementById('adminStyle');
    if (adminStyle) {
        adminStyle.remove();
    }
    
    // Reset page title
    document.title = document.title.replace('Card Force Admin', 'Card Force');
}

// Disable animations for admin users
function disableAnimationsForAdmin() {
    if (isAdmin()) {
        // Add CSS to disable animations
        const style = document.createElement('style');
        style.id = 'adminStyle';
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
            }
        `;
        document.head.appendChild(style);
        
        // Update page title
        document.title = document.title.replace('Card Force', 'Card Force Admin');
    } else {
        clearAdminMode();
    }
}

// Initialize admin features
function initAdminFeatures() {
    if (isAdmin()) {
        // Add admin indicator to page
        const adminIndicator = document.createElement('div');
        adminIndicator.id = 'adminIndicator';
        adminIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(255, 68, 68, 0.3);
        `;
        adminIndicator.textContent = 'ADMIN MODE';
        document.body.appendChild(adminIndicator);
        
        // Add debug toggle button
        const debugToggle = document.createElement('button');
        debugToggle.id = 'debugToggle';
        debugToggle.textContent = 'Debug';
        debugToggle.style.cssText = `
            position: fixed;
            top: 10px;
            right: 120px;
            background: #007bff;
            color: white;
            padding: 5px 10px;
            border: none;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        `;
        debugToggle.onclick = toggleDebugButtons;
        document.body.appendChild(debugToggle);
        
        // Add admin navigation link
        addAdminNavLink();
    } else {
        clearAdminMode();
    }
}

// Real-time cart sync system
let cartListenerActive = false;

function setupCartListener() {
    if (cartListenerActive) return;
    
    if (!window.firebaseService || !window.firebaseService.isInitialized) {
        console.log('Cart listener skipped: Firebase not available');
        return;
    }
    
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) {
        console.log('Cart listener skipped: User not signed in');
        return;
    }
    
    const userData = JSON.parse(googleUser);
    const userId = userData.sub;
    
    console.log('🔄 Setting up real-time cart listener for user:', userId);
    
    try {
        // Listen for cart changes in Firebase
        const cartRef = window.doc(window.db, window.COLLECTIONS.CARTS, userId);
        
        window.onSnapshot(cartRef, (snapshot) => {
            if (snapshot.exists()) {
                const cartData = snapshot.data();
                const firebaseCart = cartData.items || [];
                
                console.log('📡 Cart updated from another device:', firebaseCart);
                
                // Update local storage
                const cartKey = `cart_${userId}`;
                localStorage.setItem(cartKey, JSON.stringify(firebaseCart));
                
                // Trigger cart refresh on current page
                if (typeof loadCartItems === 'function') {
                    loadCartItems();
                } else if (typeof renderCartItems === 'function') {
                    renderCartItems(firebaseCart);
                }
                
                // Dispatch custom event for other components
                window.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { cart: firebaseCart, source: 'firebase' } 
                }));
                
                console.log('✅ Cart synced from Firebase to local storage');
            }
        }, (error) => {
            console.error('❌ Cart listener error:', error);
        });
        
        cartListenerActive = true;
        console.log('✅ Real-time cart listener activated');
        
    } catch (error) {
        console.error('❌ Failed to setup cart listener:', error);
    }
}

function stopCartListener() {
    cartListenerActive = false;
    console.log('🛑 Cart listener stopped');
}

// Debug buttons toggle system
let debugButtonsVisible = false;
let debugButtons = [];

function toggleDebugButtons() {
    if (debugButtonsVisible) {
        hideDebugButtons();
    } else {
        showDebugButtons();
    }
}

function showDebugButtons() {
    if (debugButtonsVisible) return;
    
    debugButtonsVisible = true;
    
    // Create debug buttons
    const buttons = [
        {
            text: 'Test Cart',
            color: 'red',
            onclick: () => {
                console.log('🧪 Testing cart functionality...');
                if (typeof testCart === 'function') {
                    testCart();
                } else {
                    console.log('❌ testCart function not available');
                }
            }
        },
        {
            text: 'Test Firebase',
            color: 'blue',
            onclick: () => {
                console.log('🧪 Testing Firebase connection...');
                if (typeof testFirebaseConnection === 'function') {
                    testFirebaseConnection();
                } else {
                    console.log('❌ testFirebaseConnection function not available');
                }
            }
        },
        {
            text: 'Test Product Sync',
            color: 'green',
            onclick: () => {
                console.log('🧪 Testing product sync...');
                if (typeof testProductSync === 'function') {
                    testProductSync();
                } else {
                    console.log('❌ testProductSync function not available');
                }
            }
        },
        {
            text: 'Create Test Data',
            color: 'orange',
            onclick: () => {
                console.log('🧪 Creating test data...');
                if (typeof createTestProductData === 'function') {
                    createTestProductData();
                } else {
                    console.log('❌ createTestProductData function not available');
                }
            }
        },
        {
            text: 'Check Functions',
            color: 'purple',
            onclick: () => {
                console.log('🧪 Checking function availability...');
                if (typeof checkFunctionAvailability === 'function') {
                    checkFunctionAvailability();
                } else {
                    console.log('❌ checkFunctionAvailability function not available');
                }
            }
        },
        {
            text: 'Init Firebase',
            color: 'teal',
            onclick: () => {
                console.log('🧪 Initializing Firebase...');
                if (typeof initializeFirebaseWithGoogleUser === 'function') {
                    initializeFirebaseWithGoogleUser();
                } else {
                    console.log('❌ initializeFirebaseWithGoogleUser function not available');
                }
            }
        },
        {
            text: 'Refresh All',
            color: 'darkgreen',
            onclick: () => {
                console.log('🧪 Refreshing all pages...');
                if (typeof manualRefreshAllPages === 'function') {
                    manualRefreshAllPages();
                } else {
                    console.log('❌ manualRefreshAllPages function not available');
                }
            }
        },
        {
            text: 'Setup Cart Listener',
            color: 'navy',
            onclick: () => {
                console.log('🧪 Setting up cart listener...');
                setupCartListener();
            }
        },
        {
            text: 'Stop Cart Listener',
            color: 'maroon',
            onclick: () => {
                console.log('🧪 Stopping cart listener...');
                stopCartListener();
            }
        }
    ];
    
    // Create and position buttons
    buttons.forEach((button, index) => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.onclick = button.onclick;
        btn.style.cssText = `
            position: fixed;
            top: ${50 + (index * 40)}px;
            right: 10px;
            background: ${button.color};
            color: white;
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            margin-bottom: 5px;
        `;
        document.body.appendChild(btn);
        debugButtons.push(btn);
    });
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 180px;
        background: #dc3545;
        color: white;
        padding: 5px 10px;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    `;
    closeBtn.onclick = hideDebugButtons;
    document.body.appendChild(closeBtn);
    debugButtons.push(closeBtn);
    
    // Update debug toggle button
    const debugToggle = document.getElementById('debugToggle');
    if (debugToggle) {
        debugToggle.textContent = 'Hide Debug';
        debugToggle.style.background = '#6c757d';
    }
}

function hideDebugButtons() {
    if (!debugButtonsVisible) return;
    
    debugButtonsVisible = false;
    
    // Remove all debug buttons
    debugButtons.forEach(btn => {
        if (btn && btn.parentNode) {
            btn.parentNode.removeChild(btn);
        }
    });
    debugButtons = [];
    
    // Update debug toggle button
    const debugToggle = document.getElementById('debugToggle');
    if (debugToggle) {
        debugToggle.textContent = 'Debug';
        debugToggle.style.background = '#007bff';
    }
}

// Add admin navigation link
function addAdminNavLink() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        if (!document.getElementById('adminNavLinkOrders')) {
            const li1 = document.createElement('li');
            li1.id = 'adminNavLinkOrders';
            li1.innerHTML = '<a href="admin-orders.html" onclick="closeMenu()" style="background: #ff4444 !important; color: white !important;">Admin Orders</a>';
            navMenu.appendChild(li1);
        }
        if (!document.getElementById('adminNavLinkMessages')) {
            const li2 = document.createElement('li');
            li2.id = 'adminNavLinkMessages';
            li2.innerHTML = '<a href="admin-messages.html" onclick="closeMenu()" style="background: #ff4444 !important; color: white !important;">Messages</a>';
            navMenu.appendChild(li2);
        }
        return;
    }
    // Fallback: inject into right side if nav-right exists
    const right = document.querySelector('.nav-right') || document.querySelector('.header-actions');
    if (right && !document.getElementById('adminQuickMessages')) {
        const btn = document.createElement('a');
        btn.id = 'adminQuickMessages';
        btn.href = 'admin-messages.html';
        btn.textContent = 'Messages';
        btn.style.cssText = 'color:#fff;text-decoration:none;background:#ff4444;padding:6px 10px;border-radius:8px;font-weight:700;';
        right.appendChild(btn);
    }
}

// Stock management
function getStockData() {
    return JSON.parse(localStorage.getItem('stockData') || '{}');
}

function updateStock(itemId, newStock) {
    const stockData = getStockData();
    stockData[itemId] = newStock;
    localStorage.setItem('stockData', JSON.stringify(stockData));
    
    // Sync stock update to Firebase (works for both signed-in and anonymous users)
    if (window.firebaseService && window.firebaseService.isInitialized) {
        console.log(`🔄 Syncing stock update for ${itemId}: ${newStock}`);
        window.firebaseService.saveStockToFirebase(itemId, newStock).then(() => {
            console.log(`✅ Stock synced to Firebase: ${itemId} = ${newStock}`);
        }).catch(error => {
            console.error(`❌ Failed to sync stock to Firebase:`, error);
        });
    }
}

// Load stock data from Firebase and merge with local data
async function loadStockFromFirebase() {
    if (!window.firebaseService || !window.firebaseService.isInitialized) {
        console.log('⚠️ Firebase not available for loading stock');
        return;
    }
    
    try {
        const firebaseStock = await window.firebaseService.loadStockFromFirebase();
        const localStockData = getStockData();
        
        // Merge Firebase stock with local stock (Firebase takes precedence)
        Object.keys(firebaseStock).forEach(itemId => {
            localStockData[itemId] = firebaseStock[itemId];
        });
        
        // Update local storage with merged data
        localStorage.setItem('stockData', JSON.stringify(localStockData));
        console.log('✅ Stock data synced from Firebase');
        
    } catch (error) {
        console.error('❌ Error loading stock from Firebase:', error);
    }
}

// Make stock sync functions globally available
window.loadStockFromFirebase = loadStockFromFirebase;

function getStock(itemId) {
    const stockData = getStockData();
    return stockData[itemId] || 0;
}

function reduceStock(itemId, amount = 1) {
    const currentStock = getStock(itemId);
    const newStock = Math.max(0, currentStock - amount);
    updateStock(itemId, newStock);
    return newStock;
}

// Initialize stock data for existing items
function initStockData() {
    const stockData = getStockData();
    
    // Initialize stock for trading cards if not exists
    if (!stockData['pig-princess']) {
        stockData['pig-princess'] = 50;
    }
    if (!stockData['mike']) {
        stockData['mike'] = 30;
    }
    
    localStorage.setItem('stockData', JSON.stringify(stockData));
}

// Address management
function getAddresses() {
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return [];
    
    const userData = JSON.parse(googleUser);
    const addressesKey = `addresses_${userData.sub}`;
    return JSON.parse(localStorage.getItem(addressesKey) || '[]');
}

function saveAddress(address) {
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return;
    
    const userData = JSON.parse(googleUser);
    const addressesKey = `addresses_${userData.sub}`;
    const addresses = getAddresses();
    
    if (!address.id) {
        address.id = Date.now();
    }
    
    const existingIndex = addresses.findIndex(addr => addr.id === address.id);
    if (existingIndex >= 0) {
        addresses[existingIndex] = address;
    } else {
        addresses.push(address);
    }
    
    localStorage.setItem(addressesKey, JSON.stringify(addresses));
}

function deleteAddress(addressId) {
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return;
    
    const userData = JSON.parse(googleUser);
    const addressesKey = `addresses_${userData.sub}`;
    const addresses = getAddresses();
    const filteredAddresses = addresses.filter(addr => addr.id !== addressId);
    
    localStorage.setItem(addressesKey, JSON.stringify(filteredAddresses));
}

// Product management
function getProductData() {
    return JSON.parse(localStorage.getItem('productData') || '{}');
}

function updateProductData(productData, skipFirebaseSync = false) {
    localStorage.setItem('productData', JSON.stringify(productData));
    
    // Sync to Firebase if available and not skipping sync
    if (!skipFirebaseSync && window.firebaseService && window.firebaseService.isInitialized) {
        syncProductDataToFirebase(productData);
    }
}

// Global function to sync product data to Firebase
function syncProductDataToFirebase(productData) {
    // Ensure Firebase service is initialized
    if (!window.firebaseService || !window.firebaseService.currentUser) {
        // Try to initialize Firebase service with Google user
        const googleUser = localStorage.getItem('googleUser');
        if (googleUser) {
            const userData = JSON.parse(googleUser);
            if (window.firebaseService) {
                window.firebaseService.currentUser = {
                    uid: userData.sub,
                    email: userData.email,
                    displayName: userData.name,
                    photoURL: userData.picture
                };
                window.firebaseService.isInitialized = true;
                console.log('🔄 Firebase service auto-initialized for product sync');
            }
        }
    }
    
    if (window.firebaseService && window.firebaseService.isInitialized) {
        console.log('🔄 Syncing product data to Firebase...');
        // Save each product to Firebase
        Object.keys(productData).forEach(productId => {
            const product = productData[productId];
            if (product) {
                console.log(`📦 Syncing product ${productId}:`, product);
                window.firebaseService.saveProductToFirebase({
                    id: productId,
                    ...product
                }).then(() => {
                    console.log(`✅ Product ${productId} synced to Firebase`);
                }).catch(error => {
                    console.error(`❌ Failed to sync product ${productId}:`, error);
                });
            }
        });
    } else {
        console.log('⚠️ Firebase sync skipped - service not available');
    }
}

// Load product data from Firebase and merge with local data
async function loadProductDataFromFirebase() {
    if (!window.firebaseService || !window.firebaseService.isInitialized) {
        console.log('⚠️ Firebase service not initialized for product data loading');
        return;
    }
    
    try {
        const firebaseProducts = await window.firebaseService.loadProductsFromFirebase();
        const localProductData = getProductData();
        
        // Merge Firebase data with local data, but respect local deletions
        firebaseProducts.forEach(product => {
            // Only merge if the product exists locally (not deleted)
            // This prevents deleted products from being restored
            if (localProductData.hasOwnProperty(product.id) && localProductData[product.id] !== undefined) {
                localProductData[product.id] = {
                    ...localProductData[product.id], // Keep local data
                    ...product // Override with Firebase data
                };
            } else {
                console.log(`⚠️ Skipping deleted product ${product.id} from Firebase restore`);
            }
        });
        
        // Also update the product catalog to include Firebase products (respecting deletions)
        const catalog = getProductCatalog();
        firebaseProducts.forEach(product => {
            // Only add/update if the product wasn't locally deleted
            if (localProductData.hasOwnProperty(product.id) && localProductData[product.id] !== undefined) {
                const existingIndex = catalog.findIndex(p => p.id === product.id);
                if (existingIndex >= 0) {
                    catalog[existingIndex] = { ...catalog[existingIndex], ...product };
                } else {
                    catalog.push(product);
                }
            }
        });
        
        // Save updated catalog to localStorage
        localStorage.setItem('productCatalog', JSON.stringify(catalog));
        
        // Update local storage with merged data (skip Firebase sync to avoid circular calls)
        updateProductData(localProductData, true);
        console.log('✅ Product data synced from Firebase (respecting local deletions)');
        console.log('✅ Product catalog updated with Firebase products:', catalog.length);
        
        // Trigger page refresh if needed
        triggerProductDataRefresh();
        
    } catch (error) {
        console.error('❌ Error loading product data from Firebase:', error);
    }
}

// Set up real-time listener for product data changes
function setupProductDataListener() {
    if (!window.firebaseService || !window.firebaseService.isInitialized || !window.db || !window.COLLECTIONS) {
        console.log('⚠️ Firebase not ready for real-time listener');
        console.log('Firebase Service:', !!window.firebaseService);
        console.log('Service Initialized:', !!window.firebaseService?.isInitialized);
        console.log('DB:', !!window.db);
        console.log('Collections:', !!window.COLLECTIONS);
        return;
    }
    
    console.log('🔄 Setting up real-time product data listener...');
    
    const productsRef = window.collection(window.db, window.COLLECTIONS.PRODUCTS);
    
    window.onSnapshot(productsRef, (snapshot) => {
        console.log('📡 Real-time product data update received');
        console.log('Changes:', snapshot.docChanges().length);
        
        const localProductData = getProductData();
        let hasChanges = false;
        
        snapshot.docChanges().forEach((change) => {
            const product = { id: change.doc.id, ...change.doc.data() };
            
            if (change.type === 'added' || change.type === 'modified') {
                console.log(`📦 Product ${product.id} ${change.type}:`, product);
                localProductData[product.id] = {
                    ...localProductData[product.id],
                    ...product
                };
                hasChanges = true;
            } else if (change.type === 'removed') {
                console.log(`🗑️ Product ${product.id} removed`);
                delete localProductData[product.id];
                hasChanges = true;
            }
        });
        
            if (hasChanges) {
                // Update local storage (skip Firebase sync to avoid circular calls)
                updateProductData(localProductData, true);
                
                // Also update the product catalog with real-time changes
                const catalog = getProductCatalog();
                snapshot.docChanges().forEach((change) => {
                    const product = { id: change.doc.id, ...change.doc.data() };
                    
                    if (change.type === 'added' || change.type === 'modified') {
                        const existingIndex = catalog.findIndex(p => p.id === product.id);
                        if (existingIndex >= 0) {
                            catalog[existingIndex] = { ...catalog[existingIndex], ...product };
                        } else {
                            catalog.push(product);
                        }
                    } else if (change.type === 'removed') {
                        const index = catalog.findIndex(p => p.id === product.id);
                        if (index >= 0) {
                            catalog.splice(index, 1);
                        }
                    }
                });
                
                // Save updated catalog to localStorage
                localStorage.setItem('productCatalog', JSON.stringify(catalog));
                
                console.log('✅ Local product data updated from real-time changes');
                console.log('✅ Product catalog updated from real-time changes:', catalog.length);
                
                // Trigger page refresh
                triggerProductDataRefresh();
            } else {
                console.log('📡 No changes detected in real-time update');
            }
    }, (error) => {
        console.error('❌ Real-time listener error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
    });
}

// Function to trigger page refresh when product data changes
function triggerProductDataRefresh() {
    console.log('🔄 Triggering product data refresh across pages...');
    
    // Dispatch custom event for pages to listen to
    window.dispatchEvent(new CustomEvent('productDataUpdated', {
        detail: { timestamp: new Date().toISOString() }
    }));
    
    // Force refresh of all common page functions
    setTimeout(() => {
        // Trading Cards page
        if (typeof renderCatalogProducts === 'function') {
            console.log('🔄 Refreshing catalog products...');
            renderCatalogProducts();
        }
        
        // Cart page
        if (typeof loadCartItems === 'function') {
            console.log('🔄 Refreshing cart items...');
            loadCartItems();
        }
        
        // Product page
        if (typeof loadProduct === 'function') {
            console.log('🔄 Refreshing product display...');
            loadProduct();
        }
        
        // Shop page
        if (typeof refreshProductDisplay === 'function') {
            console.log('🔄 Refreshing shop display...');
            refreshProductDisplay();
        }
        
        // Index page
        if (typeof refreshProductDisplay === 'function') {
            console.log('🔄 Refreshing index display...');
            refreshProductDisplay();
        }
        
        // Account page
        if (typeof refreshProductDisplay === 'function') {
            console.log('🔄 Refreshing account display...');
            refreshProductDisplay();
        }
        
        // Admin orders page
        if (typeof refreshProductDisplay === 'function') {
            console.log('🔄 Refreshing admin orders display...');
            refreshProductDisplay();
        }
        
        console.log('✅ All page refresh functions called');
    }, 100);
}

// Manual refresh function for testing
function manualRefreshAllPages() {
    console.log('🔄 Manual refresh triggered for all pages...');
    triggerProductDataRefresh();
}

// Make functions globally available
window.loadProductDataFromFirebase = loadProductDataFromFirebase;
window.syncProductDataToFirebase = syncProductDataToFirebase;
window.setupProductDataListener = setupProductDataListener;
window.triggerProductDataRefresh = triggerProductDataRefresh;
window.manualRefreshAllPages = manualRefreshAllPages;

// Test function to manually sync product data to Firebase
async function testProductSync() {
    console.log('🧪 Testing product sync to Firebase...');
    
    if (!window.firebaseService || !window.firebaseService.currentUser) {
        console.log('❌ Firebase service or user not available');
        return;
    }
    
    const productData = getProductData();
    console.log('📦 Current product data:', productData);
    
    if (Object.keys(productData).length === 0) {
        console.log('⚠️ No product data to sync');
        return;
    }
    
    try {
        // Test syncing each product
        for (const [productId, product] of Object.entries(productData)) {
            console.log(`🔄 Syncing product ${productId}...`);
            await window.firebaseService.saveProductToFirebase({
                id: productId,
                ...product
            });
            console.log(`✅ Product ${productId} synced successfully`);
        }
        
        console.log('🎉 All products synced to Firebase!');
        
    } catch (error) {
        console.error('❌ Product sync failed:', error);
    }
}

// Make test function globally available
window.testProductSync = testProductSync;

// Function to create test product data
function createTestProductData() {
    const testProducts = {
        'test-card-1': {
            name: 'Test Card 1',
            price: 9.99,
            discount: 10,
            status: 'Available',
            stock: 50
        },
        'test-card-2': {
            name: 'Test Card 2',
            price: 15.99,
            discount: 20,
            status: 'Available',
            stock: 25
        }
    };
    
    updateProductData(testProducts);
    console.log('✅ Test product data created:', testProducts);
}

// Make function globally available
window.createTestProductData = createTestProductData;

function getProductStatus(productId) {
    const productData = getProductData();
    return productData[productId]?.status || 'Available';
}

function setProductStatus(productId, status, backorderDays = null) {
    const productData = getProductData();
    if (!productData[productId]) {
        productData[productId] = {};
    }
    productData[productId].status = status;
    if (backorderDays !== null) {
        productData[productId].backorderDays = backorderDays;
    }
    updateProductData(productData);
    console.log(`🔄 Product ${productId} status updated to ${status} - syncing to Firebase`);
}

function getProductDiscount(productId) {
    const productData = getProductData();
    return productData[productId]?.discount || 0;
}

function setProductDiscount(productId, discount) {
    const productData = getProductData();
    if (!productData[productId]) {
        productData[productId] = {};
    }
    productData[productId].discount = discount;
    updateProductData(productData);
    console.log(`🔄 Product ${productId} discount updated to ${discount}% - syncing to Firebase`);
}

function getProductPrice(productId) {
    const productData = getProductData();
    return productData[productId]?.price || null;
}

function setProductPrice(productId, price) {
    const productData = getProductData();
    if (!productData[productId]) {
        productData[productId] = {};
    }
    productData[productId].price = price;
    updateProductData(productData);
    console.log(`🔄 Product ${productId} price updated to $${price} - syncing to Firebase`);
}

// Product catalog (admin-added products)
function getProductCatalog() {
    return JSON.parse(localStorage.getItem('productCatalog') || '[]');
}

function saveProductCatalog(catalog) {
    localStorage.setItem('productCatalog', JSON.stringify(catalog));
    console.log('🔄 Product catalog updated - syncing to Firebase');
    
    // Sync catalog products to Firebase as individual products
    if (window.syncProductDataToFirebase) {
        const productData = {};
        catalog.forEach(product => {
            productData[product.id] = product;
        });
        window.syncProductDataToFirebase(productData);
    }
}

function upsertCatalogProduct(product) {
    const catalog = getProductCatalog();
    const idx = catalog.findIndex(p => p.id === product.id);
    if (idx >= 0) catalog[idx] = { ...catalog[idx], ...product };
    else catalog.push(product);
    saveProductCatalog(catalog);
    
    // Sync to Firebase
    if (window.firebaseService && window.firebaseService.isInitialized) {
        console.log(`🔄 Product ${product.id} upserted to catalog - syncing to Firebase`);
        window.firebaseService.saveProductToFirebase(product).then(() => {
            console.log(`✅ Product ${product.id} synced to Firebase successfully`);
        }).catch(error => {
            console.error(`❌ Failed to sync product ${product.id} to Firebase:`, error);
        });
    } else {
        console.log(`⚠️ Product ${product.id} saved locally but Firebase sync skipped - user not signed in`);
    }
}

// Order management
function getOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
}

// Order sync functions
function saveOrderToFirebase(order) {
    if (!window.firebaseService || !window.firebaseService.isInitialized) {
        console.log('⚠️ Firebase not available for order sync');
        return Promise.resolve();
    }
    
    console.log('🔄 Syncing order to Firebase:', order.id);
    
    return window.firebaseService.saveOrderToFirebase(order).then(() => {
        console.log('✅ Order synced to Firebase:', order.id);
    }).catch(error => {
        console.error('❌ Failed to sync order to Firebase:', error);
    });
}

function loadOrdersFromFirebase() {
    if (!window.firebaseService || !window.firebaseService.isInitialized) {
        console.log('⚠️ Firebase not available for loading orders');
        return Promise.resolve([]);
    }
    
    console.log('🔄 Loading orders from Firebase...');
    
    return window.firebaseService.loadOrdersFromFirebase().then(orders => {
        console.log('✅ Orders loaded from Firebase:', orders.length);
        return orders;
    }).catch(error => {
        console.error('❌ Failed to load orders from Firebase:', error);
        return [];
    });
}

// Enhanced order functions with Firebase sync
function saveOrders(orders, syncToFirebase = true) {
    localStorage.setItem('orders', JSON.stringify(orders));
    
    if (syncToFirebase) {
        // Sync each order to Firebase
        orders.forEach(order => {
            saveOrderToFirebase(order);
        });
    }
}

function addOrder(order, syncToFirebase = true) {
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders, syncToFirebase);
    
    if (syncToFirebase) {
        saveOrderToFirebase(order);
    }
    
    console.log('✅ Order added:', order.id);
}

function updateOrder(orderId, updates, syncToFirebase = true) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex] = { ...orders[orderIndex], ...updates };
        saveOrders(orders, false); // Don't sync all orders, just the updated one
        
        if (syncToFirebase) {
            saveOrderToFirebase(orders[orderIndex]);
        }
        
        console.log('✅ Order updated:', orderId);
    }
}

// Make order sync functions globally available
window.saveOrderToFirebase = saveOrderToFirebase;
window.loadOrdersFromFirebase = loadOrdersFromFirebase;
window.addOrder = addOrder;
window.updateOrder = updateOrder;

// Test function to debug Firebase orders
function testFirebaseOrders() {
    console.log('=== TESTING FIREBASE ORDERS ===');
    
    if (!window.firebaseService || !window.firebaseService.isInitialized) {
        console.log('❌ Firebase service not initialized');
        return;
    }
    
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) {
        console.log('❌ No Google user found');
        return;
    }
    
    const userData = JSON.parse(googleUser);
    console.log('User data:', userData);
    
    // Test creating a test order
    const testOrder = {
        id: Date.now(),
        userId: userData.sub,
        userEmail: userData.email,
        orderNumber: 'TEST' + Date.now(),
        items: [{
            name: 'Test Item',
            price: 1.00,
            type: 'test'
        }],
        totalPrice: 1.00,
        status: 'test',
        createdAt: new Date().toISOString()
    };
    
    console.log('🧪 Creating test order:', testOrder);
    
    // Save test order to Firebase
    window.firebaseService.saveOrderToFirebase(testOrder).then(() => {
        console.log('✅ Test order saved to Firebase');
        
        // Try to load it back
        return window.firebaseService.loadOrdersFromFirebase();
    }).then(orders => {
        console.log('📋 Orders loaded from Firebase:', orders.length);
        orders.forEach(order => {
            console.log('Order:', {
                id: order.id,
                userId: order.userId,
                userEmail: order.userEmail,
                status: order.status,
                createdAt: order.createdAt
            });
        });
    }).catch(error => {
        console.error('❌ Test failed:', error);
    });
    
    console.log('=== END TEST ===');
}

// Make test function globally available
window.testFirebaseOrders = testFirebaseOrders;

function createOrder(cartItems, totalPrice, shippingAddress, emailNotifications = false) {
    const orders = getOrders();
    const orderNumber = 'CF' + Date.now().toString().slice(-6);
    // Capture current user (for My Orders)
    let userId = null;
    let userEmail = null;
    try {
        const googleUser = JSON.parse(localStorage.getItem('googleUser') || 'null');
        if (googleUser) {
            userId = googleUser.sub || null;
            userEmail = googleUser.email || null;
        }
    } catch (_) {}

    // Process cart items to include custom card data and apply discounts
    const processedItems = cartItems.map(item => {
        let finalPrice = item.price;
        
        // Apply discounts for trading cards
        if (item.type === 'trading-card' && item.cardId) {
            const productData = getProductData();
            const card = productData[item.cardId];
            if (card && card.discount > 0) {
                finalPrice = card.price * (1 - card.discount / 100);
            }
        }
        
        // Include custom card data if it's a custom card
        if (item.type === 'custom' || item.editorType) {
            const customData = getCustomCardData(item.id);
            return {
                ...item,
                price: finalPrice,
                customData: customData || null
            };
        }
        
        return {
            ...item,
            price: finalPrice
        };
    });

    const order = {
        id: Date.now(),
        orderNumber: orderNumber,
        userId: userId,  // Use userId instead of userSub for Firebase compatibility
        userEmail: userEmail,
        items: processedItems,
        totalPrice: totalPrice,
        shippingAddress: shippingAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        shippingCompany: null,
        trackingNumber: null,
        emailNotifications: emailNotifications,
        cancellationReason: null
    };
    orders.push(order);
    saveOrders(orders);
    
    // Save to Firebase using proper wrapper function
    if (window.firebaseService && window.firebaseService.isInitialized) {
        saveOrderToFirebase(order);
    } else {
        // Retry Firebase sync after a short delay
        setTimeout(() => {
            if (window.firebaseService && window.firebaseService.isInitialized) {
                saveOrderToFirebase(order);
            }
        }, 2000);
    }
    
    console.log('✅ Order created:', {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        userEmail: order.userEmail,
        status: order.status,
        totalPrice: order.totalPrice
    });
    
    // Send confirmation email if requested
    if (emailNotifications && userEmail) {
        sendOrderConfirmationEmail(userEmail, orderNumber, processedItems, totalPrice);
    }
    
    return order;
}

function sendOrderConfirmationEmail(email, orderNumber, items, totalPrice) {
    const subject = `Order Confirmation - ${orderNumber}`;
    const body = `
Order Confirmation

Thank you for your order!

Order Number: ${orderNumber}
Total: $${totalPrice.toFixed(2)}

Items:
${items.map(item => `- ${item.name}: $${item.price.toFixed(2)}`).join('\n')}

We'll process your order and send you updates via email.

Thank you for choosing Card Force!

Best regards,
Card Force Team
    `.trim();

    sendEmail(email, subject, body);
}

function sendOrderCancellationEmail(email, orderNumber, reason) {
    const subject = `Order Cancelled - ${orderNumber}`;
    const body = `
Order Cancellation Notice

Your order has been cancelled.

Order Number: ${orderNumber}
Cancellation Reason: ${reason}

If you have any questions, please contact us.

Best regards,
Card Force Team
    `.trim();

    sendEmail(email, subject, body);
}

function sendShippingConfirmationEmail(email, orderNumber, trackingNumber, shippingCompany) {
    const subject = `Your Order Has Shipped - ${orderNumber}`;
    const body = `
Shipping Confirmation

Great news! Your order has shipped.

Order Number: ${orderNumber}
Tracking Number: ${trackingNumber}
Shipping Company: ${shippingCompany}

You can track your package using the tracking number above.

Thank you for your order!

Best regards,
Card Force Team
    `.trim();

    sendEmail(email, subject, body);
}

function sendEmail(to, subject, body) {
    // EMAIL SETUP GUIDE:
    // To enable real email sending, you have several options:
    //
    // OPTION 1: EmailJS (Recommended - Free & Easy)
    // 1. Go to https://www.emailjs.com/
    // 2. Create a free account
    // 3. Create an email service (Gmail, Outlook, etc.)
    // 4. Create an email template
    // 5. Add this script to your HTML: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
    // 6. Initialize EmailJS: emailjs.init('YOUR_PUBLIC_KEY');
    // 7. Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' below with your actual IDs
    //
    // OPTION 2: Backend Email Service
    // Create a simple backend API endpoint that sends emails using:
    // - Nodemailer (Node.js)
    // - SendGrid API
    // - AWS SES
    // - Mailgun
    // Then call your API from this function
    //
    // OPTION 3: Current Implementation
    // Opens user's email client with pre-filled email (works immediately)
    
    // Method 1: Use EmailJS (free service for frontend email sending)
    if (typeof emailjs !== 'undefined') {
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
            to_email: to,
            subject: subject,
            message: body
        }).then(function(response) {
            console.log('Email sent successfully:', response);
            showEmailNotification('Email sent successfully!', 'success');
        }, function(error) {
            console.error('Email failed to send:', error);
            showEmailNotification('Email failed to send. Please check console.', 'error');
        });
        return;
    }

    // Method 2: Use mailto link (opens user's email client)
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Create a temporary link and click it
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Show notification that email client was opened
    showEmailNotification('Email client opened for sending email', 'info');

    // Also log to console for debugging
    console.log(`Email prepared for: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
}

function showEmailNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#2ed573';
            break;
        case 'error':
            notification.style.backgroundColor = '#ff3742';
            break;
        case 'info':
        default:
            notification.style.backgroundColor = '#6a4c93';
            break;
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }, 4000);
}

function updateOrderStatus(orderId, status, shippingCompany = null, trackingNumber = null) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        const order = orders[orderIndex];
        order.status = status;
        if (shippingCompany) {
            order.shippingCompany = shippingCompany;
        }
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }
        
        // Send email notifications if requested
        if (order.emailNotifications && order.userEmail) {
            if (status === 'shipped' && trackingNumber && shippingCompany) {
                sendShippingConfirmationEmail(order.userEmail, order.orderNumber, trackingNumber, shippingCompany);
            }
        }
        
        saveOrders(orders);
    }
}

function cancelOrder(orderId, reason) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        const order = orders[orderIndex];
        order.status = 'cancelled';
        order.cancellationReason = reason;
        order.cancelledAt = new Date().toISOString();
        
        // Process automatic refund
        processRefund(order);
        
        // Send cancellation email if requested
        if (order.emailNotifications && order.userEmail) {
            sendOrderCancellationEmail(order.userEmail, order.orderNumber, reason);
        }
        
        saveOrders(orders);
        return order;
    }
    return null;
}

function processRefund(order) {
    // Create refund record
    const refund = {
        id: Date.now(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalPrice,
        paymentMethod: order.paymentMethod || 'paypal',
        status: 'pending',
        createdAt: new Date().toISOString(),
        reason: order.cancellationReason || 'Order cancelled'
    };
    
    // Store refund
    const refunds = getRefunds();
    refunds.push(refund);
    saveRefunds(refunds);
    
    // Send refund notification email
    if (order.emailNotifications && order.userEmail) {
        sendRefundNotificationEmail(order.userEmail, order.orderNumber, refund.amount, refund.paymentMethod);
    }
    
    // Log refund for admin tracking
    console.log(`Refund processed for order ${order.orderNumber}: $${refund.amount} via ${refund.paymentMethod}`);
    
    return refund;
}

function getRefunds() {
    try {
        return JSON.parse(localStorage.getItem('refunds') || '[]');
    } catch (error) {
        console.error('Error loading refunds:', error);
        return [];
    }
}

function saveRefunds(refunds) {
    try {
        localStorage.setItem('refunds', JSON.stringify(refunds));
    } catch (error) {
        console.error('Error saving refunds:', error);
    }
}

function sendRefundNotificationEmail(email, orderNumber, amount, paymentMethod) {
    const subject = `Refund Processed - Order ${orderNumber}`;
    const body = `
Refund Notification

Your refund has been processed for the following order:

Order Number: ${orderNumber}
Refund Amount: $${amount.toFixed(2)}
Payment Method: ${paymentMethod.toUpperCase()}

The refund will appear in your account within 3-5 business days, depending on your payment method.

If you have any questions about this refund, please contact us.

Thank you for your understanding.

Best regards,
Card Force Team
    `.trim();

    sendEmail(email, subject, body);
}

// Monitor user changes
let currentUserEmail = null;

function checkUserChange() {
    const googleUser = localStorage.getItem('googleUser');
    let userEmail = null;
    
    if (googleUser) {
        try {
            const userData = JSON.parse(googleUser);
            userEmail = userData.email;
        } catch (e) {
            userEmail = null;
        }
    }
    
    if (userEmail !== currentUserEmail) {
        currentUserEmail = userEmail;
        disableAnimationsForAdmin();
        initAdminFeatures();
    }
}

// Initialize on page load
// Make cart listener functions globally available
window.setupCartListener = setupCartListener;
window.stopCartListener = stopCartListener;

document.addEventListener('DOMContentLoaded', function() {
    disableAnimationsForAdmin();
    initAdminFeatures();
    initStockData();
    
    // Setup cart listener for all pages
    setTimeout(() => {
        setupCartListener();
    }, 2000);
    
    // Load stock from Firebase
    setTimeout(() => {
        if (window.loadStockFromFirebase) {
            window.loadStockFromFirebase();
        }
    }, 3000);
    
    enhanceNavbar();
    addSlimNavStyles();
    
    // Check for user changes every second
    setInterval(checkUserChange, 1000);
});

// -------- Global UI Enhancements (Search + Profile) --------
function isSignedIn() {
    try { return !!JSON.parse(localStorage.getItem('googleUser') || 'null'); } catch (_) { return false; }
}

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('googleUser') || 'null'); } catch (_) { return null; }
}

function signOutGlobal() {
    localStorage.removeItem('googleUser');
    clearAdminMode();
    window.location.href = 'index.html';
}

function enhanceNavbar() {
    // Try multiple containers across pages
    const nav = document.querySelector('.nav-container') || document.querySelector('.header-content');
    if (!nav || nav.querySelector('.nav-right')) return;
    
    // Add global nav elements (search + profile dropdown)
    addGlobalNavElements();
}

function addGlobalNavElements() {
    const nav = document.querySelector('.nav-container') || document.querySelector('.header-content');
    if (!nav || nav.querySelector('.nav-right')) return;
    
    // Hide static Account link if present
    try {
        const links = nav.querySelectorAll('.nav-menu a');
        links.forEach(a => { if ((a.textContent || '').trim().toLowerCase() === 'account') a.style.display = 'none'; });
    } catch (_) {}
    
    // Add search icon
    const searchIcon = document.createElement('div');
    searchIcon.className = 'nav-search';
    searchIcon.style.cssText = 'cursor:pointer;width:24px;height:24px;position:relative;padding:0.5rem;border-radius:50%;transition:all 0.2s;';
    searchIcon.innerHTML = `
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
            <div style="width:16px;height:16px;border:2px solid #fff;border-radius:50%;position:relative;">
                <div style="width:6px;height:2px;background:#fff;position:absolute;bottom:-2px;right:-2px;transform:rotate(45deg);"></div>
            </div>
        </div>
    `;
    searchIcon.onclick = () => {
        showCustomSearchModal();
    };
    
    // Add profile dropdown
    const profileDropdown = document.createElement('div');
    profileDropdown.className = 'nav-profile';
    profileDropdown.style.cssText = 'position:relative;cursor:pointer;';
    profileDropdown.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.5rem;color:#fff;padding:0.5rem;border-radius:8px;transition:all 0.2s;">
            <div style="width:32px;height:32px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;">
                <div style="width:20px;height:20px;border:2px solid #6a4c93;border-radius:50%;position:relative;">
                    <div style="width:8px;height:8px;background:#6a4c93;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>
                    <div style="width:12px;height:6px;border:2px solid #6a4c93;border-top:none;border-radius:0 0 6px 6px;position:absolute;top:100%;left:50%;transform:translateX(-50%);"></div>
                </div>
            </div>
            <span>Account</span>
        </div>
        <div id="profileDropdown" style="position:absolute;top:100%;right:0;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:200px;display:none;z-index:1000;">
            <div style="padding:0.5rem 0;">
                ${isSignedIn() ? `
                    <a href="account.html" style="display:block;padding:0.5rem 1rem;color:#333;text-decoration:none;border-bottom:1px solid #eee;">Account</a>
                    <a href="saved-designs.html" style="display:block;padding:0.5rem 1rem;color:#333;text-decoration:none;border-bottom:1px solid #eee;">Saved Designs</a>
                    <a href="cart.html" style="display:block;padding:0.5rem 1rem;color:#333;text-decoration:none;border-bottom:1px solid #eee;">Cart</a>
                    ${isAdmin() ? '<a href="admin-orders.html" style="display:block;padding:0.5rem 1rem;color:#333;text-decoration:none;border-bottom:1px solid #eee;background:#ff4444;color:#fff;">Admin Orders</a><a href="admin-messages.html" style="display:block;padding:0.5rem 1rem;color:#333;text-decoration:none;border-bottom:1px solid #eee;background:#ff4444;color:#fff;">Messages</a>' : ''}
                    <a href="#" onclick="signOutGlobal(); return false;" style="display:block;padding:0.5rem 1rem;color:#dc3545;text-decoration:none;">Sign Out</a>
                ` : `
                    <a href="account.html" style="display:block;padding:0.5rem 1rem;color:#333;text-decoration:none;">Sign In</a>
                `}
            </div>
        </div>
    `;
    
    profileDropdown.onclick = (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('profileDropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    };
    
    // Create nav-right container
    const navRight = document.createElement('div');
    navRight.className = 'nav-right';
    navRight.style.cssText = 'display:flex;align-items:center;gap:1rem;';
    navRight.appendChild(searchIcon);
    navRight.appendChild(profileDropdown);
    
    nav.appendChild(navRight);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target)) {
            document.getElementById('profileDropdown').style.display = 'none';
        }
    });
}

// Apply slim nav styles globally so all pages are consistent without per-page edits
function addSlimNavStyles() {
    if (document.getElementById('slimNavStyles')) return;
    const style = document.createElement('style');
    style.id = 'slimNavStyles';
    style.textContent = `
        .navbar{padding:0.5rem 0 !important}
        .nav-container,.header-content{padding:0 1.25rem !important;display:flex !important;justify-content:space-between !important;align-items:center !important;}
        .logo{font-size:1.4rem !important}
        .logo-icon{width:40px !important;height:48px !important}
        .nav-menu{gap:0.25rem !important;margin:0 !important;padding:0 !important;}
        .nav-menu a{padding:0.35rem 0.5rem !important}
        
        /* Custom Hamburger Menu */
        .hamburger{display:none;flex-direction:column;cursor:pointer;padding:0.5rem;z-index:1001;position:relative;width:30px;height:30px;justify-content:center;align-items:center;}
        .hamburger span{width:20px;height:3px;background-color:#fff;margin:2px 0;transition:all 0.3s ease;border-radius:2px;display:block;}
        .hamburger.active span:nth-child(1){transform:translateY(6px);}
        .hamburger.active span:nth-child(2){opacity:0;}
        .hamburger.active span:nth-child(3){transform:translateY(-6px);}
        
        /* Mobile responsive */
        @media (max-width:768px){
            .hamburger{display:flex !important;}
            .nav-menu{position:fixed;top:0;right:-100%;width:100%;height:100vh;background:linear-gradient(135deg,#6a4c93,#8e44ad);flex-direction:column;justify-content:center;align-items:center;gap:2rem;transition:right 0.3s ease;z-index:1000;}
            .nav-menu.active{right:0;}
            .nav-menu a{font-size:1.5rem;padding:1rem 2rem;border-radius:10px;width:200px;text-align:center;}
            .nav-menu a[href="account.html"]{display:none !important;}
            
            /* Better scaling for mobile */
            .container{max-width:95vw !important;padding:1rem !important;}
            .panel{max-width:100% !important;margin:0.5rem !important;}
            .btn{padding:0.6rem 1rem !important;font-size:0.9rem !important;}
            .modal-content{max-width:95vw !important;margin:1rem !important;}
            .chat-messages{max-height:50vh !important;}
            .auction-card{max-width:100% !important;}
            .product-grid{grid-template-columns:1fr !important;gap:1rem !important;}
        }
        
        /* Tablet responsive */
        @media (max-width:1024px) and (min-width:769px){
            .container{max-width:90vw !important;}
            .product-grid{grid-template-columns:repeat(2,1fr) !important;}
            .auctions-grid{grid-template-columns:repeat(2,1fr) !important;}
        }
        
        /* Hover effects for nav elements */
        .nav-search:hover{background:rgba(255,255,255,0.1);}
        .nav-profile:hover > div{background:rgba(255,255,255,0.1);}
        
        /* Custom Modal System */
        .custom-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:none;align-items:center;justify-content:center;}
        .custom-modal.show{display:flex;}
        .custom-modal-content{background:#fff;border-radius:15px;padding:2rem;max-width:500px;width:90%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.3);position:relative;}
        .custom-modal h2{color:#6a4c93;margin-bottom:1rem;font-size:1.8rem;}
        .custom-modal p{color:#666;margin-bottom:2rem;font-size:1.1rem;}
        .custom-modal-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
        .custom-modal-btn{padding:0.8rem 1.5rem;border:none;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.3s ease;}
        .custom-modal-btn-primary{background:#6a4c93;color:#fff;}
        .custom-modal-btn-primary:hover{background:#5a3d83;transform:translateY(-2px);}
        .custom-modal-btn-secondary{background:#6c757d;color:#fff;}
        .custom-modal-btn-secondary:hover{background:#5a6268;transform:translateY(-2px);}
        .custom-modal-btn-danger{background:#dc3545;color:#fff;}
        .custom-modal-btn-danger:hover{background:#c82333;transform:translateY(-2px);}
        .custom-modal-close{position:absolute;top:10px;right:15px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#999;}
        .custom-modal-close:hover{color:#333;}
    `;
    document.head.appendChild(style);
}

// Global Custom Modal System
function showCustomModal(title, message, options = {}) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal show';
    modal.id = 'customModal';
    
    const buttons = [];
    if (options.confirm) {
        buttons.push(`<button class="custom-modal-btn custom-modal-btn-primary" onclick="customModalConfirm()">${options.confirmText || 'Confirm'}</button>`);
    }
    if (options.cancel) {
        buttons.push(`<button class="custom-modal-btn custom-modal-btn-secondary" onclick="customModalCancel()">${options.cancelText || 'Cancel'}</button>`);
    }
    if (options.danger) {
        buttons.push(`<button class="custom-modal-btn custom-modal-btn-danger" onclick="customModalDanger()">${options.dangerText || 'Delete'}</button>`);
    }
    
    modal.innerHTML = `
        <div class="custom-modal-content">
            <button class="custom-modal-close" onclick="customModalCancel()">&times;</button>
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="custom-modal-buttons">
                ${buttons.join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store callbacks
    window.customModalCallbacks = {
        confirm: options.onConfirm,
        cancel: options.onCancel,
        danger: options.onDanger
    };
}

function customModalConfirm() {
    const modal = document.getElementById('customModal');
    if (modal) modal.remove();
    if (window.customModalCallbacks?.confirm) {
        window.customModalCallbacks.confirm();
    }
}

function customModalCancel() {
    const modal = document.getElementById('customModal');
    if (modal) modal.remove();
    if (window.customModalCallbacks?.cancel) {
        window.customModalCallbacks.cancel();
    }
}

function customModalDanger() {
    const modal = document.getElementById('customModal');
    if (modal) modal.remove();
    if (window.customModalCallbacks?.danger) {
        window.customModalCallbacks.danger();
    }
}

// Replace native alert/confirm with custom modals
window.alert = function(message) {
    showCustomModal('Notice', message, {
        confirm: true,
        confirmText: 'OK',
        onConfirm: () => {}
    });
};

window.confirm = function(message) {
    return new Promise((resolve) => {
        showCustomModal('Confirm', message, {
            confirm: true,
            cancel: true,
            confirmText: 'Yes',
            cancelText: 'No',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
        });
    });
};

// Custom search modal
function showCustomSearchModal() {
    const overlay = document.createElement('div');
    overlay.id = 'searchModal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
    
    overlay.innerHTML = `
        <div style="background:#fff;border-radius:15px;padding:2rem;max-width:600px;width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
            <div style="font-size:1.5rem;font-weight:800;color:#6a4c93;margin-bottom:1rem;text-align:center;">Search Card Force</div>
            <div style="margin-bottom:1rem;position:relative;">
                <input type="text" id="searchInput" placeholder="Search for cards, products, or pages..." style="width:100%;padding:1rem;border:2px solid #ddd;border-radius:10px;font-size:1rem;outline:none;" onkeyup="performLiveSearch()" onkeypress="if(event.key==='Enter') performSearch()">
                <div id="searchDropdown" style="position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #ddd;border-top:none;border-radius:0 0 10px 10px;max-height:200px;overflow-y:auto;z-index:1000;display:none;"></div>
            </div>
            <div style="display:flex;gap:1rem;justify-content:center;">
                <button onclick="performSearch()" style="background:#6a4c93;color:#fff;border:none;padding:0.75rem 2rem;border-radius:25px;font-weight:600;cursor:pointer;">Search</button>
                <button onclick="closeSearchModal()" style="background:#6c757d;color:#fff;border:none;padding:0.75rem 2rem;border-radius:25px;font-weight:600;cursor:pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Focus the input
    setTimeout(() => {
        document.getElementById('searchInput').focus();
    }, 100);
}

function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.remove();
    }
}

function performLiveSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const dropdown = document.getElementById('searchDropdown');
    
    if (!query) {
        dropdown.style.display = 'none';
        return;
    }
    
    // Search items
    const searchItems = [
        { name: 'Charizard Card', type: 'Trading Card', url: 'trading-cards.html#charizard' },
        { name: 'Mike Card', type: 'Trading Card', url: 'trading-cards.html#mike' },
        { name: 'Pig Princess Card', type: 'Trading Card', url: 'trading-cards.html#pig-princess' },
        { name: 'Blue Eyes White Dragon', type: 'Trading Card', url: 'trading-cards.html#blue-eyes' },
        { name: 'Black Lotus', type: 'Trading Card', url: 'trading-cards.html#black-lotus' },
        { name: 'Custom Cards', type: 'Page', url: 'custom-cards.html' },
        { name: 'Standard Editor', type: 'Editor', url: 'card-editor.html' },
        { name: 'TI Editor', type: 'Editor', url: 'ti-editor.html' },
        { name: 'Marketplace', type: 'Page', url: 'marketplace.html' },
        { name: 'Shop', type: 'Page', url: 'shop.html' },
        { name: 'Account', type: 'Page', url: 'account.html' },
        { name: 'Cart', type: 'Page', url: 'cart.html' },
        { name: 'Design Help', type: 'Service', url: 'design-help.html' },
        { name: 'Trading Cards', type: 'Page', url: 'trading-cards.html' }
    ];
    
    const results = searchItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.type.toLowerCase().includes(query)
    ).slice(0, 8);
    
    if (results.length > 0) {
        dropdown.innerHTML = results.map(item => `
            <div onclick="selectSearchItem('${item.url}')" style="padding:0.75rem;cursor:pointer;border-bottom:1px solid #eee;transition:background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='#fff'">
                <div style="font-weight:600;color:#333;">${item.name}</div>
                <div style="font-size:0.8rem;color:#666;">${item.type}</div>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

function selectSearchItem(url) {
    closeSearchModal();
    window.location.href = url;
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert('Please enter a search term!');
        return;
    }
    
    closeSearchModal();
    
    // Enhanced search logic
    const queryLower = query.toLowerCase();
    
    // Direct matches
    if (queryLower.includes('charizard')) {
        window.location.href = 'trading-cards.html#charizard';
    } else if (queryLower.includes('mike')) {
        window.location.href = 'trading-cards.html#mike';
    } else if (queryLower.includes('pig') || queryLower.includes('princess')) {
        window.location.href = 'trading-cards.html#pig-princess';
    } else if (queryLower.includes('blue eyes') || queryLower.includes('dragon')) {
        window.location.href = 'trading-cards.html#blue-eyes';
    } else if (queryLower.includes('black lotus')) {
        window.location.href = 'trading-cards.html#black-lotus';
    } else if (queryLower.includes('custom') || queryLower.includes('editor')) {
        window.location.href = 'custom-cards.html';
    } else if (queryLower.includes('marketplace') || queryLower.includes('auction')) {
        window.location.href = 'marketplace.html';
    } else if (queryLower.includes('shop') || queryLower.includes('buy')) {
        window.location.href = 'shop.html';
    } else if (queryLower.includes('account') || queryLower.includes('profile')) {
        window.location.href = 'account.html';
    } else if (queryLower.includes('cart') || queryLower.includes('checkout')) {
        window.location.href = 'cart.html';
    } else if (queryLower.includes('design') || queryLower.includes('help')) {
        window.location.href = 'design-help.html';
    } else {
        // Fallback to index with search parameter
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
}

function toggleProfileMenu() {
    let menu = document.getElementById('profileMenu');
    if (menu) { menu.remove(); return; }
    const container = document.createElement('div');
    container.id = 'profileMenu';
    container.style.cssText = 'position:absolute;top:48px;right:14px;background:#fff;border:1px solid #eee;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.15);z-index:2000;min-width:200px;overflow:hidden;';
    const signedIn = isSignedIn();
    const isAdminUser = isAdmin();
    const item = (label, onclick) => `<button style="display:block;width:100%;text-align:left;padding:10px 14px;background:#fff;border:none;border-bottom:1px solid #f3f3f3;cursor:pointer;">${label}</button>`;
    container.innerHTML = `
        ${signedIn ? item('Saved Designs', `window.location.href='saved-designs.html'`) : ''}
        ${item('Cart', `window.location.href='cart.html'`)}
        ${item('Custom Cards', `window.location.href='custom-cards.html'`)}
        ${item('Trading Cards', `window.location.href='trading-cards.html'`)}
        ${isAdminUser ? item('Admin Orders', `window.location.href='admin-orders.html'`) : ''}
        ${isAdminUser ? item('Admin Messages', `window.location.href='admin-messages.html'`) : ''}
        ${signedIn ? item('Sign Out', 'signOutGlobal()') : item('Sign In', `window.location.href='account.html'`)}
    `;
    document.body.appendChild(container);
    document.addEventListener('click', function handler(e){
        if (!container.contains(e.target)) { container.remove(); document.removeEventListener('click', handler); }
    });
}

function openSearchModal() {
    let modal = document.getElementById('globalSearchModal');
    if (modal) { modal.remove(); }
    modal = document.createElement('div');
    modal.id = 'globalSearchModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:flex-start;justify-content:center;padding-top:10vh;z-index:3000;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,0.2);width:90%;max-width:700px;overflow:hidden;">
            <div style="display:flex;align-items:center;padding:12px 14px;border-bottom:1px solid #eee;gap:10px;">
                <span>🔎</span>
                <input id="globalSearchInput" placeholder="Search products and pages..." style="flex:1;padding:10px;border:1px solid #eee;border-radius:8px;outline:none;" />
                <button onclick="document.getElementById('globalSearchModal').remove()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;">✖</button>
            </div>
            <div id="globalSearchResults" style="max-height:50vh;overflow:auto;padding:10px 14px"></div>
        </div>
    `;
    document.body.appendChild(modal);
    const input = document.getElementById('globalSearchInput');
    input.focus();
    input.addEventListener('input', () => renderSearchResults(input.value));
    renderSearchResults('');
}

function renderSearchResults(q) {
    q = (q || '').toLowerCase();
    const results = [];
    const pages = [
        { label: 'Home', href: 'index.html' },
        { label: 'Shop', href: 'shop.html' },
        { label: 'Trading Cards', href: 'trading-cards.html' },
        { label: 'Custom Cards', href: 'custom-cards.html' },
        { label: 'Saved Designs', href: 'saved-designs.html' },
        { label: 'Help', href: 'help.html' },
        { label: 'Admin Messages', href: 'admin-messages.html' }
    ];
    pages.forEach(p => { if (!q || p.label.toLowerCase().includes(q)) results.push({ type:'page', ...p }); });

    // Products from catalog and a couple of built-ins
    const catalog = getProductCatalog();
    const builtin = [
        { id:'pig-princess', name:'Pig-princess', description:'Royal pig with high defense' },
        { id:'mike', name:'Mike', description:'Stick figure warrior' }
    ];
    [...builtin, ...catalog].forEach(p => {
        const hay = `${p.name || ''} ${p.description || ''}`.toLowerCase();
        if (!q || hay.includes(q)) {
            results.push({ type:'product', id:p.id, name:p.name, href:`product.html?id=${encodeURIComponent(p.id)}` });
        }
    });

    const container = document.getElementById('globalSearchResults');
    if (!results.length) { container.innerHTML = '<div style="color:#666;">No results</div>'; return; }
    container.innerHTML = results.map(r => {
        if (r.type==='page') return `<a href="${r.href}" style="display:block;padding:10px;border-bottom:1px solid #f3f3f3;text-decoration:none;color:#333;">📄 ${r.label}</a>`;
        return `<a href="${r.href}" style="display:block;padding:10px;border-bottom:1px solid #f3f3f3;text-decoration:none;color:#333;">🃏 ${r.name} →</a>`;
    }).join('');
}

// -------- Messaging (Customer Support) --------
function getAllConversations() {
    return JSON.parse(localStorage.getItem('cf_messages_conversations') || '[]');
}

function saveAllConversations(list) {
    localStorage.setItem('cf_messages_conversations', JSON.stringify(list));
}

function getOrCreateConversationForUser(user) {
    if (!user) return null;
    const list = getAllConversations();
    let convo = list.find(c => c.userSub === user.sub);
    if (!convo) {
        convo = {
            id: 'convo_' + Date.now(),
            userSub: user.sub,
            userEmail: user.email || null,
            userName: user.name || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: []
        };
        list.unshift(convo);
        saveAllConversations(list);
    }
    return convo;
}

function appendMessage(convoId, message) {
    const list = getAllConversations();
    const idx = list.findIndex(c => c.id === convoId);
    if (idx === -1) return;
    message.id = message.id || ('msg_' + Date.now());
    message.createdAt = message.createdAt || new Date().toISOString();
    list[idx].messages.push(message);
    list[idx].updatedAt = message.createdAt;
    // Move to top
    const [c] = list.splice(idx,1);
    list.unshift(c);
    saveAllConversations(list);
}

function getConversation(convoId) {
    return getAllConversations().find(c => c.id === convoId) || null;
}

function listConversations() {
    return getAllConversations();
}

function getUserConversation() {
    const user = getCurrentUser();
    if (!user) return null;
    return getOrCreateConversationForUser(user);
}

function adminProceedRequest(convoId) {
    appendMessage(convoId, { from: 'admin', type: 'system', text: 'Proceeding with order. Please upload files.' });
}

// Firebase Integration Functions
function syncCartWithFirebase() {
    if (!window.firebaseService || !window.firebaseService.currentUser) return;
    
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return;
    
    const userData = JSON.parse(googleUser);
    const cartKey = `cart_${userData.sub}`;
    const cartItems = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    // Save cart to Firebase
    firebaseService.saveCartToFirebase(userData.sub, cartItems);
}

function loadCartFromFirebase() {
    if (!window.firebaseService || !window.firebaseService.currentUser) return;
    
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return;
    
    const userData = JSON.parse(googleUser);
    const cartKey = `cart_${userData.sub}`;
    
    // Load cart from Firebase
    firebaseService.loadCartFromFirebase(userData.sub).then(firebaseCart => {
        if (firebaseCart.length > 0) {
            localStorage.setItem(cartKey, JSON.stringify(firebaseCart));
            // Trigger cart update if on cart page
            if (typeof loadCartItems === 'function') {
                loadCartItems();
            }
        }
    });
}

function syncAddressesWithFirebase() {
    if (!window.firebaseService || !window.firebaseService.currentUser) return;
    
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return;
    
    const userData = JSON.parse(googleUser);
    const addressesKey = `addresses_${userData.sub}`;
    const addresses = JSON.parse(localStorage.getItem(addressesKey) || '[]');
    
    // Save each address to Firebase
    addresses.forEach(address => {
        firebaseService.saveAddressToFirebase(userData.sub, address);
    });
}

function loadAddressesFromFirebase() {
    if (!window.firebaseService || !window.firebaseService.currentUser) return;
    
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return;
    
    const userData = JSON.parse(googleUser);
    const addressesKey = `addresses_${userData.sub}`;
    
    // Load addresses from Firebase
    firebaseService.loadAddressesFromFirebase(userData.sub).then(firebaseAddresses => {
        if (firebaseAddresses.length > 0) {
            localStorage.setItem(addressesKey, JSON.stringify(firebaseAddresses));
            // Trigger address update if on account page
            if (typeof loadAddresses === 'function') {
                loadAddresses();
            }
        }
    });
}

function syncSavedDesignsWithFirebase() {
    if (!window.firebaseService || !window.firebaseService.currentUser) return;
    
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return;
    
    const userData = JSON.parse(googleUser);
    const designsKey = `savedDesigns_${userData.sub}`;
    const savedDesigns = JSON.parse(localStorage.getItem(designsKey) || '[]');
    
    // Save saved designs to Firebase
    if (savedDesigns.length > 0) {
        const userRef = doc(db, COLLECTIONS.USERS, userData.sub);
        updateDoc(userRef, {
            savedDesigns: savedDesigns,
            lastDesignSync: new Date().toISOString()
        });
    }
}

function loadSavedDesignsFromFirebase() {
    if (!window.firebaseService || !window.firebaseService.currentUser) return;
    
    const googleUser = localStorage.getItem('googleUser');
    if (!googleUser) return;
    
    const userData = JSON.parse(googleUser);
    const designsKey = `savedDesigns_${userData.sub}`;
    
    // Load saved designs from Firebase
    const userRef = doc(db, COLLECTIONS.USERS, userData.sub);
    getDoc(userRef).then(userSnap => {
        if (userSnap.exists() && userSnap.data().savedDesigns) {
            localStorage.setItem(designsKey, JSON.stringify(userSnap.data().savedDesigns));
            // Trigger designs update if on account page
            if (typeof loadSavedDesigns === 'function') {
                loadSavedDesigns();
            }
        }
    });
}
