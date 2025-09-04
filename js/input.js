/* ===== TARGET BLASTER - INPUT MANAGER ===== */

class InputManager {
    constructor() {
        this.canvas = null;
        this.onShoot = null; // Callback function for shooting
        
        // Input state
        this.isPointerDown = false;
        this.lastPointerX = 0;
        this.lastPointerY = 0;
        
        // Rapid fire handling
        this.rapidFireInterval = null;
        this.rapidFireDelay = 100; // milliseconds between rapid fire shots
        
        // Touch/mouse debouncing
        this.lastInputTime = 0;
        this.inputDebounce = 50; // milliseconds
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        this.setupEventListeners();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }
    
    setCanvas(canvas) {
        this.canvas = canvas;
        this.setupCanvasEvents();
    }
    
    setupEventListeners() {
        // Prevent default touch behaviors
        document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent default drag behaviors
        document.addEventListener('dragstart', (e) => e.preventDefault());
        document.addEventListener('selectstart', (e) => e.preventDefault());
    }
    
    setupCanvasEvents() {
        if (!this.canvas) return;
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerStart(e));
        this.canvas.addEventListener('mouseup', (e) => this.handlePointerEnd(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handlePointerEnd(e));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handlePointerStart(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handlePointerEnd(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handlePointerMove(e), { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => this.handlePointerEnd(e), { passive: false });
        
        // Prevent default behaviors
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handlePointerStart(event) {
        event.preventDefault();
        
        const coords = this.getEventCoordinates(event);
        if (!coords) return;
        
        this.isPointerDown = true;
        this.lastPointerX = coords.x;
        this.lastPointerY = coords.y;
        
        // Initial shot
        this.shoot(coords.x, coords.y);
        
        // Start rapid fire if power-up is active
        if (this.isRapidFireActive()) {
            this.startRapidFire();
        }
    }
    
    handlePointerEnd(event) {
        event.preventDefault();
        
        this.isPointerDown = false;
        this.stopRapidFire();
    }
    
    handlePointerMove(event) {
        event.preventDefault();
        
        if (!this.isPointerDown) return;
        
        const coords = this.getEventCoordinates(event);
        if (!coords) return;
        
        this.lastPointerX = coords.x;
        this.lastPointerY = coords.y;
        
        // For mobile, allow continuous shooting while dragging
        if (this.isMobile && !this.isRapidFireActive()) {
            const now = Date.now();
            if (now - this.lastInputTime > this.inputDebounce) {
                this.shoot(coords.x, coords.y);
                this.lastInputTime = now;
            }
        }
    }
    
    getEventCoordinates(event) {
        if (!this.canvas) return null;
        
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
            // Touch event
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            // Touch end event
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        } else {
            // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        // Calculate coordinates relative to canvas
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        
        return { x, y };
    }
    
    shoot(x, y) {
        const now = Date.now();
        
        // Debounce inputs to prevent excessive shooting
        if (now - this.lastInputTime < this.inputDebounce && !this.isRapidFireActive()) {
            return;
        }
        
        this.lastInputTime = now;
        
        if (this.onShoot) {
            this.onShoot(x, y);
        }
        
        // Visual feedback for touch
        if (this.isMobile) {
            this.createTouchFeedback(x, y);
        }
    }
    
    startRapidFire() {
        if (this.rapidFireInterval) return;
        
        this.rapidFireInterval = setInterval(() => {
            if (this.isPointerDown && this.isRapidFireActive()) {
                this.shoot(this.lastPointerX, this.lastPointerY);
            } else {
                this.stopRapidFire();
            }
        }, this.rapidFireDelay);
    }
    
    stopRapidFire() {
        if (this.rapidFireInterval) {
            clearInterval(this.rapidFireInterval);
            this.rapidFireInterval = null;
        }
    }
    
    isRapidFireActive() {
        // Check if rapid fire power-up is active
        return window.game && 
               window.game.powerupStates && 
               window.game.powerupStates.rapidFire &&
               window.game.powerupStates.rapidFire.active;
    }
    
    createTouchFeedback(x, y) {
        // Create a visual feedback element for touch input
        const feedback = document.createElement('div');
        feedback.className = 'touch-feedback';
        feedback.style.cssText = `
            position: absolute;
            left: ${x - 10}px;
            top: ${y - 10}px;
            width: 20px;
            height: 20px;
            border: 2px solid #00ffff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: touch-ripple 0.3s ease-out forwards;
        `;
        
        // Add CSS for animation if not already present
        if (!document.getElementById('touch-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'touch-feedback-styles';
            style.textContent = `
                @keyframes touch-ripple {
                    0% {
                        transform: scale(0.5);
                        opacity: 1;
                        box-shadow: 0 0 10px #00ffff;
                    }
                    100% {
                        transform: scale(2);
                        opacity: 0;
                        box-shadow: 0 0 20px #00ffff;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.canvas.parentElement.appendChild(feedback);
        
        // Remove feedback element after animation
        setTimeout(() => {
            if (feedback.parentElement) {
                feedback.parentElement.removeChild(feedback);
            }
        }, 300);
    }
    
    // Utility methods
    getPointerPosition() {
        return {
            x: this.lastPointerX,
            y: this.lastPointerY,
            isDown: this.isPointerDown
        };
    }
    
    // Cleanup
    destroy() {
        this.stopRapidFire();
        
        if (this.canvas) {
            // Remove all event listeners
            this.canvas.removeEventListener('mousedown', this.handlePointerStart);
            this.canvas.removeEventListener('mouseup', this.handlePointerEnd);
            this.canvas.removeEventListener('mousemove', this.handlePointerMove);
            this.canvas.removeEventListener('mouseleave', this.handlePointerEnd);
            this.canvas.removeEventListener('touchstart', this.handlePointerStart);
            this.canvas.removeEventListener('touchend', this.handlePointerEnd);
            this.canvas.removeEventListener('touchmove', this.handlePointerMove);
            this.canvas.removeEventListener('touchcancel', this.handlePointerEnd);
        }
        
        this.canvas = null;
        this.onShoot = null;
    }
}

// Additional touch optimization for mobile devices
if ('ontouchstart' in window) {
    // Disable iOS bounce
    document.addEventListener('touchmove', (e) => {
        if (e.target === document.body || e.target.tagName === 'CANVAS') {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Disable iOS zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Optimize touch performance
    document.addEventListener('touchstart', () => {}, { passive: true });
}