/* ===== TARGET BLASTER - CORE GAME ENGINE ===== */

class Game {
    constructor() {
        // Canvas and context
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.state = 'loading'; // loading, menu, playing, paused, game-over
        this.difficulty = 'medium';
        this.score = 0;
        this.pendingScore = 0; // Score waiting to be added when particles arrive
        this.highScore = localStorage.getItem('targetBlasterHighScore') || 0;
        this.timeLeft = 60;
        this.accuracy = 0;
        this.shots = 0;
        this.hits = 0;
        this.multiplier = 1;
        this.consecutiveHits = 0;
        
        // Game objects
        this.targets = [];
        this.powerups = [];
        this.particles = [];
        this.projectiles = [];
        
        // Object pools for performance
        this.targetPool = [];
        this.particlePool = [];
        this.projectilePool = [];
        
        // Power-up states
        this.powerupStates = {
            rapidFire: { active: false, timeLeft: 0, duration: 5000 },
            multiShot: { active: false, timeLeft: 0, duration: 8000 },
            timeFreeze: { active: false, timeLeft: 0, duration: 3000 }
        };
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTimer = 0;
        this.targetSpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        
        // Difficulty settings
        this.difficultySettings = {
            easy: {
                targetSpeed: 0.5,
                spawnRate: 2000, // ms between spawns
                timeLimit: 90,
                targetSize: 40,
                powerupChance: 0.3
            },
            medium: {
                targetSpeed: 1,
                spawnRate: 1500,
                timeLimit: 60,
                targetSize: 35,
                powerupChance: 0.2
            },
            hard: {
                targetSpeed: 1.8,
                spawnRate: 1000,
                timeLimit: 45,
                targetSize: 25,
                powerupChance: 0.15
            }
        };
        
        // Screen elements
        this.screens = {
            start: document.getElementById('start-screen'),
            gameOver: document.getElementById('game-over-screen'),
            pause: document.getElementById('pause-screen')
        };
        
        // UI elements
        this.ui = {
            currentScore: document.getElementById('current-score'),
            highScore: document.getElementById('high-score'),
            timeLeft: document.getElementById('time-left'),
            finalScore: document.getElementById('final-score'),
            finalAccuracy: document.getElementById('final-accuracy'),
            newHighScore: document.getElementById('new-high-score')
        };
        
        // Animation frame ID
        this.animationId = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupObjectPools();
        this.updateUI();
        this.showLoadingScreen();
        
        // Simulate loading
        setTimeout(() => {
            this.hideLoadingScreen();
            this.setState('menu');
        }, 2000);
    }
    
    setupCanvas() {
        // Make canvas responsive
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            
            // Set actual canvas size
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            
            // Set display size (CSS pixels)
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            // Scale context to ensure correct drawing operations
            const scale = window.devicePixelRatio || 1;
            this.canvas.width = rect.width * scale;
            this.canvas.height = rect.height * scale;
            this.ctx.scale(scale, scale);
            
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Disable context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    setupEventListeners() {
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.difficulty = btn.dataset.difficulty;
                document.getElementById('start-game-btn').classList.remove('disabled');
                document.getElementById('start-game-btn').disabled = false;
            });
        });
        
        // Start game button
        document.getElementById('start-game-btn').addEventListener('click', () => {
            if (!document.getElementById('start-game-btn').disabled) {
                this.startGame();
            }
        });
        
        // Game over buttons
        document.getElementById('play-again-btn').addEventListener('click', () => this.startGame());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.setState('menu'));
        document.getElementById('watch-ad-btn').addEventListener('click', () => this.showRewardedAd());
        
        // Pause buttons
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.setState('menu'));
        
        // Mute button
        document.getElementById('mute-btn').addEventListener('click', () => {
            window.audioManager.toggleMute();
            document.getElementById('mute-btn').textContent = window.audioManager.isMuted() ? '🔇' : '🔊';
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'KeyP') {
                e.preventDefault();
                if (this.state === 'playing') {
                    this.pauseGame();
                } else if (this.state === 'paused') {
                    this.resumeGame();
                }
            }
            if (e.code === 'Escape') {
                if (this.state === 'playing' || this.state === 'paused') {
                    this.setState('menu');
                }
            }
        });
        
        // Canvas input (handled by InputManager)
        window.inputManager.setCanvas(this.canvas);
        window.inputManager.onShoot = (x, y) => this.shoot(x, y);
    }
    
    setupObjectPools() {
        // Pre-create objects for better performance
        for (let i = 0; i < 50; i++) {
            this.targetPool.push(new Target(0, 0, this.difficultySettings[this.difficulty].targetSize));
            this.particlePool.push(new Particle(0, 0));
        }
        
        for (let i = 0; i < 100; i++) {
            this.projectilePool.push(new Projectile(0, 0, 0, 0));
        }
    }
    
    setState(newState) {
        this.state = newState;
        
        // Hide all screens
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        
        switch (newState) {
            case 'menu':
                this.screens.start.classList.add('active');
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
                window.adManager.showInterstitial();
                break;
                
            case 'playing':
                this.gameLoop();
                break;
                
            case 'paused':
                this.screens.pause.classList.add('active');
                break;
                
            case 'game-over':
                this.screens.gameOver.classList.add('active');
                this.updateFinalStats();
                window.adManager.showInterstitial();
                break;
        }
    }
    
    startGame() {
        // Reset game state
        this.score = 0;
        this.pendingScore = 0;
        this.shots = 0;
        this.hits = 0;
        this.accuracy = 0;
        this.multiplier = 1;
        this.consecutiveHits = 0;
        this.gameTimer = 0;
        this.targetSpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        
        // Set difficulty-based time limit
        const settings = this.difficultySettings[this.difficulty];
        this.timeLeft = settings.timeLimit;
        
        // Clear arrays
        this.targets = [];
        this.powerups = [];
        this.particles = [];
        this.projectiles = [];
        
        // Reset power-ups
        Object.keys(this.powerupStates).forEach(key => {
            this.powerupStates[key].active = false;
            this.powerupStates[key].timeLeft = 0;
            this.hidePowerupIndicator(key);
        });
        
        this.updateUI();
        this.setState('playing');
        
        window.audioManager.playSound('start');
    }
    
    pauseGame() {
        if (this.state === 'playing') {
            this.setState('paused');
        }
    }
    
    resumeGame() {
        if (this.state === 'paused') {
            this.setState('playing');
        }
    }
    
    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') return;
        
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game
        this.update(this.deltaTime);
        this.render();
        
        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update timers
        this.gameTimer += deltaTime;
        this.targetSpawnTimer += deltaTime;
        this.powerupSpawnTimer += deltaTime;
        
        // Update game timer
        const newTimeLeft = Math.max(0, this.difficultySettings[this.difficulty].timeLimit - Math.floor(this.gameTimer / 1000));
        if (newTimeLeft !== this.timeLeft) {
            this.timeLeft = newTimeLeft;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endGame();
                return;
            }
        }
        
        // Spawn targets
        const settings = this.difficultySettings[this.difficulty];
        const adjustedSpawnRate = Math.max(500, settings.spawnRate - (this.gameTimer * 0.1)); // Increase spawn rate over time
        
        if (this.targetSpawnTimer > adjustedSpawnRate) {
            this.spawnTarget();
            this.targetSpawnTimer = 0;
        }
        
        // Spawn power-ups occasionally
        if (this.powerupSpawnTimer > 10000 && Math.random() < settings.powerupChance) {
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
        }
        
        // Update power-ups
        this.updatePowerups(deltaTime);
        
        // Update game objects
        this.updateTargets(deltaTime);
        this.updatePowerups(deltaTime);
        this.updateParticles(deltaTime);
        this.updateProjectiles(deltaTime);
        
        // Update multiplier decay
        if (this.consecutiveHits === 0 && this.multiplier > 1) {
            this.multiplier = Math.max(1, this.multiplier - deltaTime * 0.001);
        }
    }
    
    render() {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add scan line effect
        this.renderScanLines();
        
        // Render game objects
        this.renderTargets();
        this.renderPowerups();
        this.renderProjectiles();
        this.renderParticles();
        
        // Render UI overlay effects
        this.renderUIEffects();
    }
    
    renderScanLines() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        for (let y = 0; y < this.canvas.height; y += 4) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        
        this.ctx.stroke();
    }
    
    renderUIEffects() {
        // Render multiplier indicator
        if (this.multiplier > 1) {
            this.ctx.font = `${Math.min(48, 24 + this.multiplier * 4)}px Orbitron`;
            this.ctx.fillStyle = `rgba(0, 255, 0, ${Math.min(1, this.multiplier / 5)})`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.multiplier.toFixed(1)}x`, this.canvas.width / 2, 80);
        }
    }
    
    updateTargets(deltaTime) {
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            target.update(deltaTime);
            
            // Remove targets that are off screen or expired
            if (target.shouldRemove()) {
                this.returnTargetToPool(target);
                this.targets.splice(i, 1);
                
                // Penalty for missing targets
                this.consecutiveHits = 0;
                this.multiplier = Math.max(1, this.multiplier * 0.8);
            }
        }
    }
    
    updatePowerups(deltaTime) {
        // Update active power-up timers
        Object.keys(this.powerupStates).forEach(key => {
            const powerup = this.powerupStates[key];
            if (powerup.active) {
                powerup.timeLeft -= deltaTime;
                if (powerup.timeLeft <= 0) {
                    powerup.active = false;
                    this.hidePowerupIndicator(key);
                } else {
                    this.updatePowerupIndicator(key, powerup.timeLeft / powerup.duration);
                }
            }
        });
        
        // Update powerup objects
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.update(deltaTime);
            
            if (powerup.shouldRemove()) {
                this.powerups.splice(i, 1);
            }
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.shouldRemove()) {
                this.returnParticleToPool(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            if (projectile.shouldRemove(this.canvas.width, this.canvas.height)) {
                this.returnProjectileToPool(projectile);
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    renderTargets() {
        this.targets.forEach(target => target.render(this.ctx));
    }
    
    renderPowerups() {
        this.powerups.forEach(powerup => powerup.render(this.ctx));
    }
    
    renderParticles() {
        this.particles.forEach(particle => particle.render(this.ctx));
    }
    
    renderProjectiles() {
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
    }
    
    shoot(x, y) {
        if (this.state !== 'playing') return;
        
        this.shots++;
        
        // Create projectile(s)
        const shotCount = this.powerupStates.multiShot.active ? 3 : 1;
        
        for (let i = 0; i < shotCount; i++) {
            const projectile = this.getProjectileFromPool();
            if (projectile) {
                const angle = (i - (shotCount - 1) / 2) * 0.2; // Spread shots
                projectile.init(x, y, Math.cos(angle) * 800, Math.sin(angle) * 800);
                this.projectiles.push(projectile);
            }
        }
        
        // Check for hits
        let hitTarget = false;
        let hitPowerup = false;
        
        // Check target hits
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            if (target.checkHit(x, y)) {
                this.hitTarget(target, i, x, y);
                hitTarget = true;
                break; // Only hit one target per shot
            }
        }
        
        // Check powerup hits
        if (!hitTarget) {
            for (let i = this.powerups.length - 1; i >= 0; i--) {
                const powerup = this.powerups[i];
                if (powerup.checkHit(x, y)) {
                    this.hitPowerup(powerup, i);
                    hitPowerup = true;
                    break;
                }
            }
        }
        
        if (!hitTarget && !hitPowerup) {
            // Miss - create miss particles
            this.createMissParticles(x, y);
            this.consecutiveHits = 0;
            this.multiplier = Math.max(1, this.multiplier * 0.9);
        }
        
        // Play shoot sound
        window.audioManager.playSound(this.powerupStates.rapidFire.active ? 'rapidFire' : 'shoot');
        
        this.updateAccuracy();
        this.updateUI();
    }
    
    hitTarget(target, index, x, y) {
        this.hits++;
        this.consecutiveHits++;
        
        // Calculate score with multiplier
        const basePoints = target.getPoints();
        const points = Math.floor(basePoints * this.multiplier);
        
        // Update multiplier
        this.multiplier = Math.min(10, this.multiplier + 0.1);
        
        // Create hit particles (explosion)
        this.createHitParticles(x, y, target.color);
        
        // Create score particles that flow to score display
        this.createScoreParticles(x, y, target.color, points);
        
        // Don't add score immediately - wait for particles to arrive
        this.pendingScore += points;
        
        // Remove target
        this.returnTargetToPool(target);
        this.targets.splice(index, 1);
        
        // Play hit sound
        window.audioManager.playSound('hit');
    }
    
    hitPowerup(powerup, index) {
        this.activatePowerup(powerup.type);
        this.createPowerupParticles(powerup.x, powerup.y);
        this.powerups.splice(index, 1);
        window.audioManager.playSound('powerup');
    }
    
    activatePowerup(type) {
        const powerup = this.powerupStates[type];
        if (powerup) {
            powerup.active = true;
            powerup.timeLeft = powerup.duration;
            this.showPowerupIndicator(type);
        }
    }
    
    spawnTarget() {
        const target = this.getTargetFromPool();
        if (target) {
            const settings = this.difficultySettings[this.difficulty];
            const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            let x, y, vx, vy;
            
            switch (edge) {
                case 0: // Top
                    x = Math.random() * this.canvas.width;
                    y = -settings.targetSize;
                    vx = (Math.random() - 0.5) * settings.targetSpeed * 100;
                    vy = settings.targetSpeed * 100;
                    break;
                case 1: // Right
                    x = this.canvas.width + settings.targetSize;
                    y = Math.random() * this.canvas.height;
                    vx = -settings.targetSpeed * 100;
                    vy = (Math.random() - 0.5) * settings.targetSpeed * 100;
                    break;
                case 2: // Bottom
                    x = Math.random() * this.canvas.width;
                    y = this.canvas.height + settings.targetSize;
                    vx = (Math.random() - 0.5) * settings.targetSpeed * 100;
                    vy = -settings.targetSpeed * 100;
                    break;
                case 3: // Left
                    x = -settings.targetSize;
                    y = Math.random() * this.canvas.height;
                    vx = settings.targetSpeed * 100;
                    vy = (Math.random() - 0.5) * settings.targetSpeed * 100;
                    break;
            }
            
            target.init(x, y, settings.targetSize, vx, vy);
            this.targets.push(target);
        }
    }
    
    spawnPowerup() {
        const types = ['rapidFire', 'multiShot', 'timeFreeze'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const x = Math.random() * (this.canvas.width - 60) + 30;
        const y = Math.random() * (this.canvas.height - 60) + 30;
        
        this.powerups.push(new Powerup(x, y, type));
    }
    
    createHitParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 300 + 100;
                particle.init(
                    x, y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    color,
                    Math.random() * 1000 + 500,
                    'explosion' // Explosion particle type
                );
                this.particles.push(particle);
            }
        }
    }
    
    createMissParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 150 + 50;
                particle.init(
                    x, y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    '#666666',
                    Math.random() * 800 + 300,
                    'explosion' // Explosion particle type
                );
                this.particles.push(particle);
            }
        }
    }
    
    createPowerupParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 400 + 200;
                particle.init(
                    x, y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    '#ffff00',
                    Math.random() * 1200 + 800,
                    'explosion' // Explosion particle type
                );
                this.particles.push(particle);
            }
        }
    }
    
    createScoreParticles(x, y, color, points) {
        // Get position of score display
        const scoreElement = document.getElementById('current-score');
        const rect = scoreElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Convert screen coordinates to canvas coordinates
        const targetX = (rect.left + rect.width / 2 - canvasRect.left) * (this.canvas.width / canvasRect.width);
        const targetY = (rect.top + rect.height / 2 - canvasRect.top) * (this.canvas.height / canvasRect.height);
        
        // Create multiple score particles based on point value
        const particleCount = Math.min(Math.floor(points / 5), 8); // More particles for higher scores
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                // Add slight spread to starting position
                const spreadX = (Math.random() - 0.5) * 20;
                const spreadY = (Math.random() - 0.5) * 20;
                
                particle.init(
                    x + spreadX, y + spreadY,
                    0, 0, // No initial velocity - they'll move toward target
                    color,
                    1500, // Longer life for score particles
                    'score', // Particle type
                    targetX, targetY // Target position
                );
                this.particles.push(particle);
            }
        }
    }
    
    onScoreParticleArrived(x, y) {
        // Add some of the pending score when particles arrive
        const scoreToAdd = Math.min(this.pendingScore, 10);
        if (scoreToAdd > 0) {
            this.score += scoreToAdd;
            this.pendingScore -= scoreToAdd;
            this.updateUI();
            
            // Create a small burst effect at the score location
            this.createScoreArrivalEffect(x, y);
            
            // Show score popup
            this.showScorePopup(scoreToAdd);
            
            // Play a subtle sound for score collection
            window.audioManager.playSound('hit');
        }
    }
    
    showScorePopup(points) {
        // Create a temporary score popup element
        const popup = document.createElement('div');
        popup.textContent = `+${points}`;
        popup.style.cssText = `
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            color: #00ff00;
            font-family: 'Orbitron', monospace;
            font-size: 1.5rem;
            font-weight: 700;
            text-shadow: 0 0 10px #00ff00;
            pointer-events: none;
            z-index: 1000;
            animation: scorePopup 1s ease-out forwards;
        `;
        
        // Add CSS animation if not already present
        if (!document.getElementById('score-popup-styles')) {
            const style = document.createElement('style');
            style.id = 'score-popup-styles';
            style.textContent = `
                @keyframes scorePopup {
                    0% {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0) scale(1);
                    }
                    50% {
                        transform: translateX(-50%) translateY(-20px) scale(1.2);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-40px) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to score display area
        const scoreElement = document.getElementById('current-score');
        scoreElement.parentElement.appendChild(popup);
        
        // Remove after animation
        setTimeout(() => {
            if (popup.parentElement) {
                popup.parentElement.removeChild(popup);
            }
        }, 1000);
    }
    
    createScoreArrivalEffect(x, y) {
        // Create small particles at score display when score particles arrive
        for (let i = 0; i < 5; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 100 + 50;
                particle.init(
                    x, y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    '#00ff00',
                    500, // Short life for subtle effect
                    'explosion' // Explosion particle type
                );
                this.particles.push(particle);
            }
        }
        
        // Add screen shake effect for big scores
        if (this.pendingScore > 20) {
            this.addScreenShake(3);
        }
    }
    
    addScreenShake(intensity) {
        const canvas = this.canvas;
        const originalTransform = canvas.style.transform;
        
        let shakeTime = 0;
        const shakeDuration = 200; // milliseconds
        
        const shake = () => {
            if (shakeTime < shakeDuration) {
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                canvas.style.transform = `translate(${x}px, ${y}px)`;
                
                shakeTime += 16; // ~60fps
                requestAnimationFrame(shake);
            } else {
                canvas.style.transform = originalTransform;
            }
        };
        
        shake();
    }
    
    // Object pool management
    getTargetFromPool() {
        return this.targetPool.length > 0 ? this.targetPool.pop() : new Target(0, 0, 30);
    }
    
    returnTargetToPool(target) {
        if (this.targetPool.length < 50) {
            target.reset();
            this.targetPool.push(target);
        }
    }
    
    getParticleFromPool() {
        return this.particlePool.length > 0 ? this.particlePool.pop() : new Particle(0, 0);
    }
    
    returnParticleToPool(particle) {
        if (this.particlePool.length < 100) {
            particle.reset();
            this.particlePool.push(particle);
        }
    }
    
    getProjectileFromPool() {
        return this.projectilePool.length > 0 ? this.projectilePool.pop() : new Projectile(0, 0, 0, 0);
    }
    
    returnProjectileToPool(projectile) {
        if (this.projectilePool.length < 100) {
            projectile.reset();
            this.projectilePool.push(projectile);
        }
    }
    
    updateAccuracy() {
        this.accuracy = this.shots > 0 ? Math.floor((this.hits / this.shots) * 100) : 0;
    }
    
    updateUI() {
        this.ui.currentScore.textContent = this.score.toLocaleString();
        this.ui.highScore.textContent = this.highScore.toLocaleString();
        this.ui.timeLeft.textContent = this.timeLeft;
    }
    
    updateFinalStats() {
        this.ui.finalScore.textContent = this.score.toLocaleString();
        this.ui.finalAccuracy.textContent = this.accuracy + '%';
        
        // Check for new high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('targetBlasterHighScore', this.highScore);
            this.ui.newHighScore.classList.remove('hidden');
            window.audioManager.playSound('highScore');
        } else {
            this.ui.newHighScore.classList.add('hidden');
        }
    }
    
    showPowerupIndicator(type) {
        const indicator = document.getElementById(`${type.replace(/([A-Z])/g, '-$1').toLowerCase()}-indicator`);
        if (indicator) {
            indicator.classList.remove('hidden');
            const timer = indicator.querySelector('.powerup-timer');
            if (timer) {
                timer.style.setProperty('--duration', `${this.powerupStates[type].duration / 1000}s`);
            }
        }
    }
    
    hidePowerupIndicator(type) {
        const indicator = document.getElementById(`${type.replace(/([A-Z])/g, '-$1').toLowerCase()}-indicator`);
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }
    
    updatePowerupIndicator(type, progress) {
        const indicator = document.getElementById(`${type.replace(/([A-Z])/g, '-$1').toLowerCase()}-indicator`);
        if (indicator) {
            const timer = indicator.querySelector('.powerup-timer::before');
            if (timer) {
                timer.style.width = `${progress * 100}%`;
            }
        }
    }
    
    endGame() {
        cancelAnimationFrame(this.animationId);
        this.setState('game-over');
        window.audioManager.playSound('gameOver');
    }
    
    showRewardedAd() {
        window.adManager.showRewardedVideo(() => {
            // Extra life reward
            this.timeLeft = Math.min(this.difficultySettings[this.difficulty].timeLimit, this.timeLeft + 30);
            this.updateUI();
            this.setState('playing');
        });
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = loadingScreen.querySelector('.loading-progress');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 40);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers first
    window.audioManager = new AudioManager();
    window.inputManager = new InputManager();
    window.adManager = new AdManager();
    
    // Initialize game
    window.game = new Game();
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (window.game && window.game.state === 'playing') {
        if (document.hidden) {
            window.game.pauseGame();
        }
    }
});