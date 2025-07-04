function createEmojiPopup(rank = 1, message = 'You made the top ranks! 🌟') {
  const popup = document.createElement('div');
  popup.id = 'emojiPopup';
  popup.style.position = 'absolute';
  popup.style.top = '30%';
  popup.style.left = '50%';
  popup.style.transform = 'translateX(-50%) scale(0.8)';
  popup.style.background = 'rgba(0, 0, 0, 0.85)';
  popup.style.color = '#fff';
  popup.style.padding = '20px 30px';
  popup.style.borderRadius = '12px';
  popup.style.textAlign = 'center';
  popup.style.fontFamily = 'sans-serif';
  popup.style.zIndex = '1001';
  popup.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.4)';
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease, transform 0.3s ease';

  const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🔥';

  popup.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
    <div style="font-size: 20px; font-weight: bold;">${message}</div>
    <div style="margin-top: 12px;">Share it or keep climbing! 💪🍟</div>
    <button style="margin-top: 15px; padding: 8px 14px; font-size: 16px; background: #ff4444; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Close</button>
  `;

  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translateX(-50%) scale(1)';
  });

  popup.querySelector('button').onclick = () => popup.remove();
}

class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }

  preload() {
    this.load.image('bg', 'assets/bg.png');
  }

  async create() {
    const { width, height } = this.scale;

    // 📍 Location Selector
    const locationSelector = document.createElement('select');
    locationSelector.style.position = 'absolute';
    locationSelector.style.top = '20px';
    locationSelector.style.left = '50%';
    locationSelector.style.transform = 'translateX(-50%)';
    locationSelector.style.zIndex = '1000';
    locationSelector.style.fontSize = '16px';
    locationSelector.style.padding = '5px';
    locationSelector.style.borderRadius = '6px';
    locationSelector.style.border = '1px solid #ccc';
    locationSelector.style.background = '#fff';

    ['Kingston', 'Montego Bay', 'Ocho Rios'].forEach(loc => {
      const option = document.createElement('option');
      option.value = loc;
      option.textContent = loc;
      locationSelector.appendChild(option);
    });

    document.body.appendChild(locationSelector);

    // 📤 Share Button
    const shareButton = document.createElement('button');
    shareButton.innerText = '📤 Share Your Rank';
    shareButton.style.position = 'absolute';
    shareButton.style.bottom = '40px';
    shareButton.style.left = '50%';
    shareButton.style.transform = 'translateX(-50%)';
    shareButton.style.padding = '10px 20px';
    shareButton.style.fontSize = '16px';
    shareButton.style.borderRadius = '6px';
    shareButton.style.border = 'none';
    shareButton.style.background = '#28a745';
    shareButton.style.color = '#fff';
    shareButton.style.zIndex = '1000';
    shareButton.style.cursor = 'pointer';

    document.body.appendChild(shareButton);

    const renderLeaderboard = async (location) => {
      this.children.removeAll();
      this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height).setTint(0x333333);

      this.add.text(width / 2, 80, `🏆 ${location} Champs 🏆`, {
        fontSize: '36px',
        fontFamily: 'Arial Black',
        color: '#ffd700',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5);

      const db = window.Firebase.db;
      const ref = window.Firebase.collection(db, 'players');
      const q = window.Firebase.query(
        ref,
        window.Firebase.where('location', '==', location),
        window.Firebase.orderBy('timesPlayed', 'desc'),
        window.Firebase.limit(10)
      );

      const snapshot = await window.Firebase.getDocs(q);
      const rankEmojis = ['🥇', '🥈', '🥉', '⭐', '🌟'];

      if (snapshot.empty) {
        this.add.text(width / 2, height / 2, 'No players yet!', {
          fontSize: '20px',
          color: '#fff'
        }).setOrigin(0.5);
        return;
      }

      snapshot.docs.forEach((doc, i) => {
        const p = doc.data();
        const y = height / 2 - 100 + i * 40;

        const rowText = this.add.text(width / 2, y,
          `${rankEmojis[i] || '🎖'} ${p.name} — ${p.timesPlayed} plays`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 1
          }
        ).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
          targets: rowText,
          alpha: 1,
          y: y + 5,
          delay: i * 120,
          duration: 400,
          ease: 'Sine.easeOut'
        });

        if (i < 3) {
          createEmojiPopup(i + 1, `${p.name} hit rank #${i + 1} in ${location} 🧨`);
        }

        shareButton.onclick = () => {
          const title = '🏆 Cloud Bites Leaderboard';
          const text = `${p.name} is rank #${i + 1} with ${p.timesPlayed} plays in ${location}! 🍔🔥`;
          const url = window.location.href;

          if (navigator.share) {
            navigator.share({ title, text, url })
              .then(() => console.log('Shared successfully'))
              .catch(err => console.error('Share failed', err));
          } else {
            alert('Sharing is not supported on this device.');
          }
        };
      });

      const timerText = this.add.text(width / 2, height - 10, '', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#f4c85d'
      }).setOrigin(0.5);

      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          const lastPlayed = localStorage.getItem('lastPlayedTimestamp');
          const nextPlay = parseInt(lastPlayed || 0) + 24 * 60 * 60 * 1000;
          const diff = nextPlay - Date.now();

          const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
          const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
          const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

          timerText.setText(`Next play unlocks in: ${hours}:${minutes}:${seconds}`);
        }
      });

      this.tweens.add({
        targets: timerText,
        alpha: { from: 1, to: 0.6 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    };

    locationSelector.addEventListener('change', (e) => {
      renderLeaderboard(e.target.value);
    });

    renderLeaderboard('Kingston');
  }

  shutdown() {
    ['select', '#emojiPopup', 'button'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.remove();
    });
  }
}