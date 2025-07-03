class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Game art
    this.load.image('bg', 'assets/bg.png');
    this.load.image('burger', 'assets/burger.png');
    this.load.image('fries', 'assets/fries.png');
    this.load.image('drink', 'assets/drink.png');
    this.load.audio('whopper', 'assets/whopper.mp3');

    // Meter UI
    this.load.image('iconBurger', 'assets/icon_burger.png');
    this.load.image('iconFries', 'assets/icon_fries.png');
    this.load.image('iconDrink', 'assets/icon_drink.png');

    this.load.image('fillBurger', 'assets/ketchup_fill.png');
    this.load.image('fillFries', 'assets/fries_fill.png');
    this.load.image('fillDrink', 'assets/soda_fill.png');

    // Coupon images
    this.load.image('couponBurger', 'assets/coupon_burger.png');
    this.load.image('couponFries', 'assets/coupon_fries.png');
    this.load.image('couponDrink', 'assets/coupon_drink.png');
    this.load.image('sparkle', 'assets/sparkle.png');
    this.load.image('placeholderCoupon', 'assets/placeholder_coupon.png');
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.add.image(centerX, centerY, 'bg').setDisplaySize(width, height);
    
    this.score = { burger: 0, fries: 0, drink: 0 };
    this.foodGroup = this.physics.add.group();
    this.confettiGroup = this.add.group();
    this.meters = {};

    // Stack 3 horizontal meters vertically (left side)
    const meterWidth = width * 0.45;
    const meterHeight = 20;
    const gap = 70;
    const baseX = 50;
    const baseY = height * 0.25;

    const meterData = [
      { type: 'burger', icon: 'iconBurger', fill: 'fillBurger', color: 0xff5555 },
      { type: 'fries', icon: 'iconFries', fill: 'fillFries', color: 0xffcc00 },
      { type: 'drink', icon: 'iconDrink', fill: 'fillDrink', color: 0x00ccff }
    ];

    meterData.forEach(({ type, icon, fill, color }, i) => {
      const y = baseY + i * gap;

      this.add.graphics()
        .fillStyle(0x222222, 1)
        .fillRoundedRect(baseX + 40, y, meterWidth, meterHeight, 10);

      const barFill = this.add.image(baseX + 40, y, fill)
        .setOrigin(0, 0)
        .setDisplaySize(0, meterHeight)
        .setDepth(1);

      const glow = this.add.rectangle(baseX + 40 + meterWidth / 2, y + meterHeight / 2, meterWidth, meterHeight, color)
        .setAlpha(0)
        .setDepth(2);

      const iconSprite = this.add.image(baseX + 20, y + meterHeight / 2, icon)
        .setOrigin(1, 0.5)
        .setScale(width < 500 ? 0.4 : 0.3)
        .setDepth(2);

      this.meters[type] = { fill: barFill, glow, icon: iconSprite, meterWidth };
    });

    this.time.addEvent({
      delay: 800,
      callback: () => this.spawnFood(),
      loop: true
    });
    this.sound.play('whopper');
    this.createPopup();
  }

  spawnFood() {
    const types = ['burger', 'fries', 'drink'];
    const type = Phaser.Utils.Array.GetRandom(types);
    const scaleMap = { burger: 0.3, fries: 0.28, drink: 0.25 };

    const maxX = this.scale.width - 60;
    const item = this.foodGroup.create(
      Phaser.Math.Between(60, maxX),
      -50,
      type
    )
      .setScale(scaleMap[type])
      .setInteractive()
      .setVelocityY(100);

    item.type = type;

    item.on('pointerdown', () => {
      this.score[type] += 20;
      this.updateMeter(type);
      item.destroy();

      if (this.score[type] >= 200) {
        this.showReward(type);
      }
    });
  }

  updateMeter(type) {
    const { fill, glow, icon, meterWidth } = this.meters[type];
    const value = Math.min(this.score[type], 200);
    const targetWidth = (value / 200) * meterWidth;

    this.tweens.add({
      targets: fill,
      displayWidth: targetWidth,
      duration: 300,
      ease: 'Sine.easeOut'
    });

    if (value >= 180) {
      this.tweens.add({ targets: glow, alpha: 0.4, yoyo: true, duration: 300, repeat: 1 });
      this.tweens.add({ targets: icon, scale: icon.scale + 0.05, yoyo: true, duration: 150, repeat: 1 });
    }
  }

  createPopup() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.popup = {
      bg: this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.7)
        .setDepth(10).setVisible(false),

      box: this.add.rectangle(centerX, centerY, 400, 260, 0xffffff)
        .setStrokeStyle(2, 0x333333)
        .setDepth(11).setVisible(false),

      coupon: this.add.image(centerX, centerY, '')
        .setScale(0.3)
        .setDepth(12).setVisible(false).setAlpha(0),

    };
  }

  showReward(type) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
  
    this.scene.pause();
    this.popup.rewardType = type;
  
    // 🔄 Map reward to image texture
    const couponKey = {
      burger: 'couponBurger',
      fries: 'couponFries',
      drink: 'couponDrink'
    }[type];
  
    if (!couponKey) {
      console.warn('No coupon image found for reward type:', type);
      return;
    }
  
    // ✅ Show popup elements
    this.popup.bg.setVisible(true);
    //this.popup.box.setScale(0.3).setVisible(true);

    this.popup.coupon
      .setTexture(couponKey)
      .setAlpha(1)
      .setScale(0.4)
      .setVisible(true);
  
    this.popup.button.setVisible(true);
  
    // 🧾 Animate in coupon and box
    this.tweens.add({
      targets: [this.popup.box, this.popup.coupon],
      scale: 1,
      alpha: 1,
      ease: 'Back.Out',
      duration: 500
    });
  
    // 🎉 Animate banner
    const banner = this.add.text(centerX, centerY - 360, '🎉 YOU DID IT! 🎉', {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#d33'
    }).setOrigin(0.5).setDepth(14).setAlpha(1);
  
    this.tweens.add({
      targets: banner,
      alpha: 1,
      y: banner.y + 20,
      ease: 'Bounce',
      duration: 600
    });
  
  }
}