/* ===== TARGET BLASTER - GAME ENTITIES ===== */

/* ===== TARGET CLASS ===== */
class Target {
    constructor(x, y, size) {
        this.init(x, y, size, 0, 0);
    }
    
    init(x, y, size, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.life = 3000 + Math.random() * 2000; // 3-5 seconds
        this.maxLife = this.life;
        this.active = true;
        
        // Visual properties
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        // Target types with different point values
        const types = [
            { color: '#ff0080', points: 10, probability: 0.5 }, // Standard pink
            { color: '#00ff00', points: 20, probability: 0.3 }, // Fast lime
            { color: '#ffff00', points: 30, probability: 0.15 }, // Rare yellow
            { color: '#00ffff', points: 50, probability: 0.05 }  // Ultra rare cyan
        ];
        
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const type of types) {
            cumulativeProbability += type.probability;
            if (rand <= cumulativeProbability) {
                this.color = type.color;
                this.points = type.points;
                break;
            }
        }
        
        // Adjust speed based on point value
        const speedMultiplier = this.points / 10;
        this.vx *= speedMultiplier;
        this.vy *= speedMultiplier;
        
        // Special targets are smaller and faster
        if (this.points > 20) {
            this.size *= 0.8;
            this.vx *= 1.3;
            this.vy *= 1.3;
        }
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update position
        this.x += this.vx * deltaTime * 0.001;
        this.y += this.vy * deltaTime * 0.001;
        
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Update pulse phase for glow effect
        this.pulsePhase += deltaTime * 0.005;
        
        // Decrease life
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Calculate alpha based on remaining life
        const alpha = Math.min(1, this.life / (this.maxLife * 0.3));
        
        // Pulsing glow effect
        const pulseIntensity = 0.5 + 0.5 * Math.sin(this.pulsePhase);
        const glowSize = this.size + pulseIntensity * 10;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        gradient.addColorStop(0, this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.7, this.color + '40');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Main target (bullseye pattern)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = alpha;
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Middle ring
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center dot
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Point value indicator for high-value targets
        if (this.points > 10) {
            ctx.font = `${this.size * 0.4}px Orbitron`;
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.points.toString(), 0, this.size * 1.5);
        }
        
        ctx.restore();
    }
    
    checkHit(mouseX, mouseY) {
        if (!this.active) return false;
        
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.size;
    }
    
    getPoints() {
        return this.points;
    }
    
    shouldRemove() {
        return !this.active;
    }
    
    reset() {
        this.active = false;
        this.life = 0;
    }
}

/* ===== POWERUP CLASS ===== */
class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 25;
        this.life = 8000; // 8 seconds to collect
        this.maxLife = this.life;
        this.active = true;
        
        // Visual properties
        this.rotation = 0;
        this.rotationSpeed = 0.005;
        this.pulsePhase = 0;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.originalY = y;
        
        // Type-specific properties
        this.typeProperties = {
            rapidFire: {
                color: '#ff0080',
                symbol: '⚡',
                name: 'RAPID FIRE'
            },
            multiShot: {
                color: '#00ff00',
                symbol: '◆',
                name: 'MULTI SHOT'
            },
            timeFreeze: {
                color: '#00ffff',
                symbol: '❄️',
                name: 'TIME FREEZE'
            }
        };
        
        this.color = this.typeProperties[type].color;
        this.symbol = this.typeProperties[type].symbol;
        this.name = this.typeProperties[type].name;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Update pulse phase for glow effect
        this.pulsePhase += deltaTime * 0.008;
        
        // Bobbing motion
        this.bobPhase += deltaTime * 0.003;
        this.y = this.originalY + Math.sin(this.bobPhase) * 5;
        
        // Decrease life
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Calculate alpha based on remaining life
        const alpha = this.life < 2000 ? (this.life / 2000) : 1; // Fade in last 2 seconds
        
        // Pulsing glow effect
        const pulseIntensity = 0.5 + 0.5 * Math.sin(this.pulsePhase);
        const glowSize = this.size + pulseIntensity * 15;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        gradient.addColorStop(0, this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.6, this.color + '60');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Main powerup shape (hexagon)
        ctx.save();
        ctx.rotate(this.rotation);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = alpha;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Inner decoration
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * this.size * 0.6;
            const y = Math.sin(angle) * this.size * 0.6;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
        
        // Symbol
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = alpha;
        ctx.fillText(this.symbol, 0, 0);
        
        // Name label (when close to expiring)
        if (this.life < 3000) {
            ctx.font = `${this.size * 0.3}px Orbitron`;
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.name, 0, -this.size * 1.8);
        }
        
        ctx.restore();
    }
    
    checkHit(mouseX, mouseY) {
        if (!this.active) return false;
        
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.size;
    }
    
    shouldRemove() {
        return !this.active;
    }
}

/* ===== PARTICLE CLASS ===== */
class Particle {
    constructor(x, y) {
        this.init(x, y, 0, 0, '#ffffff', 1000);
    }
    
    init(x, y, vx, vy, color, life, type = 'explosion', targetX = 0, targetY = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 3 + 2;
        this.gravity = type === 'explosion' ? 300 : 0; // Only explosion particles have gravity
        this.active = true;
        this.trail = [];
        this.trailLength = type === 'score' ? 8 : 5;
        this.type = type;
        
        // Score particle properties
        if (type === 'score') {
            this.targetX = targetX;
            this.targetY = targetY;
            this.originalX = x;
            this.originalY = y;
            this.progress = 0;
            this.speed = 800; // pixels per second
            this.size = Math.random() * 2 + 3; // Slightly larger for visibility
            this.pulsePhase = Math.random() * Math.PI * 2;
        }
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        const dt = deltaTime * 0.001;
        
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        
        if (this.type === 'score') {
            // Score particles move toward target position
            this.progress += (this.speed * dt) / Math.sqrt(
                Math.pow(this.targetX - this.originalX, 2) + 
                Math.pow(this.targetY - this.originalY, 2)
            );
            
            if (this.progress >= 1) {
                this.progress = 1;
                this.active = false;
                // Trigger score particle arrival effect
                if (window.game) {
                    window.game.onScoreParticleArrived(this.targetX, this.targetY);
                }
            }
            
            // Smooth curve interpolation toward target
            const easedProgress = this.easeInOutCubic(this.progress);
            this.x = this.originalX + (this.targetX - this.originalX) * easedProgress;
            this.y = this.originalY + (this.targetY - this.originalY) * easedProgress;
            
            // Add some curve to the path for more natural movement
            const curveOffset = Math.sin(this.progress * Math.PI) * 30;
            this.y -= curveOffset;
            
            // Pulse effect
            this.pulsePhase += deltaTime * 0.01;
            
        } else {
            // Regular explosion particle behavior
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            
            // Apply gravity
            this.vy += this.gravity * dt;
            
            // Add some air resistance
            this.vx *= 0.98;
            this.vy *= 0.98;
        }
        
        // Decrease life
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    render(ctx) {
        if (!this.active) return;
        
        let alpha = this.life / this.maxLife;
        let currentSize = this.size * alpha;
        
        // Score particles have special rendering
        if (this.type === 'score') {
            alpha = Math.min(1, alpha * 1.5); // Keep them brighter longer
            const pulse = 1 + 0.3 * Math.sin(this.pulsePhase);
            currentSize = this.size * pulse;
            
            ctx.save();
            
            // Render glowing trail for score particles
            if (this.trail.length > 1) {
                const gradient = ctx.createLinearGradient(
                    this.trail[0].x, this.trail[0].y,
                    this.x, this.y
                );
                gradient.addColorStop(0, this.color + '00');
                gradient.addColorStop(1, this.color + Math.floor(alpha * 200).toString(16).padStart(2, '0'));
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = currentSize * 0.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                
                for (let i = 0; i < this.trail.length; i++) {
                    const point = this.trail[i];
                    if (i === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
                ctx.stroke();
            }
            
            // Add sparkle effect for score particles
            ctx.translate(this.x, this.y);
            ctx.rotate(this.pulsePhase);
            
            // Outer glow
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 2);
            glowGradient.addColorStop(0, this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            glowGradient.addColorStop(0.5, this.color + Math.floor(alpha * 150).toString(16).padStart(2, '0'));
            glowGradient.addColorStop(1, this.color + '00');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw sparkle shape (diamond/star)
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(0, -currentSize);
            ctx.lineTo(currentSize * 0.3, -currentSize * 0.3);
            ctx.lineTo(currentSize, 0);
            ctx.lineTo(currentSize * 0.3, currentSize * 0.3);
            ctx.lineTo(0, currentSize);
            ctx.lineTo(-currentSize * 0.3, currentSize * 0.3);
            ctx.lineTo(-currentSize, 0);
            ctx.lineTo(-currentSize * 0.3, -currentSize * 0.3);
            ctx.closePath();
            ctx.fill();
            
            // Inner sparkle core
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = alpha * 0.9;
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
            return;
        }
        
        ctx.save();
        
        // Render trail for explosion particles
        ctx.strokeStyle = this.color + Math.floor(alpha * 100).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const trailAlpha = (i / this.trail.length) * alpha;
            
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
        
        // Render particle
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentSize * 2);
        gradient.addColorStop(0, this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    shouldRemove() {
        return !this.active;
    }
    
    reset() {
        this.active = false;
        this.life = 0;
        this.trail = [];
        this.type = 'explosion';
        this.progress = 0;
    }
}

/* ===== PROJECTILE CLASS ===== */
class Projectile {
    constructor(x, y, vx, vy) {
        this.init(x, y, vx, vy);
    }
    
    init(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = 2;
        this.color = '#00ffff';
        this.life = 2000; // 2 seconds max flight time
        this.active = true;
        this.trail = [];
        this.trailLength = 8;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        const dt = deltaTime * 0.001;
        
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        
        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Decrease life
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Render trail
        ctx.strokeStyle = this.color + '80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const trailAlpha = Math.floor((i / this.trail.length) * 128);
            
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
        
        // Render projectile with glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        gradient.addColorStop(0, this.color + 'FF');
        gradient.addColorStop(0.5, this.color + '80');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Core projectile
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    shouldRemove(canvasWidth, canvasHeight) {
        if (!this.active) return true;
        
        // Remove if off screen
        return (this.x < -10 || this.x > canvasWidth + 10 || 
                this.y < -10 || this.y > canvasHeight + 10);
    }
    
    reset() {
        this.active = false;
        this.life = 2000;
        this.trail = [];
    }
}