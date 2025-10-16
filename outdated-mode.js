// Outdated Mode Script - Apply 2015 styling and slow loading to all pages
(function() {
    'use strict';
    
    if (sessionStorage.getItem('outdatedMode') === 'true') {
        console.log('Applying outdated mode styling...');
        
        // Add 2015-style outdated styling
        const outdatedStyle = document.createElement('style');
        outdatedStyle.innerHTML = 
            '* { animation: none !important; transition: none !important; border-radius: 0 !important; }' +
            'button:hover, a:hover { transition: none !important; transform: none !important; }' +
            '.card:hover { transition: none !important; transform: none !important; box-shadow: none !important; }' +
            'body { font-family: "Helvetica Neue", Arial, sans-serif !important; background: #f5f5f5 !important; }' +
            '.hero { border-radius: 0 !important; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; }' +
            'button { border-radius: 0 !important; box-shadow: none !important; background: #4CAF50 !important; color: white !important; border: 2px solid #45a049 !important; }' +
            'input, textarea, select { border-radius: 0 !important; border: 2px solid #ddd !important; }' +
            '.card, .product-card, img { border-radius: 0 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; }' +
            'h1, h2, h3 { color: #333 !important; font-weight: 300 !important; }' +
            '.navbar { background: #2c3e50 !important; }' +
            '.navbar a { color: #ecf0f1 !important; }' +
            'footer { background: #34495e !important; color: #bdc3c7 !important; }';
        document.head.appendChild(outdatedStyle);
        
        // Add banner when DOM is ready
        if (document.body) {
            addOutdatedBanner();
            replaceHero();
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                addOutdatedBanner();
                replaceHero();
            });
        }
        
        function addOutdatedBanner() {
            const banner = document.createElement('div');
            banner.style.cssText = 
                'position: fixed; top: 0; left: 0; right: 0; background: #f39c12; color: white; ' +
                'padding: 0.75rem; text-align: center; z-index: 9999; font-weight: 600; ' +
                'box-shadow: none; border-bottom: 2px solid #e67e22;';
            banner.innerHTML = '⚠️ You are viewing an outdated version - ' +
                '<a href="https://card-force-472100.firebaseapp.com/index.html" style="color: white; text-decoration: underline; font-weight: bold;">Click here for the latest version</a>';
            document.body.style.paddingTop = '50px';
            document.body.insertBefore(banner, document.body.firstChild);
        }
        
        function replaceHero() {
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.innerHTML = 
                    '<div style="background: #fff3cd; border: 3px solid #856404; padding: 40px; text-align: center; min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center;">' +
                    '<h1 style="color: #856404; font-size: 48px; font-weight: bold; margin: 0 0 20px 0; font-family: Arial, sans-serif;">⚠️ OUTDATED SITE! ⚠️</h1>' +
                    '<p style="color: #856404; font-size: 18px; margin-bottom: 30px; font-family: Arial, sans-serif;">This version is no longer maintained. Please visit the new site.</p>' +
                    '<button onclick="window.location.href=\'https://card-force-472100.firebaseapp.com/index.html\'" style="background: #856404; color: white; border: none; padding: 15px 40px; font-size: 18px; font-weight: bold; cursor: pointer; font-family: Arial, sans-serif;">Go to New Site</button>' +
                    '</div>';
            }
        }
        
        // Add slow loading screen on all link clicks
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a, button[onclick*="location"]');
            if (target && target.href && !target.href.includes('#') && !target.href.includes('javascript:')) {
                e.preventDefault();
                
                // Create loading overlay
                const loadingOverlay = document.createElement('div');
                loadingOverlay.style.cssText = 
                    'position: fixed; top: 0; left: 0; width: 100%; height: 100%; ' +
                    'background: white; z-index: 999999; display: flex; flex-direction: column; ' +
                    'align-items: center; justify-content: center;';
                
                loadingOverlay.innerHTML = 
                    '<div style="text-align: center;">' +
                    '<div style="display: flex; gap: 15px; margin-bottom: 30px; justify-content: center;">' +
                    '<div class="beep-square" style="width: 30px; height: 30px; background: #333;"></div>' +
                    '<div class="beep-square" style="width: 30px; height: 30px; background: #333;"></div>' +
                    '<div class="beep-square" style="width: 30px; height: 30px; background: #333;"></div>' +
                    '</div>' +
                    '<p style="color: #333; font-size: 16px; font-family: Arial, sans-serif; font-weight: normal;">One moment, please...</p>' +
                    '</div>';
                
                document.body.appendChild(loadingOverlay);
                
                // Animate the squares to blink
                const squares = loadingOverlay.querySelectorAll('.beep-square');
                let currentSquare = 0;
                const blinkInterval = setInterval(function() {
                    squares.forEach(function(sq) { sq.style.background = '#333'; });
                    squares[currentSquare].style.background = '#6a4c93';
                    currentSquare = (currentSquare + 1) % 3;
                }, 400);
                
                // Navigate after delay
                setTimeout(function() {
                    clearInterval(blinkInterval);
                    window.location.href = target.href;
                }, 2000);
            }
        }, true);
    }
})();

