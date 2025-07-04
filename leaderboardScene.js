export default class LeaderboardScene extends Phaser.Scene {
    constructor() {
      super('LeaderboardScene');
    }
  
    preload() {
      this.load.image('bg', 'assets/bg.png');
    }
  
    create() {
      const { width, height } = this.scale;
  
      // 🖼️ Background
      this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);
  
      // 🎯 Header
      this.add.text(width / 2, 80, '🌟 Leaderboard 🌟', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffd700'
      }).setOrigin(0.5);
  
      // ⏳ Lockout Message
      this.add.text(width / 2, height / 2 - 60, `You’ve already played today`, {
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0.5);
  
      this.add.text(width / 2, height / 2 - 20, `Come back tomorrow to earn more rewards!`, {
        fontSize: '18px',
        color: '#cccccc'
      }).setOrigin(0.5);
  
      // 🧾 Sample Leaderboard (replace with Firebase later)
      const topPlayers = [
        { name: 'Kymani', score: 3 },
        { name: 'Zahra', score: 2 },
        { name: 'Jahlil', score: 2 },
        { name: 'Liana', score: 1 },
        { name: 'Omari', score: 1 }
      ];
  
      topPlayers.forEach((p, i) => {
        this.add.text(width / 2, height / 2 + 40 + i * 30, `${i + 1}. ${p.name} — ${p.score} plays`, {
          fontSize: '18px',
          color: '#ffffff'
        }).setOrigin(0.5);
      });
  
      // ⏰ Countdown Timer
      const timerText = this.add.text(width / 2, height - 100, '', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#dddddd'
      }).setOrigin(0.5);
  
      const getTimeUntilMidnight = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight - now;
        const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
        const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      };
  
      // ⏱️ Live updater
      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          timerText.setText(`Next play unlocks in: ${getTimeUntilMidnight()}`);
        }
      });
  
      // ✨ Optional pulse effect
      this.tweens.add({
        targets: timerText,
        alpha: { from: 1, to: 0.5 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }