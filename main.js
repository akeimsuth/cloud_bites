const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.RESIZE, // Dynamically adapts to viewport
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight
    },
    scene: [BootScene, GameScene, LeaderboardScene],
    physics: { default: 'arcade' },
    backgroundColor: '#000' // fallback to avoid white margin flash
  };
  new Phaser.Game(config);
  window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});