# Spec Provenance
- **Created at:** 2025-01-04 15:30:00
- **Request:** Complete web-based arcade shooting game "Target Blaster" with full advertising integration
- **Mode:** Production-ready revenue-generating game

# Spec Header

## Name
**Target Blaster** - Web Arcade Shooting Game

## Smallest Scope
Complete 60-second arcade shooter with:
- Click/tap target elimination mechanics
- 3 difficulty levels (Easy/Medium/Hard)
- Score system with multipliers
- Mobile + desktop responsive controls
- Integrated monetization (AdSense + rewarded videos)
- Local high score storage

## Non-Goals
- Multiplayer features
- Account/login system
- Complex storyline or campaigns
- 3D graphics or WebGL complexity
- Server-side score tracking

# Paths to Supplementary Guidelines
- Design aesthetic: https://raw.githubusercontent.com/memextech/templates/refs/heads/main/design/y2k-retro-tech.md (arcade game aesthetic)
- Alternative minimalist: https://raw.githubusercontent.com/memextech/templates/refs/heads/main/design/dark-modern-professional.md

# Decision Snapshot

## Architecture Decisions
- **Frontend:** HTML5 Canvas + Vanilla JavaScript (no frameworks for maximum performance)
- **Graphics:** 2D canvas with particle effects and smooth animations
- **Controls:** Touch events + mouse events with unified input handling
- **Storage:** localStorage for scores/preferences
- **Ads:** Google AdSense integration with graceful fallbacks
- **Performance:** 60fps target with efficient object pooling

## Technology Choices
- Pure HTML5/CSS3/JavaScript (no build tools needed)
- Canvas API for game rendering
- Web Audio API for sound effects
- CSS Grid/Flexbox for responsive UI layout
- External CDN for ad scripts (non-blocking loading)

## Monetization Strategy
1. **Banner Ads:** Top (728x90) and sidebar (300x250) AdSense units
2. **Interstitial Ads:** Between game sessions (non-intrusive timing)
3. **Rewarded Videos:** Extra lives/power-ups for voluntary ad viewing
4. **Ad Fallbacks:** Local placeholder content if ad networks fail

# Architecture at a Glance

```
Target Blaster/
├── index.html              # Main game page with responsive layout
├── css/
│   ├── style.css          # Responsive game styling
│   └── ads.css            # Advertisement positioning
├── js/
│   ├── game.js            # Core game engine and loop
│   ├── entities.js        # Target, powerup, particle classes
│   ├── input.js           # Unified mouse/touch input handling
│   ├── audio.js           # Sound effects and audio management
│   └── ads.js             # Advertisement integration logic
├── assets/
│   ├── sprites/           # Target sprites and UI elements
│   ├── sounds/            # Audio files (explosions, shots, etc.)
│   └── particles/         # Particle effect textures
└── README.md              # Setup and deployment instructions
```

## Core Game Loop Flow
```
Game Start → Difficulty Selection → 60s Round → Score Calculation → 
Ad Break (Interstitial) → High Score Check → Play Again/Menu
```

## Performance Architecture
- **Object Pooling:** Reuse target/particle objects to avoid GC pauses
- **RAF Optimization:** Single requestAnimationFrame loop at 60fps
- **Canvas Optimization:** Dirty rectangle rendering for efficiency
- **Mobile Optimization:** Touch event batching and input debouncing

# Implementation Plan

## Phase 1: Core Game Foundation (2-3 hours)
1. **HTML Structure:** Responsive layout with canvas and UI elements
2. **CSS Styling:** Y2K retro aesthetic with mobile-first responsive design
3. **Game Loop:** Basic render/update cycle with timing controls
4. **Input System:** Unified mouse/touch event handling with coordinate mapping

## Phase 2: Game Mechanics (2-3 hours)
1. **Target System:** Spawning, movement, collision detection with click areas
2. **Scoring Logic:** Points, multipliers, consecutive hit bonuses
3. **Power-ups:** Rapid Fire, Multi-Shot, Time Freeze implementations
4. **Difficulty Scaling:** Spawn rates and target speeds per level

## Phase 3: Visual Polish (1-2 hours)
1. **Particle Effects:** Explosion animations and visual feedback
2. **UI Elements:** Score display, timer, power-up indicators
3. **Responsive Design:** Phone/tablet/desktop layout adaptations
4. **Visual Assets:** Placeholder sprites and animation frames

## Phase 4: Audio & Feedback (1 hour)
1. **Sound Effects:** Shooting, explosions, power-up sounds
2. **Audio Management:** Volume controls and mobile compatibility
3. **Visual Feedback:** Screen shake, flash effects, score popups

## Phase 5: Monetization Integration (2 hours)
1. **AdSense Setup:** Banner placement with responsive positioning
2. **Interstitial Ads:** Between-round advertising with timing controls
3. **Rewarded Videos:** Extra life system with ad completion tracking
4. **Fallback System:** Graceful degradation when ads fail to load

## Phase 6: Storage & Polish (1 hour)
1. **Local Storage:** High scores, player preferences, settings
2. **Performance Optimization:** Final frame rate testing and tweaks
3. **Cross-browser Testing:** Mobile Safari, Chrome, Firefox compatibility
4. **Deployment Package:** Final file organization and documentation

# Verification & Demo Script

## Functionality Tests
```bash
# Open index.html in browser
# Test 1: Desktop Controls
- Click targets with mouse
- Verify score increases
- Check power-up activation

# Test 2: Mobile Responsive
- Open on phone/tablet
- Tap targets with finger
- Verify touch responsiveness
- Check UI scaling

# Test 3: Ad Integration
- Wait for AdSense approval/test mode
- Verify banner ad display
- Test interstitial timing
- Check rewarded video flow

# Test 4: Performance
- Monitor framerate (should stay ~60fps)
- Test with multiple targets on screen
- Verify smooth particle effects
```

## Deployment Readiness
- [ ] All files properly organized
- [ ] AdSense publisher ID configured
- [ ] Mobile meta tags correct
- [ ] High score system working
- [ ] Cross-browser compatibility verified
- [ ] README with setup instructions

# Deploy

## Immediate Deployment Options
1. **Netlify Drop:** Drag folder to netlify.com/drop for instant hosting
2. **GitHub Pages:** Push to repository with GitHub Pages enabled
3. **Vercel:** Connect repository for automatic deployments
4. **Traditional Hosting:** Upload files to any web hosting provider

## Monetization Setup
1. **Google AdSense:** Apply with completed game for approval
2. **Ad Placement:** Configure responsive ad units in ads.js
3. **Analytics:** Add Google Analytics for revenue optimization
4. **A/B Testing:** Test ad placements for maximum engagement

## Performance Optimization
- Minify JavaScript files for production
- Optimize image assets (sprites, backgrounds)
- Enable gzip compression on server
- Add service worker for offline caching (future enhancement)

The game will be ready for immediate revenue generation once AdSense approval is obtained, with fallback monetization through direct sponsor placements if needed.