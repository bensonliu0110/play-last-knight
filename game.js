const LastKnightGame = {
  audio: {
    volume: 0.5,
    currentMusic: null,
    currentMusicType: null,
    lastTracks: { main: null, arena: null },
    pools: {
      main: ['Knights & Maidens.mp3', 'Silverdawn Village.mp3', 'The Royal Lands.mp3'],
      arena: ['Knights of Blackhall.mp3', 'Riverbard Tavern.mp3', "The Old Cobbler's Inn.mp3"],
    },
  },

  startMusic(type) {
    const pool = this.audio.pools[type];
    if (!pool) return;
    if (this.audio.currentMusicType === type && this.audio.currentMusic) return;
    this.stopMusic();
    const available = pool.filter((track) => track !== this.audio.lastTracks[type]);
    const track = available[Math.floor(Math.random() * available.length)] || pool[0];
    const music = new Audio(`Last Knight Assets/Game Music/${type === 'main' ? 'Main Screen Music' : 'Arena Music'}/${track}`);
    music.volume = this.audio.volume;
    music.addEventListener('ended', () => {
      if (this.audio.currentMusic !== music) return;
      this.audio.currentMusic = null;
      setTimeout(() => {
        if (this.audio.currentMusicType === type) this.startMusic(type);
      }, 900);
    });
    this.audio.currentMusic = music;
    this.audio.currentMusicType = type;
    this.audio.lastTracks[type] = track;
    const play = () => music.play().catch(() => {
      const resume = () => music.play().catch(() => {});
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
    });
    setTimeout(() => {
      if (this.audio.currentMusic === music) play();
    }, 700);
  },

  stopMusic() {
    if (!this.audio.currentMusic) return;
    this.audio.currentMusic.pause();
    this.audio.currentMusic.currentTime = 0;
    this.audio.currentMusic = null;
    this.audio.currentMusicType = null;
  },

  setAudioVolume(value) {
    this.audio.volume = Math.max(0, Math.min(1, Number(value) / 100));
    this.state.musicVolume = this.audio.volume;
    if (this.audio.currentMusic) this.audio.currentMusic.volume = this.audio.volume;
  },

  playSoundEffect(type) {
    const files = {
      click: 'Click Sound Effect.mp3',
      sword: 'Sword Sound Effect.mp3',
      dagger: 'Dagger Sound Effect.mp3',
      projectile: 'Projectile Sound Effect.mp3',
    };
    if (!files[type]) return;
    const sound = new Audio(`Last Knight Assets/Sound Effects/${files[type]}`);
    sound.volume = this.audio.volume;
    sound.play().catch(() => {});
  },

  state: {
    coins: 0,
    musicVolume: 0.5,
    redeemedCodes: [],
    playTimeStartedAt: null,
    rewardTimer: null,
    arena: {
      active: false,
      x: 50,
      y: 47,
      angle: 0,
      weapon: 'sword',
      unlockedWeapons: ['sword'],
      runCoins: 0,
      playerHistory: [],
      acquiredSpecials: new Set(),
      projectiles: [],
      projectileTimer: null,
      fireTrails: [],
      fireTrailLastAt: 0,
      hitCount: 0,
      achievements: [
        { name: "Foeman's Fall", subtitle: 'Defeat a total of 50 enemies across all runs.', icon: 'achievement-foemans-fall.svg', progress: 0, goal: 50, type: 'defeats' },
        { name: 'The Grand Crusader', subtitle: 'Defeat a total of 500 enemies across all runs.', icon: 'castle', progress: 0, goal: 500, type: 'defeats' },
        { name: "Squire's Trial", subtitle: 'Reach Wave 5.', icon: 'shield', progress: 0, goal: 5, type: 'wave' },
        { name: 'High Knight of the Realm', subtitle: 'Reach Wave 15.', icon: 'crown', progress: 0, goal: 15, type: 'wave' },
        { name: 'Royal Garb', subtitle: 'Purchase any character skin from the shop.', icon: 'helm', progress: 0, goal: 1, type: 'skin' },
        { name: 'The Long Siege', subtitle: 'Accumulate 1 hour of actual gameplay time.', icon: 'hourglass', progress: 0, goal: 3600, type: 'time' },
        { name: 'Daily Tribute', subtitle: 'Complete a full set of 3 Daily Quests.', icon: 'sun', progress: 0, goal: 1, type: 'quests' },
        { name: "King's Treasury", subtitle: 'Earn a total of 15,000 Coins across your lifetime play.', icon: 'treasury', progress: 0, goal: 15000, type: 'lifetimeCoins' },
      ],
      blocking: false,
      blockUntil: 0,
      blockCooldownUntil: 0,
      gameOver: false,
      pendingTypes: [],
      potionTimer: null,
      potion: null,
      potionBuffTimers: [],
      paused: true,
      wave: 1,
      keys: new Set(),
      movementFrame: null,
      stats: { health: 100, shield: 25, damage: 1, speed: 1, crit: 0.3, meleeRange: 1, attackSpeed: 1 },
      enemySpeedMultiplier: 1,
      currentHealth: 100,
      currentShield: 25,
      lastDamageAt: 0,
      nextAttackAt: 0,
      noCooldownUntil: 0,
      immuneUntil: 0,
      upgrades: [
        { name: '+50% Max Health', stat: 'health', amount: 50 },
        { name: '+25% Max Health', stat: 'health', amount: 25 },
        { name: '+40% Armor', stat: 'shield', amount: 40 },
        { name: '+20% Armor', stat: 'shield', amount: 20 },
        { name: '+50% Damage', stat: 'damage', amount: 0.5 },
        { name: '+30% Speed', stat: 'speed', amount: 0.3 },
        { name: '+25% Damage', stat: 'damage', amount: 0.25 },
        { name: '+15% Speed', stat: 'speed', amount: 0.15 },
        { name: '+20% Crit Chance', stat: 'crit', amount: 0.2 },
        { name: '+20% Melee Range', stat: 'meleeRange', amount: 0.2 },
        { name: '+15% Attack Speed', stat: 'attackSpeed', amount: 0.15 },
        { name: '+30% Attack Speed', stat: 'attackSpeed', amount: 0.3 },
        { name: 'Javelin', stat: 'weapon', weapon: 'javelin' },
        { name: 'Crossbow', stat: 'weapon', weapon: 'crossbow' },
        { name: 'Dagger', stat: 'weapon', weapon: 'dagger' },
        { name: 'Bouncy Projectile', stat: 'special', special: 'bouncyProjectile' },
        { name: 'Life Steal', stat: 'special', special: 'lifeSteal' },
        { name: 'Fire Trail', stat: 'special', special: 'fireTrail' },
        { name: 'Precision', stat: 'special', special: 'precision' },
        { name: 'Auto Healing', assetName: 'Auto Heal', stat: 'special', special: 'autoHealing' },
        { name: '-20% Enemy Speed', stat: 'enemySpeed', amount: 0.2 },
        { name: '-40% Enemy Speed', stat: 'enemySpeed', amount: 0.4 },
      ],
      currentUpgrades: [],
      enemies: [],
      enemyFrame: null,
      spawnTimers: [],
      pendingEnemies: 0,
      waveCompleteQueued: false,
    },
    skills: { health: 0, shield: 0, damage: 0, speed: 0 },
    ownedSkins: [],
    lifetime: { coins: 0, enemies: 0, highestWave: 1, playSeconds: 0 },
    rewards: [
      { minutes: 1, coins: 100, claimed: false },
      { minutes: 5, coins: 350, claimed: false },
      { minutes: 10, coins: 750, claimed: false },
      { minutes: 20, coins: 1500, claimed: false },
      { minutes: 30, coins: 2500, claimed: false },
      { minutes: 45, coins: 3800, claimed: false },
      { minutes: 60, coins: 6000, claimed: false },
    ],
    dailyQuests: null,
  },

  start() {
    window.dispatchEvent(new CustomEvent('last-knight-ready'));
  },

  initializeAuth() {
    const modal = document.querySelector('#auth-modal');
    const username = document.querySelector('#auth-username');
    const password = document.querySelector('#auth-password');
    const status = document.querySelector('#auth-status');
    const login = document.querySelector('#auth-login');
    const signup = document.querySelector('#auth-signup');
    const guest = document.querySelector('#auth-guest');
    const config = window.__SUPABASE_CONFIG || {};
    const client = window.supabase && config.url && config.anonKey
      ? window.supabase.createClient(config.url, config.anonKey)
      : null;
    this.authClient = client;
    this.authUser = null;
    this.authUsername = null;
    this.ensureDailyQuests();

    const close = () => {
      modal.classList.remove('is-visible');
      modal.setAttribute('aria-hidden', 'true');
    };
    const normalizeUsername = () => username.value.trim().toLowerCase();
    const isValidUsername = (value) => /^[a-z0-9_]{3,24}$/.test(value);
    const getAuthEmail = (value) => `${value}@lastknightgame.com`;

    const open = () => {
      modal.classList.add('is-visible');
      modal.setAttribute('aria-hidden', 'false');
    };

    const authenticate = async (mode) => {
      if (!client) {
        status.textContent = 'Online login is not configured.';
        return;
      }
      const value = normalizeUsername();
      if (!isValidUsername(value)) {
        status.textContent = 'Username must be 3-24 letters, numbers, or underscores.';
        return;
      }
      if (password.value.length < 6) {
        status.textContent = 'Password must be at least 6 characters.';
        return;
      }
      login.disabled = true;
      signup.disabled = true;
      status.textContent = mode === 'signup' ? 'Creating account...' : 'Signing in...';
      const credentials = { email: getAuthEmail(value), password: password.value };
      let result;
      try {
        result = mode === 'signup'
          ? await client.auth.signUp({ ...credentials, options: { data: { username: value } } })
          : await client.auth.signInWithPassword(credentials);
      } catch (error) {
        status.textContent = 'Unable to reach the online account service.';
        login.disabled = false;
        signup.disabled = false;
        return;
      }
      if (result.error) {
        status.textContent = result.error.message;
        login.disabled = false;
        signup.disabled = false;
        return;
      }
      if (mode === 'signup' && !result.data.session) {
        status.textContent = 'Account created. Confirm your email, then log in.';
        login.disabled = false;
        signup.disabled = false;
        return;
      }
      this.authUser = result.data.user;
      this.authUsername = value;
      await this.loadProgress(value);
      close();
    };

    login.onclick = () => authenticate('login');
    signup.onclick = () => authenticate('signup');
    guest.onclick = close;

    if (!client) {
      status.textContent = 'Online login is not configured.';
      open();
      return;
    }
    client.auth.signOut().catch(() => {});
    open();
  },

  getPersistentState() {
    return {
      coins: this.state.coins,
      musicVolume: this.state.musicVolume,
      redeemedCodes: [...this.state.redeemedCodes],
      skills: { ...this.state.skills },
      ownedSkins: [...this.state.ownedSkins],
      equippedSkin: this.state.equippedSkin,
      lifetime: { ...this.state.lifetime },
      rewards: this.state.rewards.map((reward) => ({ ...reward })),
      achievements: this.state.arena.achievements.map((achievement) => ({ ...achievement })),
      dailyQuests: this.state.dailyQuests,
    };
  },

  async loadProgress(username) {
    if (!this.authClient || !this.authUser) return;
    const { data, error } = await this.authClient.from('profiles').select('game_state').eq('id', this.authUser.id).maybeSingle();
    if (error) return;
    const saved = data?.game_state;
    if (saved) {
      this.state.coins = Number(saved.coins) || 0;
      this.state.musicVolume = Number.isFinite(Number(saved.musicVolume)) ? Math.max(0, Math.min(1, Number(saved.musicVolume))) : 0.5;
      this.audio.volume = this.state.musicVolume;
      this.state.redeemedCodes = [...(saved.redeemedCodes || [])];
      this.state.skills = { ...this.state.skills, ...(saved.skills || {}) };
      this.state.ownedSkins = [...(saved.ownedSkins || [])];
      this.state.equippedSkin = saved.equippedSkin || null;
      this.state.lifetime = { ...this.state.lifetime, ...(saved.lifetime || {}) };
      this.state.rewards = this.state.rewards.map((reward, index) => ({ ...reward, ...(saved.rewards?.[index] || {}) }));
      this.state.arena.achievements = this.state.arena.achievements.map((achievement, index) => ({ ...achievement, ...(saved.achievements?.[index] || {}) }));
      this.renderCoins();
    }
    this.syncAchievementsFromStats();
    this.renderAchievements(document.querySelector('#achievement-list'));
    this.state.dailyQuests = saved?.dailyQuests || this.state.dailyQuests;
    this.ensureDailyQuests();
    this.renderDailyQuests();
    await this.saveProgress(username);
  },

  async saveProgress(username = null) {
    this.syncAchievementsFromStats();
    if (!this.authClient || !this.authUser) return;
    const accountName = username || this.authUsername || this.authUser.user_metadata?.username;
    const gameState = this.getPersistentState();
    await this.authClient.from('profiles').upsert({
      id: this.authUser.id,
      username: accountName,
      game_state: gameState,
      updated_at: new Date().toISOString(),
    });
    await this.authClient.from('leaderboard_scores').upsert({
      user_id: this.authUser.id,
      username: accountName,
      highest_wave: this.state.lifetime.highestWave,
      lifetime_coins: this.state.lifetime.coins,
      play_seconds: this.state.lifetime.playSeconds,
      updated_at: new Date().toISOString(),
    });
  },

  getDailyQuestPool() {
    return [
      ...[3, 4, 5, 6, 7, 8, 9, 10].map((goal) => ({ label: `Reach Wave ${goal}`, category: 'wave', goal })),
      ...[5, 10, 15, 20].map((goal) => ({ label: `Kill ${goal} Enemies`, category: 'kills', goal })),
      ...[5, 10].map((goal) => ({ label: `Play For ${goal} Minutes`, category: 'play', goal: goal * 60 })),
      ...[1, 2, 3].map((goal) => ({ label: `Complete ${goal} Full Run${goal === 1 ? '' : 's'}`, category: 'runs', goal })),
      { label: 'Defeat The Boss', category: 'boss', goal: 1 },
      ...[100, 300, 500].map((goal) => ({ label: `Collect ${goal} Coins`, category: 'coins', goal })),
    ];
  },

  ensureDailyQuests() {
    const quests = this.state.dailyQuests;
    if (quests && quests.expiresAt > Date.now() && quests.items?.length === 3) return;
    const pool = this.getDailyQuestPool();
    const categories = [...new Set(pool.map((quest) => quest.category))];
    const selectedCategories = [];
    while (selectedCategories.length < 3) {
      const category = categories[this.randomWholeNumber(0, categories.length - 1)];
      if (!selectedCategories.includes(category)) selectedCategories.push(category);
    }
    this.state.dailyQuests = {
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      claimed: false,
      items: selectedCategories.map((category) => {
        const options = pool.filter((quest) => quest.category === category);
        const quest = options[this.randomWholeNumber(0, options.length - 1)];
        return { ...quest, progress: 0 };
      }),
    };
    this.saveProgress();
  },

  updateDailyQuest(category, amount, mode = 'add') {
    this.ensureDailyQuests();
    this.state.dailyQuests.items.forEach((quest) => {
      if (quest.category !== category) return;
      quest.progress = mode === 'max'
        ? Math.max(quest.progress, amount)
        : Math.min(quest.goal, quest.progress + amount);
    });
    this.renderDailyQuests();
  },

  areDailyQuestsComplete() {
    return this.state.dailyQuests?.items?.every((quest) => quest.progress >= quest.goal) && !this.state.dailyQuests.claimed;
  },

  claimDailyQuestReward() {
    if (!this.areDailyQuestsComplete()) return;
    this.state.dailyQuests.claimed = true;
    this.addCoins(this.randomWholeNumber(1000, 1500));
    this.updateAchievement('quests', 1);
    this.renderDailyQuests();
    this.saveProgress();
  },

  formatQuestCountdown(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  },

  renderDailyQuests() {
    const list = document.querySelector('#daily-quest-list');
    const refresh = document.querySelector('#daily-quest-refresh');
    const claim = document.querySelector('#daily-quest-claim');
    if (!list || !refresh || !claim) return;
    this.ensureDailyQuests();
    const quests = this.state.dailyQuests;
    list.innerHTML = quests.items.map((quest) => {
      const progress = Math.min(quest.progress, quest.goal);
      const percentage = Math.min(100, (progress / quest.goal) * 100);
      const complete = progress >= quest.goal;
      const value = quest.category === 'play'
        ? `${Math.floor(progress / 60)} / ${Math.floor(quest.goal / 60)} min`
        : `${progress} / ${quest.goal}`;
      return `<article class="daily-quest${complete ? ' is-complete' : ''}">
        <strong>${quest.label}</strong>
        <div class="daily-quest-progress"><span style="width: ${percentage}%"></span></div>
        <small>${value}</small><b aria-label="${complete ? 'Complete' : 'Incomplete'}">${complete ? '&#10003;' : ''}</b>
      </article>`;
    }).join('');
    claim.disabled = !this.areDailyQuestsComplete();
    claim.textContent = quests.claimed ? 'Reward Claimed' : 'Claim Reward';
    refresh.textContent = `Daily Quests refreshes in ${this.formatQuestCountdown(quests.expiresAt - Date.now())}`;
  },

  getCoins() {
    return this.state.coins;
  },

  setCoins(amount) {
    this.state.coins = Math.max(0, Math.floor(amount));
    this.renderCoins();
    this.saveProgress();
  },

  addCoins(amount) {
    this.setCoins(this.state.coins + amount);
    this.state.lifetime.coins += Math.max(0, amount);
    this.saveProgress();
  },

  startPlayTimeTracking() {
    this.state.playTimeStartedAt = Date.now();
    clearInterval(this.state.rewardTimer);
    this.state.rewardTimer = setInterval(() => {
      this.renderRewards();
      this.state.lifetime.playSeconds += 1;
      this.updateDailyQuest('play', 1);
      this.renderStatsOverview(document.querySelector('#stats-overview'));
      this.saveProgress();
    }, 1000);
    this.renderRewards();
  },

  renderCoins() {
    const coinCount = document.querySelector('#coin-count');

    if (coinCount) {
      coinCount.textContent = this.state.coins.toLocaleString();
    }
  },

  initializeMenu() {
    const subScreen = document.querySelector('#sub-screen');
    const subScreenImage = document.querySelector('#sub-screen-image');
    const subScreenBack = document.querySelector('#sub-screen-back');
    const subScreenFrame = document.querySelector('.sub-screen-frame');
    const rewardsPanel = document.querySelector('#playtime-rewards');
    const shopOffers = document.querySelector('#shop-offers');
    const skinOffers = document.querySelector('#skin-offers');
    const leaderboardRows = document.querySelector('#leaderboard-rows');
    const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
    const achievementList = document.querySelector('#achievement-list');
    const settingsPanel = document.querySelector('#settings-panel');
    const arenaControls = document.querySelector('#arena-controls');
    const arenaPlayer = document.querySelector('#arena-player');
    const playerVitals = document.querySelector('#arena-player-vitals');
    const playerAttackVisual = document.querySelector('#arena-player-attack');
    const enemyLayer = document.querySelector('#arena-enemies');
    const projectileLayer = document.querySelector('#arena-projectiles');
    const arenaHotbar = document.querySelector('#arena-hotbar');
    const upgradePhase = document.querySelector('#arena-upgrade-phase');
    const upgradeCards = document.querySelector('#arena-upgrade-cards');
    const statsPanel = document.querySelector('#arena-stats');
    const statsToggle = document.querySelector('#arena-stats-toggle');
    const statsClose = document.querySelector('#arena-stats-close');
    const dailyQuestClaim = document.querySelector('#daily-quest-claim');
    const gameOver = document.querySelector('#arena-game-over');
    const gameOverBack = document.querySelector('#game-over-back');
    const menuHitAreas = document.querySelectorAll('.menu-hit-area');
    const screenPath = 'Last Knight Assets/Main Screen Button Assets/';

    document.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (button && !button.disabled) this.playSoundEffect('click');
    });

    function closeSubScreen() {
      subScreen.classList.remove('is-open');
      subScreen.setAttribute('aria-hidden', 'true');
      subScreenImage.removeAttribute('src');
      subScreenFrame.style.aspectRatio = '1448 / 1086';
      subScreenFrame.classList.remove('is-playtime');
      subScreenFrame.classList.remove('is-arena');
      subScreenFrame.classList.remove('is-shop');
      subScreenFrame.classList.remove('is-achievements');
      subScreenFrame.classList.remove('is-skills');
      subScreenFrame.classList.remove('is-stats');
      subScreenFrame.classList.remove('is-quests');
      subScreenFrame.classList.remove('is-leaderboard');
      subScreenFrame.classList.remove('is-settings');
      LastKnightGame.startMusic('main');
      LastKnightGame.state.arena.active = false;
      LastKnightGame.state.arena.gameOver = false;
      LastKnightGame.stopArenaMovement();
      LastKnightGame.stopEnemySystem();
      const redeemStatus = settingsPanel.querySelector('#redeem-code-status');
      const redeemInput = settingsPanel.querySelector('#redeem-code');
      if (redeemStatus) {
        redeemStatus.textContent = '';
        redeemStatus.className = '';
      }
      if (redeemInput) redeemInput.value = '';
      enemyLayer.innerHTML = '';
      projectileLayer.innerHTML = '';
      LastKnightGame.state.arena.pendingEnemies = 0;
      statsPanel.hidden = true;
      statsToggle.hidden = false;
      statsToggle.setAttribute('aria-expanded', 'false');
      gameOver.classList.remove('is-visible');
      gameOver.setAttribute('aria-hidden', 'true');
    }

    menuHitAreas.forEach((menuHitArea) => {
      menuHitArea.addEventListener('click', () => {
        const screenName = menuHitArea.dataset.screen;
        const destinationPath = menuHitArea.dataset.screenPath || screenPath;
        subScreenImage.src = `${destinationPath}${screenName}`;
        subScreenImage.alt = screenName.replace(' Screen.png', ' screen');
        subScreenFrame.style.aspectRatio = menuHitArea.dataset.screenAspect || '1448 / 1086';
        subScreenFrame.classList.toggle('is-playtime', screenName === 'Play Time Screen.png');
        subScreenFrame.classList.toggle('is-shop', screenName === 'Shop Screen.png');
        if (screenName === 'Shop Screen.png') {
          this.renderShopOffers(shopOffers);
          this.renderSkinOffers(skinOffers);
        }
        subScreenFrame.classList.toggle('is-achievements', screenName === 'Achievements Screen.png');
        if (screenName === 'Achievements Screen.png') this.renderAchievements(achievementList);
        subScreenFrame.classList.toggle('is-skills', screenName === 'Skills Screen.png');
        if (screenName === 'Skills Screen.png') this.renderSkills(document.querySelector('#skills-tree'));
        subScreenFrame.classList.toggle('is-stats', screenName === 'Stats Screen.png');
        if (screenName === 'Stats Screen.png') this.renderStatsOverview(document.querySelector('#stats-overview'));
        subScreenFrame.classList.toggle('is-quests', screenName === 'Quest Screen.png');
        if (screenName === 'Quest Screen.png') this.renderDailyQuests();
        subScreenFrame.classList.toggle('is-leaderboard', screenName === 'Leaderboard Screen.png');
        if (screenName === 'Leaderboard Screen.png') this.renderLeaderboard('waves', leaderboardRows, leaderboardTabs);
        subScreenFrame.classList.toggle('is-settings', screenName === 'Settings Screen.png');
        if (screenName === 'Settings Screen.png') this.initializeSettings(settingsPanel);
        const isArena = screenName === 'Last Knight Arena Asset.gif';
        subScreenFrame.classList.toggle('is-arena', isArena);
        this.state.arena.active = isArena;
        if (isArena) this.startMusic('arena');
        else this.startMusic('main');
        if (isArena) {
          this.initializeArena(arenaPlayer, arenaHotbar, upgradePhase, upgradeCards, enemyLayer, projectileLayer, playerVitals);
        }
        if (screenName === 'Play Time Screen.png') {
          this.renderRewards();
        }
        subScreen.classList.add('is-open');
        subScreen.setAttribute('aria-hidden', 'false');
      });
    });

    subScreenBack.addEventListener('click', closeSubScreen);

    rewardsPanel.addEventListener('click', (event) => {
      const claimButton = event.target.closest('[data-reward-index]');
      if (!claimButton || claimButton.disabled) return;
      this.claimReward(Number(claimButton.dataset.rewardIndex));
    });

    shopOffers.addEventListener('click', (event) => {
      const paymentButton = event.target.closest('[data-payment-url]');
      if (!paymentButton) return;
      window.open(paymentButton.dataset.paymentUrl, '_blank', 'noopener,noreferrer');
    });

    skinOffers.addEventListener('click', (event) => {
      const purchaseButton = event.target.closest('[data-skin]');
      if (!purchaseButton || purchaseButton.disabled) return;
      const skin = purchaseButton.dataset.skin;
      if (this.state.ownedSkins.includes(skin)) this.equipSkin(skin);
      else this.purchaseSkin(skin);
    });

    dailyQuestClaim.addEventListener('click', () => this.claimDailyQuestReward());

    leaderboardTabs.forEach((tab) => {
      tab.addEventListener('click', () => this.renderLeaderboard(tab.dataset.leaderboardType, leaderboardRows, leaderboardTabs));
    });

    arenaHotbar.addEventListener('click', (event) => {
      const slot = event.target.closest('[data-weapon]');
      if (slot && !slot.disabled) this.selectArenaWeapon(slot.dataset.weapon, arenaPlayer, arenaHotbar);
    });

    window.addEventListener('keydown', (event) => {
      if (!this.state.arena.active) return;
      const keys = { '1': 'sword', '2': 'dagger', '3': 'javelin', '4': 'crossbow' };
      if (keys[event.key]) this.selectArenaWeapon(keys[event.key], arenaPlayer, arenaHotbar);
      this.state.arena.keys.add(event.key.toLowerCase());
      if (['w', 'a', 's', 'd', '1', '2', '3', '4'].includes(event.key.toLowerCase())) event.preventDefault();
    });

    window.addEventListener('keyup', (event) => this.state.arena.keys.delete(event.key.toLowerCase()));

    upgradeCards.addEventListener('click', (event) => {
      const card = event.target.closest('[data-upgrade-index]');
      if (card) this.chooseUpgrade(Number(card.dataset.upgradeIndex), upgradePhase, upgradeCards, enemyLayer, projectileLayer);
    });

    statsToggle.addEventListener('click', () => {
      statsPanel.hidden = false;
      statsToggle.hidden = true;
      statsToggle.setAttribute('aria-expanded', 'true');
    });

    statsClose.addEventListener('click', () => {
      statsPanel.hidden = true;
      statsToggle.hidden = false;
      statsToggle.setAttribute('aria-expanded', 'false');
    });

    gameOverBack.addEventListener('click', () => {
      this.collectGameOverCoins();
      closeSubScreen();
    });

    subScreenFrame.addEventListener('pointermove', (event) => {
      if (!this.state.arena.active) return;
      const bounds = subScreenFrame.getBoundingClientRect();
      this.state.arena.angle = Math.atan2(event.clientY - (bounds.top + bounds.height * this.state.arena.y / 100), event.clientX - (bounds.left + bounds.width * this.state.arena.x / 100)) * 180 / Math.PI;
      this.renderArenaPlayer(arenaPlayer);
    });

    subScreenFrame.addEventListener('pointerdown', (event) => {
      if (!this.state.arena.active || this.state.arena.paused || event.target.closest('button')) return;
      this.playerAttack(arenaPlayer, playerAttackVisual);
    });
  },

  initializeArena(arenaPlayer, arenaHotbar, upgradePhase, upgradeCards, enemyLayer, projectileLayer, playerVitals) {
    this.state.arena.x = 50;
    this.state.arena.y = 47;
    this.state.arena.angle = 0;
    this.state.arena.wave = 1;
    this.state.arena.weapon = 'sword';
    this.state.arena.unlockedWeapons = ['sword'];
    this.state.arena.runCoins = 0;
    this.state.arena.enemySpeedMultiplier = 1;
    this.state.arena.stats.health = 100 + this.state.skills.health * 10;
    this.state.arena.stats.shield = 25 + this.state.skills.shield * 5;
    this.state.arena.stats.damage = 1 + this.state.skills.damage * 0.1;
    this.state.arena.stats.speed = 1 + this.state.skills.speed * 0.05;
    this.state.arena.playerHistory = [];
    this.state.arena.acquiredSpecials = new Set();
    this.state.arena.projectiles = [];
    this.state.arena.fireTrails = [];
    this.state.arena.fireTrailLastAt = 0;
    this.state.arena.hitCount = 0;
    this.state.arena.gameOver = false;
    this.state.arena.pendingTypes = [];
    clearTimeout(this.state.arena.potionTimer);
    this.state.arena.potionTimer = null;
    const existingPotion = document.querySelector('#arena-potions .arena-potion');
    if (existingPotion) existingPotion.remove();
    this.state.arena.potion = null;
    this.state.arena.potionBuffTimers.forEach((timer) => clearTimeout(timer));
    this.state.arena.potionBuffTimers = [];
    document.querySelector('#arena-game-over').classList.remove('is-visible');
    document.querySelector('#arena-game-over').setAttribute('aria-hidden', 'true');
    this.state.arena.paused = true;
    this.state.arena.keys.clear();
    this.state.arena.waveCompleteQueued = false;
    this.state.arena.currentHealth = this.state.arena.stats.health;
    this.state.arena.currentShield = this.state.arena.stats.shield;
    this.state.arena.lastDamageAt = 0;
    this.state.arena.nextAttackAt = 0;
    this.state.arena.noCooldownUntil = 0;
    this.state.arena.immuneUntil = 0;
    document.querySelector('#arena-wave-number').textContent = `Wave ${this.state.arena.wave}`;
    document.querySelector('#arena-enemies-left').textContent = 'Enemies Left: 0';
    arenaPlayer.src = this.getPlayerModelPath('sword');
    this.renderArenaHotbar(arenaHotbar);
    this.renderArenaPlayer(arenaPlayer);
    this.renderPlayerVitals(playerVitals);
    this.renderStats();
    this.renderSpecialSlots();
    this.renderRunCoins();
    this.renderAchievements(document.querySelector('#achievement-list'));
    this.showUpgradePhase(upgradePhase, upgradeCards);
    enemyLayer.innerHTML = '';
    projectileLayer.innerHTML = '';
    this.state.arena.enemies = [];
      this.renderSpecialSlots();
    this.state.arena.pendingEnemies = 0;
    this.stopEnemySystem();
    this.state.arena.projectileTimer = setInterval(() => {
      if (this.state.arena.active) this.updateProjectiles();
    }, 16);
    this.startArenaMovement(arenaPlayer);
    this.updateAchievement('wave', this.state.arena.wave);
  },

  startArenaMovement(arenaPlayer) {
    this.stopArenaMovement();
    const move = () => {
      if (this.state.arena.active) {
        const now = performance.now();
        this.state.arena.playerHistory.push({ time: now, x: this.state.arena.x, y: this.state.arena.y });
        this.state.arena.playerHistory = this.state.arena.playerHistory.filter((position) => now - position.time <= 1300);
        if (!this.state.arena.paused) this.moveArenaPlayer(arenaPlayer);
        this.checkPotionContact();
        this.updateProjectiles();
        this.updateFireTrails();
        this.updateAutoHealing(performance.now());
      }
      this.state.arena.movementFrame = requestAnimationFrame(move);
    };
    this.state.arena.movementFrame = requestAnimationFrame(move);
  },

  stopArenaMovement() {
    if (this.state.arena.movementFrame) cancelAnimationFrame(this.state.arena.movementFrame);
    this.state.arena.movementFrame = null;
  },

  showUpgradePhase(upgradePhase, upgradeCards) {
    const available = this.state.arena.upgrades.filter((upgrade) => {
      if (upgrade.stat === 'weapon') return !this.state.arena.unlockedWeapons.includes(upgrade.weapon);
      if (upgrade.stat === 'special') return !this.state.arena.acquiredSpecials.has(upgrade.special);
      if (upgrade.stat === 'enemySpeed') return !this.state.arena.acquiredSpecials.has(upgrade.name);
      return true;
    });
    this.state.arena.currentUpgrades = available.sort(() => Math.random() - 0.5).slice(0, 3);
    upgradeCards.innerHTML = this.state.arena.currentUpgrades.map((upgrade, index) => {
      const assetName = `${upgrade.assetName || upgrade.name} Asset.png`;
      const assetPath = `Last Knight Assets/Upgrade Assets/${assetName}`;
      return `<button class="arena-upgrade-card" data-upgrade-index="${index}" aria-label="Choose upgrade"><img src="${encodeURI(assetPath)}" alt=""></button>`;
    }).join('');
    upgradePhase.hidden = false;
  },

  chooseUpgrade(index, upgradePhase, upgradeCards, enemyLayer, projectileLayer) {
    const upgrade = this.state.arena.currentUpgrades[index];
    if (!upgrade) return;
    if (upgrade.stat === 'health' || upgrade.stat === 'shield') this.state.arena.stats[upgrade.stat] += upgrade.amount;
    if (upgrade.stat === 'damage' || upgrade.stat === 'speed' || upgrade.stat === 'crit' || upgrade.stat === 'meleeRange' || upgrade.stat === 'attackSpeed') this.state.arena.stats[upgrade.stat] += upgrade.amount;
    if (upgrade.stat === 'enemySpeed') this.state.arena.enemySpeedMultiplier *= 1 - upgrade.amount;
    if (upgrade.stat === 'weapon' && !this.state.arena.unlockedWeapons.includes(upgrade.weapon)) this.state.arena.unlockedWeapons.push(upgrade.weapon);
    if (upgrade.stat === 'special') this.state.arena.acquiredSpecials.add(upgrade.special);
    if (upgrade.stat === 'weapon') this.updateAchievement('weapons', this.state.arena.unlockedWeapons.length);
    if (upgrade.stat === 'special') this.updateAchievement('specials', this.state.arena.acquiredSpecials.size);
    if (upgrade.stat === 'enemySpeed') this.state.arena.acquiredSpecials.add(upgrade.name);
    this.state.arena.currentHealth = this.state.arena.stats.health;
    this.state.arena.currentShield = this.state.arena.stats.shield;
    this.renderStats();
    this.renderArenaHotbar(document.querySelector('#arena-hotbar'));
    upgradePhase.hidden = true;
    upgradeCards.innerHTML = '';
    this.state.arena.paused = false;
    this.startWave(enemyLayer, projectileLayer);
    this.renderSpecialSlots();
  },

  getWaveRoster(wave) {
    const definitions = [
      { type: 'soldier', unlock: 1, min: wave, max: wave * 2 },
      { type: 'assassin', unlock: 2, min: wave - 2, max: wave * 0.8 },
      { type: 'archer', unlock: 3, min: wave - 3, max: wave * 0.6 },
      { type: 'spearer', unlock: 4, min: wave - 4, max: wave * 0.5 },
      { type: 'tank', unlock: 6, min: wave - 6, max: wave * 0.3 },
      { type: 'sniper', unlock: 8, min: wave - 8, max: wave * 0.2 },
    ];
    const regular = [];
    definitions.filter((definition) => wave >= definition.unlock).forEach((definition) => {
      const count = this.randomWholeNumber(Math.max(0, definition.min), Math.max(0, definition.max));
      const finalCount = wave % 10 === 0 ? Math.floor(count / 2) : count;
      for (let index = 0; index < finalCount; index += 1) regular.push(definition.type);
    });
    if (wave % 10 === 0) {
      for (let index = 0; index < wave / 10; index += 1) regular.push('boss');
    }
    return regular;
  },

  randomWholeNumber(min, max) {
    const low = Math.ceil(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    return high < low ? 0 : Math.floor(Math.random() * (high - low + 1)) + low;
  },

  startWave(enemyLayer, projectileLayer) {
    this.stopEnemySystem();
    this.state.arena.projectileTimer = setInterval(() => {
      if (this.state.arena.active) this.updateProjectiles();
    }, 16);
    const roster = this.getWaveRoster(this.state.arena.wave);
    this.state.arena.enemies = [];
    this.state.arena.waveCompleteQueued = false;
    this.state.arena.pendingTypes = [...roster];
    this.state.arena.pendingEnemies = roster.length;
    enemyLayer.innerHTML = '';
    document.querySelector('#arena-enemies-left').textContent = `Enemies Left: ${roster.length}`;
    this.fillEnemySlots(enemyLayer);
    this.schedulePotion();
    this.state.arena.enemyFrame = requestAnimationFrame(() => this.updateEnemies(enemyLayer, projectileLayer));
  },

  schedulePotion() {
    clearTimeout(this.state.arena.potionTimer);
    if (this.state.arena.gameOver || this.state.arena.paused) return;
    const delay = (15 + Math.random() * 15) * 1000;
    this.state.arena.potionTimer = setTimeout(() => this.spawnPotion(), delay);
  },

  spawnPotion() {
    if (!this.state.arena.active || this.state.arena.paused || this.state.arena.gameOver) return;
    const roll = Math.random();
    const type = roll < 0.3 ? 'health' : roll < 0.5 ? 'speed' : roll < 0.7 ? 'damage' : roll < 0.9 ? 'cooldown' : 'immunity';
    const potion = document.createElement('span');
    potion.className = `arena-potion arena-potion--${type}`;
    potion.textContent = '';
    potion.setAttribute('aria-label', `${type} potion`);
    const x = 20 + Math.random() * 60;
    const y = 25 + Math.random() * 45;
    potion.style.left = `${x}%`;
    potion.style.top = `${y}%`;
    document.querySelector('#arena-potions').appendChild(potion);
    this.state.arena.potion = { type, element: potion, x, y };
  },

  collectPotion(type) {
    const arena = this.state.arena;
    if (!arena.potion) return;
    arena.potion.element.remove();
    arena.potion = null;
    try {
      if (type === 'health') {
        const healing = Math.max(20, Math.ceil(arena.stats.health * 0.2));
        arena.currentHealth = Math.min(arena.stats.health, arena.currentHealth + healing);
      }
      if (type === 'speed' || type === 'damage') {
        const stat = type;
        arena.stats[stat] *= 1.3;
        const timer = setTimeout(() => { arena.stats[stat] /= 1.3; this.renderStats(); }, type === 'speed' ? 6000 : 8000);
        arena.potionBuffTimers.push(timer);
      }
      if (type === 'cooldown') arena.noCooldownUntil = performance.now() + 5000;
      if (type === 'immunity') arena.immuneUntil = performance.now() + 3000;
      this.renderStats();
      this.schedulePotion();
      this.saveProgress();
    } finally {
      if (arena.active && !arena.gameOver) arena.paused = false;
    }
  },

  checkPotionContact() {
    const potion = this.state.arena.potion;
    if (!potion) return;
    if (Math.hypot(this.state.arena.x - potion.x, this.state.arena.y - potion.y) <= 5) this.collectPotion(potion.type);
  },

  fillEnemySlots(enemyLayer) {
    while (this.state.arena.enemies.length < 10 && this.state.arena.pendingTypes.length) {
      this.spawnEnemy(this.state.arena.pendingTypes.shift(), enemyLayer);
    }
    this.state.arena.pendingEnemies = this.state.arena.pendingTypes.length;
  },

  spawnEnemy(type, enemyLayer) {
    const definitions = {
      soldier: { label: 'Soldier', hp: 60, damage: 15, speed: 1, range: 9, cooldown: 800, attackType: 'melee' },
      assassin: { label: 'Assassin', hp: 35, damage: 6, speed: 1.4, range: 6, cooldown: 400, attackType: 'melee' },
      archer: { label: 'Archer', hp: 40, damage: 12, speed: 0.9, range: 28, cooldown: 2000, attackType: 'ranged' },
      spearer: { label: 'Spearer', hp: 70, damage: 20, speed: 1.1, range: 13, cooldown: 1200, attackType: 'melee' },
      tank: { label: 'Tank', hp: 150, damage: 35, speed: 0.75, range: 9, cooldown: 1800, attackType: 'melee' },
      sniper: { label: 'Sniper', hp: 45, damage: 40, speed: 0.8, range: 38, cooldown: 3500, attackType: 'ranged' },
      boss: { label: 'Boss', hp: 600, damage: 45, speed: 1.15, range: 14, cooldown: 1200, attackType: 'mixed' },
    }[type];
    const enemy = { type, ...definitions, maxHp: definitions.hp, x: 50 + (Math.random() * 10 - 5), y: 96, currentHp: definitions.hp, nextAttack: 0, element: document.createElement('div') };
    enemy.element.className = `arena-enemy arena-enemy--${type} is-entering`;
    enemy.element.innerHTML = `<img src="Last Knight Assets/Enemy Models/Enemy ${definitions.label}.png" alt="${definitions.label}">`;
    enemy.element.style.left = `${enemy.x}%`;
    enemy.element.style.top = `${enemy.y}%`;
    enemy.element.style.transform = `translate(-50%, -50%) rotate(${this.getEnemyFacing(enemy)}deg)`;
    enemyLayer.appendChild(enemy.element);
    this.state.arena.enemies.push(enemy);
    this.state.arena.pendingEnemies = Math.max(0, this.state.arena.pendingEnemies - 1);
    setTimeout(() => enemy.element.classList.remove('is-entering'), 900);
  },

  updateEnemies(enemyLayer, projectileLayer) {
    if (!this.state.arena.active) return;
    const now = performance.now();
    const player = this.state.arena;
    player.playerHistory.push({ time: now, x: player.x, y: player.y });
    player.playerHistory = player.playerHistory.filter((position) => now - position.time <= 1300);
    this.state.arena.enemies.forEach((enemy) => {
      if (!enemy.element.isConnected) return;
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.hypot(dx, dy);
      const personalSpace = 9;
      if (distance > Math.max(enemy.range, personalSpace) && !this.state.arena.paused) {
        const step = 0.06 * enemy.speed;
        enemy.x += (dx / distance) * step * player.enemySpeedMultiplier;
        enemy.y += (dy / distance) * step * player.enemySpeedMultiplier;
      } else if (distance <= Math.max(enemy.range, personalSpace) && now >= enemy.nextAttack && !this.state.arena.paused) {
        enemy.nextAttack = now + enemy.cooldown;
        this.enemyAttack(enemy, projectileLayer);
      }
      enemy.element.style.left = `${enemy.x}%`;
      enemy.element.style.top = `${enemy.y}%`;
      enemy.element.style.transform = `translate(-50%, -50%) rotate(${this.getEnemyFacing(enemy)}deg)`;
    });
    this.resolveEnemySeparation();
    this.fillEnemySlots(enemyLayer);
    document.querySelector('#arena-enemies-left').textContent = `Enemies Left: ${this.state.arena.enemies.length + this.state.arena.pendingEnemies}`;
    if (this.state.arena.enemies.length === 0 && this.state.arena.pendingTypes.length === 0 && !this.state.arena.waveCompleteQueued && !this.state.arena.paused) {
      this.state.arena.waveCompleteQueued = true;
      this.state.arena.wave += 1;
      this.state.lifetime.highestWave = Math.max(this.state.lifetime.highestWave, this.state.arena.wave);
      this.updateDailyQuest('wave', this.state.arena.wave, 'max');
      this.restorePlayerVitals();
      this.state.arena.paused = true;
      this.showUpgradePhase(document.querySelector('#arena-upgrade-phase'), document.querySelector('#arena-upgrade-cards'));
      document.querySelector('#arena-wave-number').textContent = `Wave ${this.state.arena.wave}`;
    }
    this.regenerateShield(now);
    this.updateProjectiles();
    this.updateFireTrails();
    this.updateAutoHealing(now);
    this.state.arena.enemyFrame = requestAnimationFrame(() => this.updateEnemies(enemyLayer, projectileLayer));
  },

  enemyAttack(enemy, projectileLayer) {
    const distance = Math.hypot(this.state.arena.x - enemy.x, this.state.arena.y - enemy.y);
    const isRanged = enemy.attackType === 'ranged' || (enemy.attackType === 'mixed' && distance > 9);
    enemy.element.classList.remove('is-attacking', 'is-firing');
    enemy.element.classList.remove('is-poking');
    if (!isRanged) {
      void enemy.element.offsetWidth;
      enemy.element.classList.add(enemy.type === 'spearer' ? 'is-poking' : 'is-attacking');
    }
    setTimeout(() => enemy.element.classList.remove('is-attacking', 'is-firing', 'is-poking'), 260);
    if (!isRanged) {
      this.playSoundEffect(enemy.type === 'assassin' || enemy.type === 'spearer' ? 'dagger' : 'sword');
      this.applyPlayerDamage(enemy.damage);
      return;
    }
    const target = this.getDelayedPlayerPosition(performance.now());
    const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    this.playSoundEffect('projectile');
    this.spawnProjectile(projectileLayer, enemy.x, enemy.y, angle, 'Arrow Projectile.png', enemy.type === 'boss' ? 25 : enemy.damage, null, false);
  },

  spawnProjectile(layer, x, y, angle, asset, damage, target, fromPlayer) {
    const element = document.createElement('img');
    element.className = `arena-projectile ${fromPlayer ? 'arena-projectile--player' : 'arena-projectile--enemy'}`;
    element.src = `Last Knight Assets/Projectile Models/${asset}`;
    element.alt = '';
    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
    element.style.transform = `translate(-50%, -50%) rotate(${angle * 180 / Math.PI}deg)`;
    layer.appendChild(element);
    this.state.arena.projectiles.push({ element, x, y, angle, damage, weapon: fromPlayer ? damage : null, target, bounces: 0, fromPlayer });
    return element;
  },

  updateProjectiles() {
    const arena = this.state.arena;
    const survivors = [];
    arena.projectiles.forEach((projectile) => {
      const speed = projectile.fromPlayer ? 1.35 : 0.8;
      projectile.x += Math.cos(projectile.angle) * speed;
      projectile.y += Math.sin(projectile.angle) * speed;
      const hitEnemy = projectile.fromPlayer && arena.enemies.find((enemy) => Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y) < 6);
      const hitPlayer = !projectile.fromPlayer && Math.hypot(arena.x - projectile.x, arena.y - projectile.y) < 5;
      if (hitEnemy) {
        this.damageEnemy(hitEnemy, projectile.damage, projectile.weapon);
        projectile.element.remove();
        return;
      }
      if (hitPlayer) {
        this.applyPlayerDamage(projectile.damage);
        projectile.element.remove();
        return;
      }
      const hitWall = projectile.x <= 15 || projectile.x >= 85 || projectile.y <= 20 || projectile.y >= 76;
      if (hitWall) {
        if (projectile.fromPlayer && arena.acquiredSpecials.has('bouncyProjectile') && projectile.bounces < 2) {
          if (projectile.x <= 15 || projectile.x >= 85) projectile.angle = Math.PI - projectile.angle;
          if (projectile.y <= 20 || projectile.y >= 76) projectile.angle = -projectile.angle;
          projectile.x = Math.max(15, Math.min(85, projectile.x));
          projectile.y = Math.max(20, Math.min(76, projectile.y));
          projectile.bounces += 1;
        } else {
          projectile.element.remove();
          return;
        }
      }
      projectile.element.style.left = `${projectile.x}%`;
      projectile.element.style.top = `${projectile.y}%`;
      projectile.element.style.transform = `translate(-50%, -50%) rotate(${projectile.angle * 180 / Math.PI}deg)`;
      survivors.push(projectile);
    });
    arena.projectiles = survivors;
  },

  getDelayedPlayerPosition(now) {
    const history = this.state.arena.playerHistory;
    const targetTime = now - 1000;
    let delayed = history[0] || { x: this.state.arena.x, y: this.state.arena.y };
    history.forEach((position) => {
      if (position.time <= targetTime) delayed = position;
    });
    return delayed;
  },

  applyPlayerDamage(amount) {
    const arena = this.state.arena;
    if (arena.gameOver) return;
    if (performance.now() < arena.immuneUntil) return;
    let remaining = amount;
    if (arena.currentShield > 0) {
      const absorbed = Math.min(arena.currentShield, remaining);
      arena.currentShield -= absorbed;
      remaining -= absorbed;
    }
    arena.currentHealth = Math.max(0, arena.currentHealth - remaining);
    arena.lastDamageAt = performance.now();
    this.renderStats();
    if (arena.currentHealth <= 0) this.showGameOver();
  },

  showGameOver() {
    const arena = this.state.arena;
    if (arena.gameOver) return;
    arena.gameOver = true;
    arena.paused = true;
    const total = Math.floor(arena.runCoins * (1 + arena.wave * 0.1));
    document.querySelector('#game-over-earned').textContent = `${arena.runCoins.toLocaleString()} Coins`;
    document.querySelector('#game-over-wave').textContent = arena.wave;
    document.querySelector('#game-over-total').textContent = `${total.toLocaleString()} Coins`;
    const overlay = document.querySelector('#arena-game-over');
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
  },

  collectGameOverCoins() {
    const arena = this.state.arena;
    const total = Math.floor(arena.runCoins * (1 + arena.wave * 0.1));
    this.addCoins(total);
    this.updateDailyQuest('runs', 1);
    arena.gameOver = false;
  },

  regenerateShield(now) {
    const arena = this.state.arena;
    if (!arena.lastDamageAt || now - arena.lastDamageAt < 5000 || arena.currentShield >= arena.stats.shield) return;
    arena.currentShield = Math.min(arena.stats.shield, arena.currentShield + 1 / 60);
    this.renderStats();
  },

  restorePlayerVitals() {
    const arena = this.state.arena;
    arena.currentHealth = arena.stats.health;
    arena.currentShield = arena.stats.shield;
    arena.lastDamageAt = 0;
    this.renderStats();
  },

  stopEnemySystem() {
    this.state.arena.spawnTimers.forEach((timer) => clearTimeout(timer));
    this.state.arena.spawnTimers = [];
    if (this.state.arena.enemyFrame) cancelAnimationFrame(this.state.arena.enemyFrame);
    this.state.arena.enemyFrame = null;
    clearInterval(this.state.arena.projectileTimer);
    this.state.arena.projectileTimer = null;
  },

  renderStats() {
    const stats = this.state.arena.stats;
    document.querySelector('#stat-health').textContent = `${Math.ceil(this.state.arena.currentHealth)} / ${Math.round(stats.health)}`;
    document.querySelector('#stat-shield').textContent = `${Math.floor(this.state.arena.currentShield)} / ${Math.round(stats.shield)}`;
    document.querySelector('#stat-damage').textContent = `x${stats.damage.toFixed(2)}`;
    document.querySelector('#stat-speed').textContent = `x${stats.speed.toFixed(2)}`;
    document.querySelector('#stat-crit').textContent = `${Math.round(stats.crit * 100)}%`;
    this.renderPlayerVitals(document.querySelector('#arena-player-vitals'));
  },

  renderStatsOverview(overview) {
    if (!overview) return;
    const totalSeconds = this.state.lifetime.playSeconds;
    const values = [
      ['Total Coins', this.state.lifetime.coins.toLocaleString()],
      ['Enemies Defeated', this.state.lifetime.enemies.toLocaleString()],
      ['Highest Wave', this.state.lifetime.highestWave.toString()],
      ['Play Time', this.formatPlayDuration(totalSeconds)],
    ];
    overview.innerHTML = values.map(([label, value]) => `<article class="stats-card"><small>${label}</small><strong>${value}</strong></article>`).join('');
  },

  formatPlayDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  },

  renderShopOffers(shopOffers) {
    const offers = [['$0.99', '2,000'], ['$2.99', '6,000'], ['$4.99', '10,000'], ['$9.99', '20,000'], ['$19.99', '40,000'], ['$29.99', '60,000']];
    shopOffers.innerHTML = offers.map(([price, coins]) => {
      const amount = price.replace('$', '');
      const paymentUrl = `https://paypal.me/BensonLiu2008/${amount}`;
      return `<article class="shop-offer"><div class="shop-offer-copy"><strong>${coins} Coins</strong><span>${price} USD</span></div><button type="button" data-payment-url="${paymentUrl}">PayPal</button></article>`;
    }).join('');
  },

  async renderLeaderboard(type, rows, tabs) {
    if (!rows) return;
    if (!this.authClient) {
      rows.innerHTML = '<div class="leaderboard-empty">Leaderboard unavailable</div>';
      return;
    }
    const scoreColumn = type === 'waves' ? 'highest_wave' : type === 'coins' ? 'lifetime_coins' : 'play_seconds';
    const { data, error } = await this.authClient.from('leaderboard_scores').select(`username,${scoreColumn}`).order(scoreColumn, { ascending: false }).limit(10);
    if (error) {
      rows.innerHTML = '<div class="leaderboard-empty">Leaderboard unavailable</div>';
      return;
    }
    const entries = data || [];
    const formatScore = (score) => type === 'playTime' ? this.formatPlayDuration(score) : score.toLocaleString();
    rows.innerHTML = entries.length
      ? entries.map((entry, index) => `<div class="leaderboard-row"><span>${index + 1}</span><strong>${entry.username}</strong><b>${formatScore(Number(entry[scoreColumn]) || 0)}</b></div>`).join('')
      : '<div class="leaderboard-empty">No scores yet</div>';
    tabs.forEach((tab) => {
      const selected = tab.dataset.leaderboardType === type;
      tab.classList.toggle('is-selected', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  },

  renderSkinOffers(skinOffers) {
    if (!skinOffers) return;
    const skins = [
      ['Brunswick', 'Brunswick Player Model'],
      ['Murrey', 'Murrey Player Model'],
      ['Ochre', 'Ochre Player Model'],
      ['Plackart', 'Plackart Player Model'],
      ['Russet', 'Russet Player Model'],
      ['Verdigris', 'Verdigris Player Model'],
    ];
    skinOffers.innerHTML = skins.map(([name, folder]) => {
      const owned = this.state.ownedSkins.includes(name);
      const affordable = this.state.coins >= 500;
      const equipped = this.state.equippedSkin === name;
      return `<article class="skin-offer">
        <img src="Last Knight Assets/Player Skin Models/${folder}/${name} Player Fists.png" alt="${name} skin">
        <div class="skin-offer-copy"><strong>${name}</strong><span>500 Coins</span></div>
        <button type="button" data-skin="${name}" ${equipped || (!owned && !affordable) ? 'disabled' : ''}>${equipped ? 'Equipped' : owned ? 'Equip' : 'Purchase'}</button>
      </article>`;
    }).join('');
  },

  purchaseSkin(name) {
    if (this.state.ownedSkins.includes(name) || this.state.coins < 500) return;
    this.setCoins(this.state.coins - 500);
    this.state.ownedSkins.push(name);
    this.updateAchievement('skin', 1);
    this.renderSkinOffers(document.querySelector('#skin-offers'));
    this.saveProgress();
  },

  equipSkin(name) {
    if (!this.state.ownedSkins.includes(name)) return;
    this.state.equippedSkin = name;
    this.renderSkinOffers(document.querySelector('#skin-offers'));
    this.saveProgress();
  },

  renderSpecialSlots() {
    const icons = { bouncyProjectile: '↻', lifeSteal: '♥', fireTrail: '♨', precision: '✦', autoHealing: '+' };
    document.querySelectorAll('.arena-special-slot').forEach((slot) => {
      const unlocked = this.state.arena.acquiredSpecials.has(slot.dataset.special);
      slot.disabled = !unlocked;
      slot.classList.toggle('is-unlocked', unlocked);
      slot.textContent = unlocked ? icons[slot.dataset.special] : '';
      slot.setAttribute('aria-label', unlocked ? `Unlocked ${slot.dataset.special}` : 'Locked special upgrade');
    });
  },

  renderArenaHotbar(arenaHotbar) {
    const slots = [
      ['sword', 'Default Player Sword.png', '1'],
      ['dagger', 'Default Player Dagger.png', '2'],
      ['javelin', 'Default Player Spear.png', '3'],
      ['crossbow', 'Default Player Crossbow.png', '4'],
    ];
    arenaHotbar.innerHTML = slots.map(([weapon, icon, key]) => {
      const unlocked = this.state.arena.unlockedWeapons.includes(weapon);
      const weaponImage = this.getPlayerModelPath(weapon);
      return `<button class="arena-hotbar__slot${weapon === this.state.arena.weapon ? ' is-selected' : ''}" data-weapon="${weapon}" ${unlocked ? '' : 'disabled'} aria-label="${weapon}"><img class="arena-hotbar__icon" src="${weaponImage}" alt="${weapon}"><span class="arena-hotbar__key">${key}</span></button>`;
    }).join('');
  },

  getPlayerModelPath(weapon) {
    const labels = { javelin: 'Spear' };
    const label = labels[weapon] || weapon[0].toUpperCase() + weapon.slice(1);
    if (!this.state.equippedSkin) return `Last Knight Assets/Player Skin Models/Default Player Model/Default Player ${label}.png`;
    return `Last Knight Assets/Player Skin Models/${this.state.equippedSkin} Player Model/${this.state.equippedSkin} Player ${label}.png`;
  },

  getEnemyFacing(enemy) {
    const facing = Math.atan2(this.state.arena.y - enemy.y, this.state.arena.x - enemy.x) * 180 / Math.PI;
    return this.getSpriteAngle(facing);
  },

  playerAttack(arenaPlayer, attackVisual) {
    const arena = this.state.arena;
    const weapons = {
      dagger: { base: 10, critical: 25, cooldown: 300, range: 10, arc: 42, effect: 'slashing', visualEffect: 'dagger-slashing' },
      sword: { base: 25, critical: 40, cooldown: 700, range: 11, arc: 72, effect: 'slashing' },
      javelin: { base: 35, critical: 60, cooldown: 1500, range: 16, arc: 24, effect: 'poking', projectile: 'Javelin Projectile.png' },
      crossbow: { base: 70, critical: 100, cooldown: 3000, range: 42, arc: 20, effect: 'shooting', projectile: 'Arrow Projectile.png' },
    };
    const weapon = weapons[arena.weapon] || weapons.sword;
    const now = performance.now();
    if (now < arena.nextAttackAt && now >= arena.noCooldownUntil) return;
    arena.nextAttackAt = now + weapon.cooldown / arena.stats.attackSpeed;
    this.playSoundEffect(weapon.projectile ? 'projectile' : arena.weapon === 'dagger' ? 'dagger' : 'sword');
    if (!weapon.projectile) this.renderPlayerAttack(attackVisual, weapon.visualEffect || weapon.effect);
    const facingRadians = this.state.arena.angle * Math.PI / 180;
    const targets = arena.enemies.filter((enemy) => {
      const dx = enemy.x - arena.x;
      const dy = enemy.y - arena.y;
      const distance = Math.hypot(dx, dy);
      const angleToEnemy = Math.atan2(dy, dx);
      const angleDifference = Math.abs(Math.atan2(Math.sin(angleToEnemy - facingRadians), Math.cos(angleToEnemy - facingRadians))) * 180 / Math.PI;
      const range = ['slashing', 'poking'].includes(weapon.effect) ? weapon.range * arena.stats.meleeRange : weapon.range;
      return distance <= range && angleDifference <= weapon.arc / 2;
    });
    if (weapon.projectile) {
      const target = targets[0]?.enemy;
      this.firePlayerProjectile(target, weapon);
      return;
    }
    targets.forEach((target) => this.damageEnemy(target, weapon));
  },

  firePlayerProjectile(target, weapon) {
    const projectileLayer = document.querySelector('#arena-projectiles');
    const angle = this.state.arena.angle * Math.PI / 180;
    this.spawnProjectile(projectileLayer, this.state.arena.x, this.state.arena.y, angle, weapon.projectile, weapon, target, true);
  },

  damageEnemy(target, weapon, projectileWeapon = null) {
    if (projectileWeapon) weapon = projectileWeapon;
    const isCritical = Math.random() < this.state.arena.stats.crit;
    const damage = typeof weapon === 'number' ? weapon : (isCritical ? weapon.critical : weapon.base) * this.state.arena.stats.damage;
    this.state.arena.hitCount += 1;
    const precisionCrit = this.state.arena.acquiredSpecials.has('precision') && this.state.arena.hitCount % 5 === 0;
    target.currentHp -= precisionCrit && typeof weapon !== 'number' ? weapon.critical * this.state.arena.stats.damage : damage;
    const wasCritical = precisionCrit || (isCritical && typeof weapon !== 'number');
    if (wasCritical) this.showCritSpark(target);
    if (wasCritical) this.updateAchievement('crits', 1);
    target.element.classList.add('is-hit');
    setTimeout(() => target.element.classList.remove('is-hit'), 140);
    if (target.currentHp <= 0) {
      this.addRunCoins(target.type);
      this.updateDailyQuest('kills', 1);
      if (target.type === 'boss') this.updateDailyQuest('boss', 1);
      this.state.lifetime.enemies += 1;
      this.updateAchievement('defeats', 1);
      if (this.state.arena.acquiredSpecials.has('lifeSteal')) this.state.arena.currentHealth = Math.min(this.state.arena.stats.health, this.state.arena.currentHealth + Math.max(1, Math.round(target.maxHp * 0.02)));
      target.element.classList.add('is-defeated');
      this.state.arena.enemies = this.state.arena.enemies.filter((enemy) => enemy !== target);
      setTimeout(() => target.element.remove(), 180);
    }
  },

  addRunCoins(enemyType) {
    const rewards = {
      soldier: [5, 10], assassin: [8, 12], archer: [8, 15], spearer: [12, 18],
      sniper: [15, 25], tank: [20, 35], boss: [100, 150],
    };
    const range = rewards[enemyType] || [0, 0];
    const coins = this.randomWholeNumber(range[0], range[1]);
    this.state.arena.runCoins += coins;
    this.updateDailyQuest('coins', coins);
    this.updateAchievement('coins', this.state.arena.runCoins);
    this.renderRunCoins();
  },

  updateAchievement(type, value) {
    this.state.arena.achievements.forEach((achievement) => {
      if (achievement.type === type) achievement.progress = Math.max(achievement.progress, value);
    });
    this.renderAchievements(document.querySelector('#achievement-list'));
    this.saveProgress();
  },

  syncAchievementsFromStats() {
    const values = {
      defeats: this.state.lifetime.enemies,
      wave: this.state.lifetime.highestWave,
      skin: this.state.ownedSkins.length > 0 ? 1 : 0,
      time: this.state.lifetime.playSeconds,
      lifetimeCoins: this.state.lifetime.coins,
    };
    this.state.arena.achievements.forEach((achievement) => {
      if (values[achievement.type] !== undefined) achievement.progress = Math.max(achievement.progress, values[achievement.type]);
    });
  },

  renderAchievements(list) {
    if (!list) return;
    this.syncAchievementsFromStats();
    list.innerHTML = this.state.arena.achievements.map((achievement) => {
      const progress = Math.min(achievement.progress, achievement.goal);
      const complete = progress >= achievement.goal;
      return `<article class="achievement-row"><div class="achievement-copy"><strong>${achievement.name}</strong><small>${achievement.subtitle}</small></div><div class="achievement-progress"><span style="width:${(progress / achievement.goal) * 100}%"></span></div><span class="achievement-check">${complete ? '✓' : ''}</span></article>`;
    }).join('');
  },

  renderSkills(tree) {
    const definitions = [
      ['health', 'Health', '100 HP', 10],
      ['shield', 'Armor', '25 Shield', 5],
      ['damage', 'Damage', 'x1.00', 0.1],
      ['speed', 'Speed', 'x1.00', 0.05],
    ];
    tree.innerHTML = definitions.map(([key, label, baseValue, increment]) => {
      const level = this.state.skills[key];
      const current = key === 'health' ? `${100 + level * increment} HP` : key === 'shield' ? `${25 + level * increment} Shield` : `x${(1 + level * increment).toFixed(2)}`;
      const nodes = [1, 2, 3, 4, 5].map((tier) => {
        const price = 200 * tier * (1 + (tier - 1) / 2);
        const available = level === tier - 1;
        return `<button class="skill-node${level >= tier ? ' is-unlocked' : ''}" data-skill="${key}" data-tier="${tier}" ${available ? '' : 'disabled'}><span>${level >= tier ? '✓' : tier}</span><small>${available ? `${price.toLocaleString()} Coins` : ''}</small></button>`;
      }).join('');
      return `<section class="skill-column skill-column--${key}"><h2>${label}</h2><strong class="skill-current">${current}</strong><div class="skill-chain">${nodes}</div></section>`;
    }).join('');
    tree.querySelectorAll('.skill-node').forEach((node) => node.addEventListener('click', () => this.buySkill(node.dataset.skill, Number(node.dataset.tier), tree)));
  },

  initializeSettings(panel) {
    const volume = panel.querySelector('#music-volume');
    const output = panel.querySelector('#music-volume-value');
    const codeInput = panel.querySelector('#redeem-code');
    const codeButton = panel.querySelector('#redeem-code-button');
    const status = panel.querySelector('#redeem-code-status');
    const savedVolume = Math.round(this.state.musicVolume * 100);
    volume.value = String(savedVolume);
    output.value = `${savedVolume}%`;
    output.textContent = `${savedVolume}%`;
    this.setAudioVolume(volume.value);
    volume.oninput = () => {
      output.value = `${volume.value}%`;
      output.textContent = `${volume.value}%`;
      this.setAudioVolume(volume.value);
      this.saveProgress();
    };
    codeButton.onclick = () => {
      const code = codeInput.value;
      status.className = '';
      if (!code) {
        status.textContent = 'Enter a code';
        status.classList.add('is-invalid');
        return;
      }
      if (code !== 'steelhacks') {
        status.textContent = 'Invalid code';
        status.classList.add('is-invalid');
        return;
      }
      if (this.state.redeemedCodes.includes(code)) {
        status.textContent = 'Code already redeemed';
        status.classList.add('is-invalid');
        return;
      }
      this.state.redeemedCodes.push(code);
      this.addCoins(200);
      status.textContent = 'Redeemed successfully: +200 Coins';
      status.classList.add('is-success');
      codeInput.value = '';
      this.saveProgress();
    };
  },

  buySkill(skill, tier, tree) {
    const price = 200 * tier * (1 + (tier - 1) / 2);
    if (this.state.skills[skill] !== tier - 1 || this.state.coins < price) return;
    this.setCoins(this.state.coins - price);
    this.state.skills[skill] = tier;
    this.renderSkills(tree);
    this.saveProgress();
  },

  renderRunCoins() {
    const runCoins = document.querySelector('#arena-run-coins');
    if (runCoins) runCoins.textContent = `${this.state.arena.runCoins.toLocaleString()} Coins`;
  },

  showCritSpark(target) {
    const spark = document.createElement('span');
    spark.className = 'arena-crit-spark';
    spark.style.left = `${target.x}%`;
    spark.style.top = `${target.y - 4}%`;
    document.querySelector('#arena-controls').appendChild(spark);
    setTimeout(() => spark.remove(), 260);
  },

  renderPlayerAttack(attackVisual, effect) {
    attackVisual.className = `arena-player-attack is-${effect}`;
    attackVisual.style.left = `${this.state.arena.x}%`;
    attackVisual.style.top = `${this.state.arena.y}%`;
    attackVisual.style.transform = `translate(-50%, -50%) rotate(${this.getSpriteAngle(this.state.arena.angle)}deg)`;
    setTimeout(() => { attackVisual.className = 'arena-player-attack'; }, 190);
  },

  getSpriteAngle(targetAngle) {
    return targetAngle - 30;
  },

  renderPlayerVitals(playerVitals) {
    if (!playerVitals) return;
    const arena = this.state.arena;
    playerVitals.style.left = `${arena.x}%`;
    playerVitals.style.top = `${arena.y - 9}%`;
    playerVitals.querySelector('#player-health-fill').style.width = `${Math.max(0, arena.currentHealth / arena.stats.health) * 100}%`;
    playerVitals.querySelector('#player-shield-fill').style.width = `${Math.max(0, arena.currentShield / arena.stats.shield) * 100}%`;
  },

  selectArenaWeapon(weapon, arenaPlayer, arenaHotbar) {
    if (!this.state.arena.unlockedWeapons.includes(weapon)) return;
    this.state.arena.weapon = weapon;
    const label = weapon[0].toUpperCase() + weapon.slice(1);
    arenaPlayer.src = this.getPlayerModelPath(weapon);
    arenaHotbar.querySelectorAll('.arena-hotbar__slot').forEach((slot) => slot.classList.toggle('is-selected', slot.dataset.weapon === weapon));
  },

  renderArenaPlayer(arenaPlayer) {
    arenaPlayer.style.left = `${this.state.arena.x}%`;
    arenaPlayer.style.top = `${this.state.arena.y}%`;
    arenaPlayer.style.transform = `translate(-50%, -50%) rotate(${this.getSpriteAngle(this.state.arena.angle)}deg)`;
    const forcefield = document.querySelector('#arena-forcefield');
    if (forcefield) {
      forcefield.style.left = `${this.state.arena.x}%`;
      forcefield.style.top = `${this.state.arena.y}%`;
    }
    this.renderPlayerVitals(document.querySelector('#arena-player-vitals'));
  },

  moveArenaPlayer(arenaPlayer) {
    const keys = this.state.arena.keys;
    const movement = 0.18 * this.state.arena.stats.speed;
    const bounds = { left: 15, right: 85, top: 20, bottom: 76 };
    if (keys.has('w')) this.state.arena.y -= movement;
    if (keys.has('s')) this.state.arena.y += movement;
    if (keys.has('a')) this.state.arena.x -= movement;
    if (keys.has('d')) this.state.arena.x += movement;
    this.state.arena.x = Math.max(bounds.left, Math.min(bounds.right, this.state.arena.x));
    this.state.arena.y = Math.max(bounds.top, Math.min(bounds.bottom, this.state.arena.y));
    this.resolvePlayerEnemyCollisions();
    this.clampArenaPosition(this.state.arena);
    if (this.state.arena.acquiredSpecials.has('fireTrail') && (keys.has('w') || keys.has('a') || keys.has('s') || keys.has('d'))) this.createFireTrail();
    this.renderArenaPlayer(arenaPlayer);
  },

  createFireTrail() {
    const now = performance.now();
    if (now - this.state.arena.fireTrailLastAt < 180) return;
    this.state.arena.fireTrailLastAt = now;
    const element = document.createElement('span');
    element.className = 'arena-floor-burn';
    element.style.left = `${this.state.arena.x}%`;
    element.style.top = `${this.state.arena.y}%`;
    document.querySelector('#arena-controls').appendChild(element);
    this.state.arena.fireTrails.push({ element, x: this.state.arena.x, y: this.state.arena.y, expires: now + 3500, hitAt: new Map() });
  },

  updateFireTrails() {
    const now = performance.now();
    this.state.arena.fireTrails = this.state.arena.fireTrails.filter((trail) => {
      if (trail.expires <= now) {
        trail.element.remove();
        return false;
      }
      this.state.arena.enemies.forEach((enemy) => {
        if (Math.hypot(enemy.x - trail.x, enemy.y - trail.y) < 5 && (trail.hitAt.get(enemy) || 0) <= now) {
          this.damageEnemy(enemy, { base: 1.5, critical: 1.5 });
          trail.hitAt.set(enemy, now + 500);
        }
      });
      return true;
    });
  },

  updateAutoHealing(now) {
    const arena = this.state.arena;
    if (!arena.acquiredSpecials.has('autoHealing') || arena.currentHealth >= arena.stats.health) return;
    arena.currentHealth = Math.min(arena.stats.health, arena.currentHealth + 0.01);
    this.renderStats();
  },

  clampArenaPosition(position) {
    const bounds = { left: 15, right: 85, top: 20, bottom: 76 };
    position.x = Math.max(bounds.left, Math.min(bounds.right, position.x));
    position.y = Math.max(bounds.top, Math.min(bounds.bottom, position.y));
  },

  resolvePlayerEnemyCollisions() {
    const minimumDistance = 9;
    this.state.arena.enemies.forEach((enemy) => {
      const dx = this.state.arena.x - enemy.x;
      const dy = this.state.arena.y - enemy.y;
      const distance = Math.hypot(dx, dy);
      if (distance === 0 || distance >= minimumDistance) return;
      const push = (minimumDistance - distance) / distance;
      this.state.arena.x += dx * push;
      this.state.arena.y += dy * push;
    });
  },

  resolveEnemySeparation() {
    const minimumDistance = 8;
    const enemies = this.state.arena.enemies;
    for (let firstIndex = 0; firstIndex < enemies.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < enemies.length; secondIndex += 1) {
        const first = enemies[firstIndex];
        const second = enemies[secondIndex];
        const dx = first.x - second.x;
        const dy = first.y - second.y;
        const distance = Math.hypot(dx, dy);
        if (distance === 0 || distance >= minimumDistance) continue;
        const push = (minimumDistance - distance) / distance / 2;
        first.x += dx * push;
        first.y += dy * push;
        second.x -= dx * push;
        second.y -= dy * push;
        this.clampArenaPosition(first);
        this.clampArenaPosition(second);
      }
    }
  },

  claimReward(index) {
    const reward = this.state.rewards[index];
    if (!reward || reward.claimed || !this.isRewardReady(reward)) return;
    reward.claimed = true;
    this.addCoins(reward.coins);
    this.renderRewards();
    this.saveProgress();
  },

  isRewardReady(reward) {
    return this.state.playTimeStartedAt !== null && Date.now() - this.state.playTimeStartedAt >= reward.minutes * 60000;
  },

  renderRewards() {
    const rewardsPanel = document.querySelector('#playtime-rewards');
    if (!rewardsPanel || !this.state.playTimeStartedAt) return;
    rewardsPanel.innerHTML = this.state.rewards.map((reward, index) => {
      const ready = this.isRewardReady(reward);
      const remaining = Math.max(0, reward.minutes * 60000 - (Date.now() - this.state.playTimeStartedAt));
      const totalSeconds = Math.ceil(remaining / 1000);
      const timeText = this.formatTime(totalSeconds);
      return `<article class="reward-card${ready && !reward.claimed ? ' is-ready' : ''}">
        <div class="reward-card__time">Play For ${reward.minutes < 60 ? `${reward.minutes} Minute${reward.minutes === 1 ? '' : 's'}` : '1 Hour'}</div>
        <div class="reward-card__reward">+${reward.coins.toLocaleString()} Coins</div>
        <div class="reward-card__timer">${timeText}</div>
        <button class="reward-card__claim" data-reward-index="${index}" ${!ready || reward.claimed ? 'disabled' : ''}>${reward.claimed ? 'Claimed' : 'Claim'}</button>
      </article>`;
    }).join('');
  },

  formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  },
};

window.LastKnightGame = LastKnightGame;
LastKnightGame.initializeMenu();
LastKnightGame.start();