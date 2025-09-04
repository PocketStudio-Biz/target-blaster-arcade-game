/* ===== TARGET BLASTER - ADVERTISEMENT MANAGER ===== */

class AdManager {
    constructor() {
        this.isAdSenseLoaded = false;
        this.adSettings = {
            publisherId: 'ca-pub-XXXXXXXXXX', // Replace with your AdSense publisher ID
            interstitialSlot: 'XXXXXXXXXX',   // Replace with your interstitial ad slot
            bannerSlots: {
                top: 'XXXXXXXXXX',            // Replace with top banner slot
                sidebar: 'XXXXXXXXXX'         // Replace with sidebar banner slot
            },
            rewardedVideoSlot: 'XXXXXXXXXX'   // Replace with rewarded video slot
        };
        
        // Ad state tracking
        this.lastInterstitialTime = 0;
        this.interstitialCooldown = 60000; // 1 minute between interstitials
        this.rewardedVideoCallback = null;
        this.isRewardedVideoPlaying = false;
        
        // Ad block detection
        this.adBlockDetected = false;
        
        this.init();
    }
    
    init() {
        this.detectAdBlock();
        this.initializeAdSense();
        this.setupEventListeners();
    }
    
    detectAdBlock() {
        // Create a test ad element to detect ad blockers
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.cssText = 'position:absolute!important;top:-1px!important;left:-1px!important;width:1px!important;height:1px!important;';
        
        document.body.appendChild(testAd);
        
        // Check if the element is hidden (indicating ad block)
        setTimeout(() => {
            const rect = testAd.getBoundingClientRect();
            this.adBlockDetected = rect.height === 0;
            
            if (this.adBlockDetected) {
                this.handleAdBlockDetected();
            }
            
            document.body.removeChild(testAd);
        }, 100);
    }
    
    handleAdBlockDetected() {
        console.warn('Ad blocker detected');
        
        // Update placeholders to show ad block message
        document.querySelectorAll('.ad-banner').forEach(banner => {
            banner.classList.add('ad-blocked');
        });
        
        // Show fallback content
        this.showFallbackContent();
    }
    
    showFallbackContent() {
        // Replace ads with fallback content when ad block is detected
        const fallbackAds = [
            {
                title: 'Support Target Blaster',
                message: 'Please disable your ad blocker to support the game!',
                action: 'Disable Ad Blocker'
            },
            {
                title: 'Enjoying the Game?',
                message: 'Share Target Blaster with your friends!',
                action: 'Share Game'
            }
        ];
        
        document.querySelectorAll('.ad-placeholder').forEach((placeholder, index) => {
            const fallback = fallbackAds[index % fallbackAds.length];
            placeholder.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <h4 style="color: #ffff00; margin: 5px 0;">${fallback.title}</h4>
                    <p style="margin: 5px 0; font-size: 0.75rem;">${fallback.message}</p>
                    <button onclick="window.adManager.handleFallbackAction('${fallback.action}')" 
                            style="background: transparent; border: 1px solid #ffff00; color: #ffff00; padding: 5px 10px; cursor: pointer;">
                        ${fallback.action}
                    </button>
                </div>
            `;
        });
    }
    
    handleFallbackAction(action) {
        switch (action) {
            case 'Disable Ad Blocker':
                alert('Please disable your ad blocker and refresh the page to support Target Blaster!');
                break;
            case 'Share Game':
                this.shareGame();
                break;
        }
    }
    
    shareGame() {
        if (navigator.share) {
            navigator.share({
                title: 'Target Blaster - Arcade Shooting Game',
                text: 'Check out this awesome arcade shooting game!',
                url: window.location.href
            }).catch(() => {
                this.fallbackShare();
            });
        } else {
            this.fallbackShare();
        }
    }
    
    fallbackShare() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out Target Blaster - awesome arcade shooting game!');
        const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
    
    initializeAdSense() {
        if (this.adBlockDetected) return;
        
        // Check if AdSense script is loaded
        if (typeof adsbygoogle !== 'undefined') {
            this.isAdSenseLoaded = true;
            this.loadBannerAds();
        } else {
            // Wait for AdSense to load
            let attempts = 0;
            const checkAdSense = setInterval(() => {
                attempts++;
                if (typeof adsbygoogle !== 'undefined') {
                    this.isAdSenseLoaded = true;
                    this.loadBannerAds();
                    clearInterval(checkAdSense);
                } else if (attempts > 10) {
                    console.warn('AdSense failed to load');
                    this.handleAdLoadError();
                    clearInterval(checkAdSense);
                }
            }, 1000);
        }
    }
    
    loadBannerAds() {
        if (!this.isAdSenseLoaded) return;
        
        // Load top banner ad
        this.loadBannerAd('top-banner-ad', this.adSettings.bannerSlots.top);
        
        // Load sidebar banner ad (desktop only)
        if (window.innerWidth > 1024) {
            this.loadBannerAd('sidebar-ad', this.adSettings.bannerSlots.sidebar);
        }
    }
    
    loadBannerAd(containerId, slotId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        try {
            container.classList.add('ad-loading');
            
            // Configure and push ad
            const adElement = container.querySelector('.adsbygoogle');
            if (adElement) {
                adElement.setAttribute('data-ad-slot', slotId);
                adsbygoogle.push({});
                
                // Set loading timeout
                setTimeout(() => {
                    container.classList.remove('ad-loading');
                    
                    // Check if ad loaded successfully
                    if (adElement.innerHTML.trim() === '') {
                        this.handleAdLoadError(containerId);
                    } else {
                        container.classList.add('ad-loaded');
                        this.hideAdPlaceholder(containerId);
                    }
                }, 3000);
            }
        } catch (error) {
            console.warn('Error loading banner ad:', error);
            this.handleAdLoadError(containerId);
        }
    }
    
    hideAdPlaceholder(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const placeholder = container.querySelector('.ad-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        }
    }
    
    handleAdLoadError(containerId = null) {
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.classList.add('ad-error');
                container.classList.remove('ad-loading');
            }
        }
        
        // Show fallback content for failed ads
        this.showFallbackContent();
    }
    
    showInterstitial() {
        const now = Date.now();
        
        // Check cooldown period
        if (now - this.lastInterstitialTime < this.interstitialCooldown) {
            return;
        }
        
        this.lastInterstitialTime = now;
        
        if (this.adBlockDetected || !this.isAdSenseLoaded) {
            this.showFallbackInterstitial();
            return;
        }
        
        // Show real interstitial ad
        this.displayInterstitialAd();
    }
    
    displayInterstitialAd() {
        const interstitialOverlay = document.getElementById('interstitial-ad');
        if (!interstitialOverlay) return;
        
        try {
            interstitialOverlay.classList.remove('hidden');
            
            // Configure interstitial ad
            const adElement = interstitialOverlay.querySelector('.adsbygoogle');
            if (adElement) {
                adElement.setAttribute('data-ad-slot', this.adSettings.interstitialSlot);
                adsbygoogle.push({});
                
                // Auto-close after timeout if ad doesn't load
                setTimeout(() => {
                    if (adElement.innerHTML.trim() === '') {
                        this.closeInterstitial();
                    }
                }, 5000);
            }
        } catch (error) {
            console.warn('Error loading interstitial ad:', error);
            this.closeInterstitial();
        }
    }
    
    showFallbackInterstitial() {
        const interstitialOverlay = document.getElementById('interstitial-ad');
        if (!interstitialOverlay) return;
        
        // Show placeholder interstitial
        const placeholder = interstitialOverlay.querySelector('.ad-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="color: #00ffff; margin-bottom: 15px;">Thanks for Playing!</h3>
                    <p style="margin-bottom: 15px;">Share Target Blaster with friends to support the game!</p>
                    <button onclick="window.adManager.shareGame()" 
                            style="background: linear-gradient(135deg, #00ffff, #0080ff); color: #000; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold;">
                        Share Game
                    </button>
                </div>
            `;
        }
        
        interstitialOverlay.classList.remove('hidden');
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            this.closeInterstitial();
        }, 3000);
    }
    
    closeInterstitial() {
        const interstitialOverlay = document.getElementById('interstitial-ad');
        if (interstitialOverlay) {
            interstitialOverlay.classList.add('hidden');
        }
    }
    
    showRewardedVideo(callback) {
        this.rewardedVideoCallback = callback;
        
        if (this.adBlockDetected || !this.isAdSenseLoaded) {
            this.showFallbackRewardedVideo();
            return;
        }
        
        // Show real rewarded video ad
        this.displayRewardedVideoAd();
    }
    
    displayRewardedVideoAd() {
        const rewardedOverlay = document.getElementById('rewarded-ad');
        if (!rewardedOverlay) return;
        
        rewardedOverlay.classList.remove('hidden');
        this.isRewardedVideoPlaying = true;
        
        // Simulate video ad (replace with actual ad network integration)
        this.simulateRewardedVideo();
    }
    
    simulateRewardedVideo() {
        const progressBar = document.querySelector('.progress-bar::before');
        const progressText = document.querySelector('.progress-text');
        
        let timeLeft = 30; // 30 second video
        const interval = setInterval(() => {
            timeLeft--;
            
            if (progressText) {
                progressText.textContent = `0:${(30 - timeLeft).toString().padStart(2, '0')} / 0:30`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                this.completeRewardedVideo();
            }
        }, 1000);
        
        // Allow skipping after 5 seconds
        setTimeout(() => {
            const skipButton = document.getElementById('skip-reward');
            if (skipButton) {
                skipButton.textContent = 'Skip (✓)';
                skipButton.onclick = () => this.skipRewardedVideo();
            }
        }, 5000);
    }
    
    showFallbackRewardedVideo() {
        const rewardedOverlay = document.getElementById('rewarded-ad');
        if (!rewardedOverlay) return;
        
        // Show placeholder rewarded video
        const videoPlaceholder = rewardedOverlay.querySelector('.video-placeholder');
        if (videoPlaceholder) {
            videoPlaceholder.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <h3 style="color: #ff00ff; margin-bottom: 15px;">Free Extra Life!</h3>
                    <p style="margin-bottom: 20px;">Thanks for playing Target Blaster!</p>
                    <button onclick="window.adManager.completeRewardedVideo()" 
                            style="background: linear-gradient(135deg, #ff00ff, #ff0080); color: #fff; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold;">
                        Claim Reward
                    </button>
                </div>
            `;
        }
        
        rewardedOverlay.classList.remove('hidden');
        this.isRewardedVideoPlaying = true;
    }
    
    completeRewardedVideo() {
        this.closeRewardedVideo();
        
        if (this.rewardedVideoCallback) {
            this.rewardedVideoCallback();
            this.rewardedVideoCallback = null;
        }
        
        // Play reward sound
        if (window.audioManager) {
            window.audioManager.playSound('powerup');
        }
    }
    
    skipRewardedVideo() {
        this.closeRewardedVideo();
        // No reward for skipping
        this.rewardedVideoCallback = null;
    }
    
    closeRewardedVideo() {
        const rewardedOverlay = document.getElementById('rewarded-ad');
        if (rewardedOverlay) {
            rewardedOverlay.classList.add('hidden');
        }
        
        this.isRewardedVideoPlaying = false;
        this.rewardedVideoCallback = null;
    }
    
    setupEventListeners() {
        // Close interstitial button
        const closeInterstitial = document.getElementById('close-interstitial');
        if (closeInterstitial) {
            closeInterstitial.addEventListener('click', () => this.closeInterstitial());
        }
        
        // Skip rewarded video button
        const skipReward = document.getElementById('skip-reward');
        if (skipReward) {
            skipReward.addEventListener('click', () => this.skipRewardedVideo());
        }
        
        // Handle window resize for responsive ads
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle visibility change (pause video ads when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (this.isRewardedVideoPlaying && document.hidden) {
                // Pause video ad logic here
            }
        });
    }
    
    handleResize() {
        // Hide sidebar ad on mobile
        const sidebarAd = document.getElementById('sidebar-ad');
        if (sidebarAd) {
            if (window.innerWidth <= 1024) {
                sidebarAd.style.display = 'none';
            } else {
                sidebarAd.style.display = 'flex';
            }
        }
        
        // Adjust ad sizes for responsive design
        this.adjustAdSizes();
    }
    
    adjustAdSizes() {
        if (!this.isAdSenseLoaded) return;
        
        // Responsive ad sizing logic
        const topBanner = document.getElementById('top-banner-ad');
        if (topBanner && window.innerWidth < 768) {
            topBanner.style.height = '60px';
        }
    }
    
    // Analytics and tracking
    trackAdEvent(eventType, adType, details = {}) {
        // Track ad events for optimization
        console.log(`Ad Event: ${eventType}`, { adType, ...details });
        
        // Integrate with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, {
                event_category: 'Advertising',
                event_label: adType,
                custom_parameter_1: details.revenue || 0
            });
        }
    }
    
    // Revenue optimization
    getOptimalAdTiming() {
        // Return optimal timing for interstitial ads based on game state
        return {
            showAfterGameOver: true,
            showAfterLevel: false,
            showOnMenuReturn: true,
            minInterval: this.interstitialCooldown
        };
    }
    
    // Cleanup
    destroy() {
        this.closeInterstitial();
        this.closeRewardedVideo();
        this.rewardedVideoCallback = null;
        
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize);
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        if (!window.adManager) {
            window.adManager = new AdManager();
        }
    }, 100);
});