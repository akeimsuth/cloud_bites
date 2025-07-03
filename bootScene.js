class BootScene extends Phaser.Scene {
    constructor() {
      super('BootScene');
    }
  
    preload() {
      this.load.image('bkIntro', 'assets/bk_intro.png');
      this.load.audio('swoosh', 'assets/swoosh.wav');
    }
  
    create() {
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;
  
      // Responsive scale for image
      const bg = this.add.image(centerX, centerY, 'bkIntro');
      const scaleFactor = Math.min(this.scale.width / bg.width, this.scale.height / bg.height);
      bg.setScale(scaleFactor);
  
      // Transparent button over Start Game area
      const zoneW = this.scale.width * 0.6;
      const zoneH = 100;
      const zoneX = centerX;
      const zoneY = this.scale.height * 0.85;
  
      const startZone = this.add.rectangle(zoneX, zoneY, zoneW, zoneH, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.sound.play('swoosh');
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
          });
        });
  
      // Optional bounce effect
      this.tweens.add({
        targets: startZone,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }