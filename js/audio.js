/* ===== TARGET BLASTER - AUDIO MANAGER ===== */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = false;
        this.volume = 1.0;
        
        // Initialize audio context
        this.initAudioContext();
        
        // Generate procedural sounds
        this.generateSounds();
        
        // Load user preferences
        this.loadSettings();
    }
    
    initAudioContext() {
        try {
            // Use Web Audio API for better performance and control
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Handle audio context state for mobile
            if (this.audioContext.state === 'suspended') {
                document.addEventListener('touchstart', () => {
                    this.audioContext.resume();
                }, { once: true });
                
                document.addEventListener('mousedown', () => {
                    this.audioContext.resume();
                }, { once: true });
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            // Fallback to HTML5 Audio
            this.audioContext = null;
        }
    }
    
    generateSounds() {
        if (!this.audioContext) {
            this.generateHTMLSounds();
            return;
        }
        
        // Generate procedural sound effects using Web Audio API
        this.sounds = {
            shoot: this.generateShootSound(),
            hit: this.generateHitSound(),
            rapidFire: this.generateRapidFireSound(),
            powerup: this.generatePowerupSound(),
            gameOver: this.generateGameOverSound(),
            highScore: this.generateHighScoreSound(),
            start: this.generateStartSound()
        };
    }
    
    generateHTMLSounds() {
        // Fallback: Generate simple beep sounds using HTML5 Audio
        // These will be data URLs with simple sine wave sounds
        this.sounds = {
            shoot: this.createBeep(800, 100),
            hit: this.createBeep(1200, 150),
            rapidFire: this.createBeep(900, 80),
            powerup: this.createBeep(1500, 300),
            gameOver: this.createBeep(300, 800),
            highScore: this.createBeep(2000, 500),
            start: this.createBeep(1000, 400)
        };
    }
    
    generateShootSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            // Sharp shooting sound with frequency sweep
            const freq = 800 - (t * 600);
            const envelope = Math.exp(-t * 10);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
        
        return buffer;
    }
    
    generateHitSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.15, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            // Satisfying hit sound with harmonics
            const freq = 1200;
            const envelope = Math.exp(-t * 8);
            const harmonic1 = Math.sin(2 * Math.PI * freq * t);
            const harmonic2 = Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.5;
            const noise = (Math.random() - 0.5) * 0.1 * envelope;
            data[i] = (harmonic1 + harmonic2 + noise) * envelope * 0.4;
        }
        
        return buffer;
    }
    
    generateRapidFireSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.08, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            // Rapid, punchy sound
            const freq = 900 - (t * 400);
            const envelope = Math.exp(-t * 15);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25;
        }
        
        return buffer;
    }
    
    generatePowerupSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            // Ascending magical sound
            const freq = 1500 + (t * 500);
            const envelope = Math.exp(-t * 3) * Math.sin(t * 20); // Vibrato effect
            const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
            data[i] = (Math.sin(2 * Math.PI * freq * t) + harmonic) * envelope * 0.4;
        }
        
        return buffer;
    }
    
    generateGameOverSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.8, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            // Descending sad sound
            const freq = 300 * Math.exp(-t * 2);
            const envelope = Math.exp(-t * 1.5);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
        }
        
        return buffer;
    }
    
    generateHighScoreSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            // Triumphant fanfare
            const freq = 2000;
            const envelope = Math.exp(-t * 4);
            const melody = Math.sin(2 * Math.PI * freq * t) + 
                          Math.sin(2 * Math.PI * freq * 1.25 * t) * 0.7 +
                          Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.5;
            data[i] = melody * envelope * 0.3;
        }
        
        return buffer;
    }
    
    generateStartSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.4, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            // Energetic start sound
            const freq = 1000 + Math.sin(t * 10) * 200;
            const envelope = Math.exp(-t * 2.5);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
        }
        
        return buffer;
    }
    
    createBeep(frequency, duration) {
        // Create a simple beep using data URL (fallback method)
        const sampleRate = 44100;
        const samples = Math.floor(sampleRate * duration / 1000);
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 2, true);
        
        // Generate samples
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5);
            const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
            view.setInt16(44 + i * 2, sample * 32767, true);
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        return audio;
    }
    
    playSound(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        if (this.audioContext && this.audioContext.state === 'running') {
            this.playWebAudioSound(soundName);
        } else if (this.sounds[soundName].play) {
            this.playHTMLSound(soundName);
        }
    }
    
    playWebAudioSound(soundName) {
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            gainNode.gain.value = this.volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
        } catch (error) {
            console.warn('Error playing Web Audio sound:', error);
        }
    }
    
    playHTMLSound(soundName) {
        try {
            const audio = this.sounds[soundName].cloneNode();
            audio.volume = this.volume;
            audio.play().catch(() => {
                // Ignore play promise rejections (common in some browsers)
            });
        } catch (error) {
            console.warn('Error playing HTML5 audio:', error);
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    getVolume() {
        return this.volume;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveSettings();
        return this.isMuted;
    }
    
    setMute(muted) {
        this.isMuted = muted;
        this.saveSettings();
    }
    
    isMuted() {
        return this.isMuted;
    }
    
    saveSettings() {
        try {
            localStorage.setItem('targetBlasterAudioSettings', JSON.stringify({
                volume: this.volume,
                muted: this.isMuted
            }));
        } catch (error) {
            console.warn('Could not save audio settings:', error);
        }
    }
    
    loadSettings() {
        try {
            const settings = localStorage.getItem('targetBlasterAudioSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                this.volume = parsed.volume || 1.0;
                this.isMuted = parsed.muted || false;
            }
        } catch (error) {
            console.warn('Could not load audio settings:', error);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Clean up HTML audio objects
        Object.values(this.sounds).forEach(sound => {
            if (sound.src && sound.src.startsWith('blob:')) {
                URL.revokeObjectURL(sound.src);
            }
        });
        
        this.sounds = {};
    }
}

// Initialize audio on user interaction (required for mobile browsers)
document.addEventListener('DOMContentLoaded', () => {
    let audioInitialized = false;
    
    const initAudio = () => {
        if (audioInitialized) return;
        
        if (window.audioManager && window.audioManager.audioContext) {
            window.audioManager.audioContext.resume();
        }
        
        audioInitialized = true;
        
        // Remove listeners after first interaction
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('mousedown', initAudio);
        document.removeEventListener('keydown', initAudio);
    };
    
    // Listen for user interactions to unlock audio
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('mousedown', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
});