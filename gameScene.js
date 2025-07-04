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
    const baseY = height * 0.55;

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

  buildClaimForm(fingerprintId) {
    const form = document.createElement('form');
    form.id = 'userForm';
    form.style.position = 'absolute';
    form.style.top = '80px';
    form.style.left = '50%';
    form.style.transform = 'translateX(-50%)';
    form.style.background = '#fff';
    form.style.padding = '20px';
    form.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    form.style.borderRadius = '10px';
    form.style.zIndex = '1000';
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '10px';
    form.style.width = '280px';
    form.style.fontFamily = 'sans-serif';
  
    form.innerHTML = `
      <h3 style="margin:0 0 5px; text-align:center;">🎉 Claim Your Prize 🎉</h3>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" placeholder="Phone" required />
      <select name="location" required>
        <option value="">Select Location</option>
        <option value="Kingston">Kingston</option>
        <option value="Montego Bay">Montego Bay</option>
        <option value="Ocho Rios">Ocho Rios</option>
      </select>
      <div id="formError" style="color:#b00; font-size:14px; display:none;"></div>
      <button type="submit" style="padding:10px; background:#28a745; color:#fff; border:none; border-radius:5px;">Submit</button>
    `;
  
    document.body.appendChild(form);
  
    const errorBox = form.querySelector('#formError');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
  
      if (!data.name || !data.email || !data.phone || !data.location) {
        errorBox.textContent = 'Please fill out all fields.';
        errorBox.style.display = 'block';
        return;
      }
  
      if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        errorBox.textContent = 'Please enter a valid email address.';
        errorBox.style.display = 'block';
        return;
      }
  
      if (!/^\d{7,15}$/.test(data.phone.replace(/\D/g, ''))) {
        errorBox.textContent = 'Please enter a valid phone number.';
        errorBox.style.display = 'block';
        return;
      }
  
      errorBox.style.display = 'none';
  
      const db = window.Firebase.db;
      const ref = window.Firebase.collection(db, 'players');
      const docRef = await window.Firebase.addDoc(ref, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        fingerprintId,
        prizes: [this.popup.rewardType],
        timesPlayed: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
  
      this.user = {
        id: docRef.id,
        ...data,
        prizes: [this.popup.rewardType],
        timesPlayed: 1
      };
  
      localStorage.setItem('lastPlayedTimestamp', Date.now().toString());
      form.remove();
      this.revealPrize(this.popup.rewardType);
    });
  }

  createClaimForm() {
    FingerprintJS.load().then(fp => fp.get()).then(async result => {
      const fingerprintId = result.visitorId;
      const db = window.Firebase.db;
      const ref = window.Firebase.collection(db, 'players');
      const queryRef = window.Firebase.query(ref, window.Firebase.where('fingerprintId', '==', fingerprintId));
      const snapshot = await window.Firebase.getDocs(queryRef);
  
      if (!snapshot.empty) {
        const playerDoc = snapshot.docs[0];
        const playerData = playerDoc.data();
  
        const confirmBox = document.createElement('div');
        confirmBox.style.position = 'absolute';
        confirmBox.style.top = '100px';
        confirmBox.style.left = '50%';
        confirmBox.style.transform = 'translateX(-50%)';
        confirmBox.style.background = '#fff';
        confirmBox.style.padding = '20px';
        confirmBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        confirmBox.style.borderRadius = '10px';
        confirmBox.style.zIndex = '1000';
        confirmBox.style.width = '300px';
        confirmBox.style.fontFamily = 'sans-serif';
        confirmBox.style.textAlign = 'center';
  
        confirmBox.innerHTML = `
          <p>Are you <strong>${playerData.name}</strong>?</p>
          <button id="yesBtn" style="margin-right:10px;">Yes</button>
          <button id="noBtn">No</button>
        `;
        document.body.appendChild(confirmBox);
  
        confirmBox.querySelector('#yesBtn').onclick = async () => {
          const updatedPrizes = [...(playerData.prizes || []), this.popup.rewardType];
          await window.Firebase.updateDoc(playerDoc.ref, {
            timesPlayed: (playerData.timesPlayed || 0) + 1,
            updatedAt: new Date(),
            prizes: updatedPrizes
          });
  
          this.user = {
            id: playerDoc.id,
            ...playerData,
            timesPlayed: (playerData.timesPlayed || 0) + 1,
            prizes: updatedPrizes
          };
  
          localStorage.setItem('lastPlayedTimestamp', Date.now().toString());
          confirmBox.remove();
          this.revealPrize(this.popup.rewardType);
        };
  
        confirmBox.querySelector('#noBtn').onclick = () => {
          confirmBox.remove();
          this.buildClaimForm(fingerprintId);
        };
      } else {
        this.buildClaimForm(fingerprintId);
      }
    });
  }



  revealPrize(type) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
  
    const couponKey = {
      burger: 'couponBurger',
      fries: 'couponFries',
      drink: 'couponDrink'
    }[type];
  
    this.popup.coupon
      .setTexture(couponKey)
      .setAlpha(1)
      .setScale(0.4)
      .setVisible(true);
  
    const banner = this.add.text(centerX, centerY - 360, '🎉 YOU DID IT! 🎉', {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#d33'
    }).setOrigin(0.5).setDepth(14);
  
    this.tweens.add({
      targets: banner,
      y: banner.y + 20,
      ease: 'Bounce',
      duration: 600
    });
  }

  showReward(type) {
    this.scene.pause();
    this.popup.rewardType = type;
    this.popup.bg.setVisible(true);
    this.createClaimForm(); // Show form instead of reward
  }
}