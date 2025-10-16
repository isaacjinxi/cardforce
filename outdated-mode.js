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
            'body { font-family: "Helvetica Neue", Arial, sans-serif !important; background: #f8f9fa !important; font-weight: 300 !important; }' +
            '.hero { border-radius: 0 !important; background: linear-gradient(135deg, #6a4c93 0%, #8e44ad 100%) !important; }' +
            'button { border-radius: 0 !important; box-shadow: none !important; background: #6a4c93 !important; color: white !important; border: 2px solid #5a3d7a !important; font-weight: 300 !important; }' +
            'input, textarea, select { border-radius: 0 !important; border: 2px solid #ddd !important; font-weight: 300 !important; }' +
            '.card, .product-card, img { border-radius: 0 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; }' +
            'h1, h2, h3 { color: #6a4c93 !important; font-weight: 200 !important; }' +
            'h4, h5, h6 { color: #333 !important; font-weight: 300 !important; }' +
            'p, span, div { font-weight: 300 !important; }' +
            '.navbar { background: #6a4c93 !important; }' +
            '.navbar a { color: white !important; font-weight: 300 !important; }' +
            'footer { background: #5a3d7a !important; color: #e8d5f2 !important; }' +
            '.btn { background: #6a4c93 !important; color: white !important; border: 2px solid #5a3d7a !important; font-weight: 300 !important; }' +
            '.btn:hover { background: #5a3d7a !important; }' +
            '.card-title { color: #6a4c93 !important; font-weight: 300 !important; }' +
            '.card-description { color: #666 !important; font-weight: 300 !important; }' +
            '.price { color: #6a4c93 !important; font-weight: 400 !important; }';
        document.head.appendChild(outdatedStyle);
        
        // Add banner when DOM is ready
        if (document.body) {
            addOutdatedBanner();
            replaceHero();
            hideChatbot();
            styleShopAndAccount();
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                addOutdatedBanner();
                replaceHero();
                hideChatbot();
                styleShopAndAccount();
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
                    '<div style="background: linear-gradient(135deg, #6a4c93 0%, #8e44ad 100%); padding: 60px 40px; text-align: center; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;">' +
                    '<h1 style="color: white; font-size: 42px; font-weight: 200; margin: 0 0 15px 0; font-family: \'Helvetica Neue\', Arial, sans-serif; letter-spacing: 1px;">Welcome to Cards Force</h1>' +
                    '<p style="color: #e8d5f2; font-size: 20px; margin-bottom: 40px; font-family: \'Helvetica Neue\', Arial, sans-serif; font-weight: 300;">How can we help you?</p>' +
                    '<div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">' +
                    '<button onclick="window.location.href=\'trading-cards.html\'" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 12px 30px; font-size: 16px; font-weight: 300; cursor: pointer; font-family: \'Helvetica Neue\', Arial, sans-serif; transition: all 0.3s ease;">Browse Cards</button>' +
                    '<button onclick="window.location.href=\'custom-cards.html\'" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 12px 30px; font-size: 16px; font-weight: 300; cursor: pointer; font-family: \'Helvetica Neue\', Arial, sans-serif; transition: all 0.3s ease;">Custom Cards</button>' +
                    '<button onclick="window.location.href=\'account.html\'" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 12px 30px; font-size: 16px; font-weight: 300; cursor: pointer; font-family: \'Helvetica Neue\', Arial, sans-serif; transition: all 0.3s ease;">My Account</button>' +
                    '</div>' +
                    '</div>';
            }
        }
        
        function hideChatbot() {
            // Remove AI chatbot elements
            const chatbotSelectors = [
                '[id*="chatbot"]',
                '[class*="chatbot"]',
                '[id*="chat"]',
                '[class*="chat"]',
                'iframe[src*="chat"]',
                'iframe[src*="bot"]',
                '.chat-widget',
                '.ai-chat',
                '#chat-container',
                '.chat-container'
            ];
            
            chatbotSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.display = 'none !important';
                    el.remove();
                });
            });
            
            // Also remove any script tags that might load chatbots
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src && (script.src.includes('chat') || script.src.includes('bot'))) {
                    script.remove();
                }
            });
        }
        
        function styleShopAndAccount() {
            // Add specific 2015 styling for shop and account pages
            const pageSpecificStyle = document.createElement('style');
            pageSpecificStyle.innerHTML = 
                '.shop-container, .account-container { background: #f8f9fa !important; padding: 20px !important; }' +
                '.product-grid { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important; gap: 20px !important; }' +
                '.product-item { background: white !important; border: 1px solid #e0e0e0 !important; padding: 15px !important; text-align: center !important; }' +
                '.product-item h3 { color: #6a4c93 !important; font-weight: 300 !important; margin: 10px 0 !important; }' +
                '.product-item p { color: #666 !important; font-weight: 300 !important; font-size: 14px !important; }' +
                '.account-section { background: white !important; border: 1px solid #e0e0e0 !important; margin: 20px 0 !important; padding: 20px !important; }' +
                '.account-section h2 { color: #6a4c93 !important; font-weight: 300 !important; border-bottom: 2px solid #6a4c93 !important; padding-bottom: 10px !important; }' +
                '.form-group { margin: 15px 0 !important; }' +
                '.form-group label { color: #6a4c93 !important; font-weight: 300 !important; display: block !important; margin-bottom: 5px !important; }' +
                '.form-group input, .form-group select, .form-group textarea { width: 100% !important; padding: 10px !important; border: 2px solid #ddd !important; font-weight: 300 !important; }' +
                '.profile-picture { border: 3px solid #6a4c93 !important; border-radius: 50% !important; }' +
                '.user-info { background: #f8f9fa !important; padding: 20px !important; border-left: 4px solid #6a4c93 !important; }';
            document.head.appendChild(pageSpecificStyle);
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

