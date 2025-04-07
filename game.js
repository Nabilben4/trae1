class BowlingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.difficulty = 'easy';
        this.playerName = '';
        
        this.ball = {
            x: 50,
            y: this.canvas.height - 30,
            radius: 15,
            speed: 0,
            power: 0,
            isAiming: true
        };
        
        this.powerMeter = {
            current: 0,
            increasing: true,
            speed: 2
        };
        
        this.setupEventListeners();
        this.initializeGame();
    }

    setupEventListeners() {
        document.getElementById('startGame').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('throwBall').addEventListener('click', () => {
            if (this.ball.isAiming && this.remainingShots > 0) {
                if (!this.powerMeter.animationId) {
                    this.powerMeter.current = 0;
                    this.powerMeter.increasing = true;
                    this.startPowerMeter();
                } else {
                    clearInterval(this.powerMeter.animationId);
                    this.powerMeter.animationId = null;
                    this.throwBallWithPower();
                }
            }
        });

        document.getElementById('backToMenu').addEventListener('click', () => {
            this.showMenu();
        });

        // Ajout des contrôles clavier
        document.addEventListener('keydown', (e) => {
            if (!this.ball.isAiming) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.ball.x = Math.max(this.ball.radius, this.ball.x - 10);
                    break;
                case 'ArrowRight':
                    this.ball.x = Math.min(this.canvas.width / 3, this.ball.x + 10);
                    break;
                case 'ArrowUp':
                    this.ball.y = Math.max(this.ball.radius, this.ball.y - 10);
                    break;
                case 'ArrowDown':
                    this.ball.y = Math.min(this.canvas.height - this.ball.radius, this.ball.y + 10);
                    break;
                case ' ':
                    if (this.ball.isAiming) {
                        this.startPowerMeter();
                    }
                    break;
            }
            this.drawGame();
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === ' ' && this.ball.isAiming) {
                this.throwBallWithPower();
            }
        });
    }

    // Ajout des nouvelles méthodes nécessaires
    startPowerMeter() {
        if (this.powerMeter.animationId) return;
        
        this.powerMeter.animationId = setInterval(() => {
            if (this.powerMeter.increasing) {
                this.powerMeter.current += this.powerMeter.speed;
                if (this.powerMeter.current >= 100) {
                    this.powerMeter.increasing = false;
                }
            } else {
                this.powerMeter.current -= this.powerMeter.speed;
                if (this.powerMeter.current <= 0) {
                    this.powerMeter.increasing = true;
                }
            }
            this.drawGame();
        }, 20);
    }

    // Remove throwBall method as it's not needed anymore
    
    throwBallWithPower() {
        if (!this.ball.isAiming || this.remainingShots <= 0) return;
        
        clearInterval(this.powerMeter.animationId);
        this.powerMeter.animationId = null;
        this.ball.isAiming = false;
        
        this.remainingShots--;
        document.getElementById('shots').textContent = `Tirs restants: ${this.remainingShots}`;

        const difficultyFactors = {
            easy: 0.9,
            medium: 0.7,
            hard: 0.5
        };

        this.ball.power = (this.powerMeter.current / 100) * difficultyFactors[this.difficulty];
        this.ball.speed = 5 + this.ball.power * 10;
        this.animateBall();
    }

    resetGame() {
        this.score = 0;
        this.remainingShots = 3;
        this.colors = {
            background: '#1a1a2e',
            lane: '#16213e',
            ball: '#00ff95',
            pins: '#00fff5',
            accent: '#00ff95'
        };
        document.getElementById('shots').textContent = `Tirs restants: ${this.remainingShots}`;
        this.updateScore();
        this.setupPins();
        this.ball.isAiming = true;
        this.ball.x = 50;
        this.ball.y = this.canvas.height - 30;
        this.powerMeter.current = 0;
        this.powerMeter.increasing = true;
        this.drawGame();
    }

    animateBall() {
        this.ball.x += this.ball.speed;
        this.checkCollisions();
        this.drawGame();

        if (this.ball.x < this.canvas.width) {
            requestAnimationFrame(() => this.animateBall());
        } else {
            setTimeout(() => {
                this.ball.x = 50;
                this.ball.y = this.canvas.height - 30;
                this.updateHighScore();
                
                if (this.remainingShots > 0) {
                    this.ball.isAiming = true;
                    this.powerMeter.current = 0;
                } else {
                    setTimeout(() => this.resetGame(), 2000);
                }
            }, 1000);
        }
    }

    checkCollisions() {
        this.pins.forEach(pin => {
            if (pin.isStanding) {
                const dx = this.ball.x - pin.x;
                const dy = this.ball.y - pin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.ball.radius + pin.radius) {
                    pin.isStanding = false;
                    this.score += 10;
                    this.updateScore();
                }
            }
        });
    }

    setupPins() {
        this.pins = [];
        const pinRows = 4;
        const spacing = 40;
        const startX = this.canvas.width - 100;
        const startY = this.canvas.height / 2;

        for (let row = 0; row < pinRows; row++) {
            for (let pin = 0; pin <= row; pin++) {
                this.pins.push({
                    x: startX - (row * spacing),
                    y: startY - (row * spacing / 2) + (pin * spacing),
                    radius: 10,
                    isStanding: true
                });
            }
        }
    }

    initializeGame() {
        this.showMenu();
        this.updateHighScore();
    }

    showMenu() {
        document.getElementById('menu').classList.add('active');
        document.getElementById('game').classList.remove('active');
    }

    startGame() {
        this.playerName = document.getElementById('playerName').value || 'Joueur';
        this.difficulty = document.getElementById('difficulty').value;
        document.getElementById('menu').classList.remove('active');
        document.getElementById('game').classList.add('active');
        this.resetGame();
    }

    updateScore() {
        document.getElementById('currentScore').textContent = this.score;
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        document.getElementById('highScore').textContent = `Meilleur score: ${this.highScore}`;
    }

    drawGame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Lane with neon effect
        this.ctx.fillStyle = this.colors.lane;
        this.ctx.fillRect(0, 50, this.canvas.width, this.canvas.height - 100);
        
        // Neon lines
        this.ctx.strokeStyle = this.colors.accent;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 50);
        this.ctx.lineTo(this.canvas.width, 50);
        this.ctx.moveTo(0, this.canvas.height - 50);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 50);
        this.ctx.stroke();

        // Ball with glow
        this.ctx.shadowColor = this.colors.ball;
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = this.colors.ball;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Pins with glow
        this.pins.forEach(pin => {
            if (pin.isStanding) {
                this.ctx.shadowColor = this.colors.pins;
                this.ctx.shadowBlur = 15;
                this.ctx.fillStyle = this.colors.pins;
                this.ctx.beginPath();
                this.ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });

        // Power meter repositioned
        if (this.ball.isAiming) {
            const meterX = this.ball.x - 100;
            const meterY = this.ball.y - 50;
            
            // Background of power meter
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(meterX, meterY, 200, 20);
            
            // Power level
            this.ctx.fillStyle = this.colors.accent;
            this.ctx.fillRect(meterX, meterY, this.powerMeter.current * 2, 20);
            
            // Power text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px "Press Start 2P"';
            this.ctx.fillText(`${Math.round(this.powerMeter.current)}%`, meterX + 80, meterY + 15);
        }
    }
}

window.onload = () => {
    new BowlingGame();
};