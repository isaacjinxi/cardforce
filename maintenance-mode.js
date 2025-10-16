// Maintenance Mode System
(function() {
    'use strict';
    
    // Check if maintenance mode is enabled
    const maintenanceEnabled = localStorage.getItem('maintenanceMode') === 'true';
    const adminUnlocked = sessionStorage.getItem('adminUnlocked') === 'true';
    
    if (maintenanceEnabled && !adminUnlocked) {
        // Show maintenance screen
        showMaintenanceScreen();
    }
    
    function showMaintenanceScreen() {
        // Create maintenance overlay
        const overlay = document.createElement('div');
        overlay.id = 'maintenanceOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ffd700;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; max-width: 600px; padding: 40px;">
                <div style="font-size: 120px; margin-bottom: 30px;">🃏</div>
                <h1 style="color: #333; font-size: 48px; margin: 0 0 20px 0; font-weight: bold;">Maintenance Mode</h1>
                <p style="color: #555; font-size: 24px; margin: 0;">Service Unavailable</p>
                <p style="color: #666; font-size: 16px; margin-top: 30px;">We're currently performing maintenance. Please check back soon!</p>
            </div>
            <button id="adminUnlockBtn" style="
                position: fixed;
                bottom: 10px;
                right: 10px;
                width: 20px;
                height: 20px;
                background: transparent;
                border: none;
                cursor: pointer;
                opacity: 0.01;
            "></button>
        `;
        
        // Add to page immediately
        if (document.body) {
            document.body.innerHTML = '';
            document.body.appendChild(overlay);
            setupAdminUnlock();
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                document.body.innerHTML = '';
                document.body.appendChild(overlay);
                setupAdminUnlock();
            });
        }
    }
    
    function setupAdminUnlock() {
        const unlockBtn = document.getElementById('adminUnlockBtn');
        if (!unlockBtn) return;
        
        unlockBtn.addEventListener('click', async function() {
            console.log('Admin unlock requested...');
            
            // Wait for Firebase to load if not available yet
            let retries = 0;
            while ((!window.auth || !window.GoogleAuthProvider) && retries < 10) {
                console.log('Waiting for Firebase to load...');
                await new Promise(resolve => setTimeout(resolve, 500));
                retries++;
            }
            
            // Check if Firebase is available
            if (!window.auth || !window.GoogleAuthProvider) {
                alert('Firebase authentication not available. Please refresh the page and try again.');
                return;
            }
            
            try {
                const provider = new window.GoogleAuthProvider();
                
                // Import signInWithPopup if not available
                let signInWithPopup = window.signInWithPopup;
                if (!signInWithPopup && window.firebaseAuth) {
                    signInWithPopup = window.firebaseAuth.signInWithPopup;
                }
                
                if (!signInWithPopup) {
                    alert('Sign-in function not available. Please refresh and try again.');
                    return;
                }
                
                const result = await signInWithPopup(window.auth, provider);
                const user = result.user;
                
                console.log('User signed in:', user.email);
                
                // Check if user is admin
                const adminEmails = [
                    'cardforcehelp@gmail.com',
                    'imsongbo@gmail.com',
                    'isaacjinxi@gmail.com'
                ];
                
                if (adminEmails.includes(user.email)) {
                    console.log('✅ Admin verified!');
                    sessionStorage.setItem('adminUnlocked', 'true');
                    alert('Welcome back, admin! Reloading site...');
                    window.location.reload();
                } else {
                    console.log('❌ Not an admin account');
                    alert('Sorry, you are not authorized to access the site during maintenance.');
                    if (window.auth.signOut) {
                        await window.auth.signOut();
                    }
                }
            } catch (error) {
                console.error('Authentication error:', error);
                if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                    alert('Authentication failed: ' + (error.message || 'Unknown error'));
                }
            }
        });
    }
})();

// Global function to enable/disable maintenance mode (for admin console)
window.setMaintenanceMode = function(enabled) {
    localStorage.setItem('maintenanceMode', enabled ? 'true' : 'false');
    if (enabled) {
        sessionStorage.removeItem('adminUnlocked');
    }
    console.log('Maintenance mode:', enabled ? 'ENABLED' : 'DISABLED');
    alert('Maintenance mode ' + (enabled ? 'enabled' : 'disabled') + '. Page will reload.');
    window.location.reload();
};

