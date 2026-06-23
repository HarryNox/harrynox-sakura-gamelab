// =============================================
// MBTI Battle Game — Main Game Logic v2
// クリック進行 + MBTI相性強化版
// =============================================

// ----- Game State -----
const GS = {
  screen: 'title',
  party: [],
  partyHP: {},
  partyMaxHP: {},
  partyStatus: {},      // { type: { atkMult, defMult, shield, skip, doubleDmg, coverFor, specialUses } }
  selectedSlot: 0,
  currentRound: 0,
  totalRounds: 5,
  enemies: [],
  targetEnemyIdx: 0,
  battleLog: [],
  isAnimating: false,
  isPlayerTurn: true,
  isBossRound: false,
  pendingBuff: null,        // atk multiplier carried to next battle
  pendingDefBuff: null,     // def multiplier carried to next battle
  pendingEnemyDefDown: false,
  unlockedPairs: new Set(),
  testMode: false,
};

// ----- DOM -----
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

// ----- Init -----
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') || 'pc';
  document.body.classList.add(`mode-${mode}`);

  buildStarfield();
  loadProgress();
  initTitleScreen();
  showScreen('title');
  buildCharSelectScreen();
  $('gear-btn').addEventListener('click', openGearModal);
  setupTestModeCheat();
});

// ----- Test Mode Cheat -----
let cheatInput = "";
const CHEAT_CODE = "runasandaisuki";
function setupTestModeCheat() {
  document.addEventListener('keydown', (e) => {
    cheatInput += e.key;
    if (cheatInput.length > CHEAT_CODE.length) {
      cheatInput = cheatInput.slice(-CHEAT_CODE.length);
    }
    if (cheatInput === CHEAT_CODE) {
      GS.testMode = !GS.testMode;
      toggleTestMode();
      cheatInput = "";
    }
  });
}

function toggleTestMode() {
  const panel = $('test-mode-panel');
  if (!panel) return;
  if (GS.testMode) {
    panel.style.display = 'block';
    renderTestModePanel();
  } else {
    panel.style.display = 'none';
  }
}

function renderTestModePanel() {
  const panel = $('test-mode-panel');
  if (!panel || !GS.testMode) return;
  let html = `<h3>🔧 TEST MODE</h3>`;
  GS.party.forEach((type, idx) => {
    if (!type) return;
    html += `
      <div class="test-mode-row">
        <span class="test-mode-name">${type}</span>
        <button class="test-mode-btn" onclick="testModeChangeHP('${type}', ${idx}, -50)">-50</button>
        <button class="test-mode-btn" onclick="testModeChangeHP('${type}', ${idx}, 50)">+50</button>
        <button class="test-mode-btn" onclick="testModeChangeHP('${type}', ${idx}, 999)">FULL</button>
      </div>
    `;
  });
  panel.innerHTML = html;
}

window.testModeChangeHP = function(type, idx, amount) {
  if (amount === 999) {
    GS.partyHP[type] = GS.partyMaxHP[type];
  } else {
    GS.partyHP[type] = Math.max(0, Math.min(GS.partyMaxHP[type], GS.partyHP[type] + amount));
  }
  updatePartyHPBar(idx);
  if (GS.partyHP[type] > 0) {
    const u = $(`party-unit-${idx}`);
    if (u) u.classList.remove('dead-unit');
  }
};

// ----- Starfield -----
function buildStarfield() {
  const sf = $('starfield');
  for (let i = 0; i < 120; i++) {
    const s = el('div', 'star');
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--dur:${(Math.random()*4+2).toFixed(1)}s;--delay:-${(Math.random()*6).toFixed(1)}s;`;
    sf.appendChild(s);
  }
}

// ----- Screen Management -----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = $('screen-' + id);
  if (s) { s.classList.add('active'); GS.screen = id; }
}

// ============================================
// CLICK-TO-CONTINUE SYSTEM
// ============================================
// バトル画面の「続ける」ボタン
// Promise を返し、クリックされるまで待機
function waitForContinue(label = '▶ タップして続ける') {
  return new Promise(resolve => {
    enableActions(false);
    const area = $('battle-continue-area');
    area.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'continue-btn';
    btn.innerHTML = label;
    btn.onclick = () => {
      area.innerHTML = '';
      clearCompatPopup();
      resolve();
    };
    area.appendChild(btn);
    // 必ず画面内に表示されるようスクロール
    setTimeout(() => btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  });
}

function clearCompatPopup() {
  const area = $('compat-event-area');
  if (area) area.innerHTML = '';
}

// ============================================
// TITLE SCREEN
// ============================================
function initTitleScreen() {
  $('btn-adventure').addEventListener('click', () => showScreen('char-select'));
  $('btn-compatibility').addEventListener('click', () => { refreshCompatibilityScreen(); showScreen('compatibility'); });
  $('btn-credits').addEventListener('click', () => showScreen('credits'));
}

// ============================================
// CHARACTER SELECTION
// ============================================
function buildCharSelectScreen() {
  const slotsWrap = $('party-slots');
  slotsWrap.innerHTML = '';
  const slotLabels = ['⚔️ 勇者（あなた）','🧙 おとも１','🏹 おとも２','🛡️ おとも３'];
  for (let i = 0; i < 4; i++) {
    const slot = el('div', 'party-slot' + (i === 0 ? ' active' : ''));
    slot.dataset.slot = i;
    slot.innerHTML = `
      <div class="slot-label">${slotLabels[i]}</div>
      <div class="slot-content" id="slot-content-${i}">
        <span class="slot-empty">選択してください</span>
      </div>
    `;
    slot.addEventListener('click', () => selectSlot(i));
    slotsWrap.appendChild(slot);
  }

  const listWrap = $('mbti-list');
  listWrap.innerHTML = '';
  MBTI_LIST.forEach(type => {
    const d = MBTI_DATA[type];
    const btn = el('div', 'mbti-list-btn');
    btn.dataset.type = type;
    btn.style.borderColor = d.color + '55';
    btn.innerHTML = `<span class="mbti-code" style="color:${d.color}">${type}</span><span class="mbti-name-small">${d.name}</span>`;
    btn.addEventListener('click', () => selectMBTI(type));
    listWrap.appendChild(btn);
  });

  $('btn-depart').addEventListener('click', departAdventure);
  GS.selectedSlot = 0;
}

function selectSlot(i) {
  GS.selectedSlot = i;
  document.querySelectorAll('.party-slot').forEach((s, idx) => s.classList.toggle('active', idx === i));
}

function selectMBTI(type) {
  GS.party.forEach((t, idx) => { if (t === type) { GS.party[idx] = null; updateSlotUI(idx); } });
  GS.party[GS.selectedSlot] = type;
  updateSlotUI(GS.selectedSlot);
  showCharInfo(type);
  document.querySelectorAll('.mbti-list-btn').forEach(btn => btn.classList.toggle('selected', GS.party.includes(btn.dataset.type)));
  const nextEmpty = GS.party.findIndex((t, i) => i > GS.selectedSlot && !t);
  if (nextEmpty !== -1) selectSlot(nextEmpty);
  $('btn-depart').classList.toggle('hidden', GS.party.filter(Boolean).length < 4);
}

function updateSlotUI(slotIdx) {
  const content = $(`slot-content-${slotIdx}`);
  const type = GS.party[slotIdx];
  const slot = document.querySelector(`[data-slot="${slotIdx}"]`);
  if (!type) {
    content.innerHTML = '<span class="slot-empty">選択してください</span>';
    slot.classList.remove('filled');
    return;
  }
  const d = MBTI_DATA[type];
  content.innerHTML = `
    <div class="slot-char-sprite">${makeSpriteHTML(type, 'slot-img-' + slotIdx)}</div>
    <div class="slot-mbti" style="color:${d.color}">${type}</div>
    <div class="slot-name">${d.name}</div>
  `;
  slot.classList.add('filled');
}

function showCharInfo(type) {
  const panel = $('char-info-panel');
  const d = MBTI_DATA[type];
  panel.classList.add('visible');
  const maxStat = 135, atkMax = 32, defMax = 18;
  $('char-info-mbti').textContent = type;
  $('char-info-mbti').style.color = d.color;
  $('char-info-name').textContent = d.name;
  $('char-info-desc').textContent = d.description;
  const hpPct  = (d.stats.hp  / maxStat * 100).toFixed(0);
  const atkPct = (d.stats.attack / atkMax * 100).toFixed(0);
  const defPct = (d.stats.defense / defMax * 100).toFixed(0);
  $('stat-bar-hp').style.width  = hpPct  + '%'; $('stat-bar-hp').style.background  = `linear-gradient(90deg,${d.bgColor},${d.color})`; $('stat-val-hp').textContent  = d.stats.hp;
  $('stat-bar-atk').style.width = atkPct + '%'; $('stat-bar-atk').style.background = `linear-gradient(90deg,${d.bgColor},${d.color})`; $('stat-val-atk').textContent = d.stats.attack;
  $('stat-bar-def').style.width = defPct + '%'; $('stat-bar-def').style.background = `linear-gradient(90deg,${d.bgColor},${d.color})`; $('stat-val-def').textContent = d.stats.defense;
  $('char-special-name').textContent = d.special.name;
  $('char-special-desc').textContent = d.special.description;
  $('char-info-sprite-wrap').innerHTML = `<div class="char-info-sprite">${makeSpriteHTML(type, 'info-sprite')}</div>`;
}

function departAdventure() {
  if (GS.party.filter(Boolean).length < 4) return;
  GS.partyHP = {}; GS.partyMaxHP = {}; GS.partyStatus = {};
  GS.pendingBuff = null; GS.pendingDefBuff = null; GS.pendingEnemyDefDown = false;
  GS.party.forEach(type => {
    const hp = MBTI_DATA[type].stats.hp;
    GS.partyHP[type] = hp; GS.partyMaxHP[type] = hp; GS.partyStatus[type] = freshStatus();
  });
  GS.currentRound = 0; GS.isBossRound = false; GS.battleLog = [];
  unlockPairs(GS.party);
  initBattle();
  showScreen('battle');
}

function freshStatus() {
  return { atkMult: 1.0, defMult: 1.0, shield: false, skip: false, doubleDmg: false, coverFor: null, specialUses: 5 };
}

// ============================================
// BATTLE SYSTEM
// ============================================
function initBattle() {
  GS.isAnimating = false; GS.isPlayerTurn = true;
  clearCompatPopup();
  const area = $('battle-continue-area');
  if (area) area.innerHTML = '';

  if (GS.currentRound >= 4) {
    GS.isBossRound = true;
    GS.enemies = [{ ...BOSS_DATA, hp: BOSS_DATA.hp, maxHp: BOSS_DATA.hp, dead: false, defMult: 1.0 }];
  } else {
    const eData = ENEMY_DATA[GS.currentRound];
    GS.enemies = [];
    for (let i = 0; i < eData.count; i++) {
      GS.enemies.push({ ...eData, id: eData.id + '_' + i, hp: eData.hp, maxHp: eData.hp, dead: false, defMult: 1.0 });
    }
    GS.isBossRound = false;
  }
  GS.targetEnemyIdx = 0;

  // Apply pending buffs from road events
  if (GS.pendingBuff) {
    GS.party.forEach(t => { GS.partyStatus[t].atkMult *= GS.pendingBuff; });
    GS.pendingBuff = null;
  }
  if (GS.pendingDefBuff) {
    GS.party.forEach(t => { GS.partyStatus[t].defMult *= GS.pendingDefBuff; });
    GS.pendingDefBuff = null;
  }
  if (GS.pendingEnemyDefDown) {
    GS.enemies.forEach(e => { e.defMult = 0.5; });
    GS.pendingEnemyDefDown = false;
  }

  renderBattleScreen();
  if (GS.testMode) renderTestModePanel();
  const battleLabel = GS.isBossRound ? '⚠️ BOSS BATTLE' : `ROUND ${GS.currentRound + 1} / ${GS.totalRounds}`;
  addLog(`=== ${battleLabel} ===`, 'system');
  if (GS.isBossRound) addLog(`大魔王が現れた！！`, 'boss');
  enableActions(true);
}

function renderBattleScreen() {
  const pips = $('round-pips');
  pips.innerHTML = '';
  for (let i = 0; i < GS.totalRounds; i++) {
    pips.appendChild(el('div', 'round-pip' + (i < GS.currentRound ? ' done' : i === GS.currentRound ? ' current' : '')));
  }
  $('battle-round-label').textContent = GS.isBossRound ? '⚠️ BOSS BATTLE' : `ROUND ${GS.currentRound + 1} / ${GS.totalRounds}`;
  renderEnemyArea();
  renderPartyArea();
  $('battle-log').innerHTML = '';
  GS.battleLog = [];
}

function renderEnemyArea() {
  const area = $('enemy-area');
  area.innerHTML = '';
  GS.enemies.forEach((enemy, idx) => {
    const unit = el('div', 'enemy-unit selectable' + (enemy.dead ? ' enemy-dead' : '') + (idx === GS.targetEnemyIdx ? ' targeted' : ''));
    unit.id = `enemy-unit-${idx}`;
    unit.addEventListener('click', () => { if (!enemy.dead) { GS.targetEnemyIdx = idx; refreshTargeting(); }});
    const spriteWrap = el('div', 'enemy-sprite-wrap' + (GS.isBossRound ? ' boss-sprite' : ''));
    spriteWrap.id = `enemy-sprite-${idx}`;
    const sprite = el('div', 'enemy-sprite');
    sprite.innerHTML = makeEnemySpriteHTML(enemy);
    spriteWrap.appendChild(sprite);
    const hpWrap = el('div', 'hp-wrap');
    hpWrap.innerHTML = `
      <div class="hp-bar-label"><span>${enemy.name}</span><span id="enemy-hp-val-${idx}">${enemy.hp} / ${enemy.maxHp}</span></div>
      <div class="hp-bar-wrap"><div class="hp-bar ${hpColor(enemy.hp, enemy.maxHp)}" id="enemy-hp-bar-${idx}" style="width:${hpPct(enemy.hp,enemy.maxHp)}%"></div></div>
    `;
    unit.appendChild(spriteWrap);
    unit.appendChild(hpWrap);
    area.appendChild(unit);
  });
}

function renderPartyArea() {
  const area = $('party-area');
  area.innerHTML = '';
  GS.party.forEach((type, i) => {
    const d = MBTI_DATA[type];
    const hp = GS.partyHP[type], maxHp = GS.partyMaxHP[type];
    const isDead = hp <= 0, isHero = i === 0;
    const unit = el('div', `party-unit${isHero ? ' is-hero' : ''}${isDead ? ' dead-unit' : ''}`);
    unit.id = `party-unit-${i}`;
    unit.innerHTML = `
      <div class="party-sprite-wrap" id="party-sprite-wrap-${i}">
        <div class="party-sprite" id="party-sprite-${i}">${makeSpriteHTML(type, 'battle-sprite-' + i)}</div>
      </div>
      <div class="status-badges" id="status-badges-${i}"></div>
      <div class="hp-wrap">
        <div class="hp-bar-label">
          <span class="party-mbti-label" style="color:${d.color}">${type}</span>
          <span id="party-hp-val-${i}">${hp} / ${maxHp}</span>
        </div>
        <div class="hp-bar-wrap"><div class="hp-bar ${hpColor(hp, maxHp)}" id="party-hp-bar-${i}" style="width:${hpPct(hp, maxHp)}%"></div></div>
      </div>
      <div class="party-name-label">${d.name}</div>
    `;
    area.appendChild(unit);
  });
  updateSpecialBtnLabel();
}

function updateSpecialBtnLabel() {
  const heroType = GS.party[0];
  if (!heroType) return;
  const d = MBTI_DATA[heroType];
  const btn = $('btn-special');
  const badge = $('special-badge');
  if (btn) {
    const uses = GS.partyStatus[heroType].specialUses;
    btn.querySelector('.action-label').textContent = d.special.name;
    btn.querySelector('.action-desc').textContent  = d.special.description;
    btn.disabled = uses <= 0 || !GS.isPlayerTurn || GS.partyHP[heroType] <= 0;
    if (badge) {
      badge.textContent = `残 ${uses} 回`;
      badge.style.background = uses > 0 ? '#f59e0b' : '#6b7280';
    }
  }
}

function refreshTargeting() {
  document.querySelectorAll('.enemy-unit').forEach((u, idx) => u.classList.toggle('targeted', idx === GS.targetEnemyIdx));
}

function enableActions(enabled) {
  const heroDead = GS.partyHP[GS.party[0]] <= 0;
  ['btn-attack','btn-defend'].forEach(id => {
    const b = $(id);
    if (b) b.disabled = !enabled || heroDead;
  });
  
  const spBtn = $('btn-special');
  if (spBtn) {
    const heroType = GS.party[0];
    const uses = heroType ? GS.partyStatus[heroType].specialUses : 0;
    spBtn.disabled = !enabled || heroDead || uses <= 0;
  }
}

// ============================================
// PLAYER ACTIONS
// ============================================
window.playerAttack = async function() {
  if (!GS.isPlayerTurn || GS.isAnimating) return;
  if (GS.partyHP[GS.party[0]] <= 0) return;
  enableActions(false);
  GS.isAnimating = true;

  const heroType = GS.party[0];
  const d = MBTI_DATA[heroType];
  const targetIdx = getAliveEnemyIdx();
  if (targetIdx < 0) { GS.isAnimating = false; return; }

  const target = GS.enemies[targetIdx];
  let atkMult = GS.partyStatus[heroType].atkMult;
  if (GS.partyStatus[heroType].doubleDmg) { atkMult *= 2; GS.partyStatus[heroType].doubleDmg = false; }
  const dmg = calcDamage(d.stats.attack, atkMult, target.defense * target.defMult);

  await animAttack(`party-sprite-wrap-0`);
  await dealDamageToEnemy(targetIdx, dmg, false);
  addLog(`⚔️ ${heroType}(${d.name})の攻撃！ ${target.name}に ${dmg} ダメージ！`, 'attack');

  await processAfterPlayerAction();
};

window.playerSpecial = async function() {
  if (!GS.isPlayerTurn || GS.isAnimating) return;
  const heroType = GS.party[0];
  if (GS.partyHP[heroType] <= 0 || GS.partyStatus[heroType].specialUses <= 0) return;
  
  enableActions(false);
  GS.isAnimating = true;

  GS.partyStatus[heroType].specialUses--;
  updateSpecialBtnLabel();

  const d = MBTI_DATA[heroType];
  addLog(`✨ ${heroType}(${d.name})の特技「${d.special.name}」！`, 'buff');
  await animSpecial(`party-sprite-wrap-0`);
  await applySpecial(heroType, d.special, true);
  await delay(300);
  await processAfterPlayerAction();
};

window.playerDefend = async function() {
  if (!GS.isPlayerTurn || GS.isAnimating) return;
  if (GS.partyHP[GS.party[0]] <= 0) return;
  enableActions(false);
  GS.isAnimating = true;

  const heroType = GS.party[0];
  GS.partyStatus[heroType].defMult = 2.0;
  addLog(`🛡️ ${heroType}(${MBTI_DATA[heroType].name})は防御態勢をとった！`, 'buff');
  updateStatusBadges(0);
  await delay(300);
  await processAfterPlayerAction();
};

// ============================================
// BATTLE TURN FLOW (クリック進行)
// ============================================
// 主人公が死んでいるか判定
function isHeroDead() {
  return GS.party.length > 0 && GS.partyHP[GS.party[0]] <= 0;
}

async function processAfterPlayerAction() {
  if (allEnemiesDead()) { await onBattleVictory(); return; }

  // Companions act
  await companionsTurn();
  if (allEnemiesDead()) { await onBattleVictory(); return; }

  // MBTI Compatibility event (35% chance)
  if (Math.random() < 0.35) {
    await compatibilityEvent();

    // ★ 相性イベントで主人公が倒れた → 即ゲームオーバー
    if (isHeroDead()) {
      addLog('💀 主人公が相性の衝突で力尽きた！勇者なき冒険はここで終わる...', 'debuff');
      await delay(1800);
      await onBattleDefeat();
      return;
    }
    // 相性イベントで全敵を倒した場合
    if (allEnemiesDead()) { await onBattleVictory(); return; }
    // 相性イベントでパーティー全滅した場合
    if (allPartyDead()) { await onBattleDefeat(); return; }
  }

  // ▶ 「敵のターンへ」ボタン表示 → クリック待ち
  await waitForContinue('⚔️ 敵のターンへ ▶');

  // Enemy turn
  await enemyTurn();

  // Reset defense
  GS.party.forEach(t => { GS.partyStatus[t].defMult = 1.0; });

  // ★ 敵の攻撃で主人公が倒れた → ゲームオーバー（仲間が生き残っていても）
  if (isHeroDead()) {
    addLog('💀 主人公がやられた！勇者なき冒険はここで幕を閉じた...', 'debuff');
    await delay(1800);
    await onBattleDefeat();
    return;
  }

  if (allPartyDead()) { await onBattleDefeat(); return; }

  // ▶ 「次のターンへ」ボタン表示 → クリック待ち
  await waitForContinue('🛡️ 次のターンへ ▶');

  GS.isAnimating = false;
  GS.isPlayerTurn = true;
  enableActions(true);
}

// ============================================
// COMPANIONS TURN
// ============================================
async function companionsTurn() {
  for (let i = 1; i < GS.party.length; i++) {
    const type = GS.party[i];
    if (GS.partyHP[type] <= 0) continue;
    if (GS.partyStatus[type].skip) {
      GS.partyStatus[type].skip = false;
      updateStatusBadges(i);
      addLog(`😠 ${type}(${MBTI_DATA[type].name})は喧嘩の余波で動けない！`, 'debuff');
      continue;
    }
    const d = MBTI_DATA[type];
    await delay(200);

    if (Math.random() < 0.25 && GS.partyStatus[type].specialUses > 0) {
      GS.partyStatus[type].specialUses--;
      addLog(`✨ ${type}(${d.name})の特技「${d.special.name}」！`, 'buff');
      await animSpecial(`party-sprite-wrap-${i}`);
      await applySpecial(type, d.special, false);
    } else {
      const tIdx = getAliveEnemyIdx();
      if (tIdx < 0) break;
      let atkMult = GS.partyStatus[type].atkMult;
      if (GS.partyStatus[type].doubleDmg) { atkMult *= 2; GS.partyStatus[type].doubleDmg = false; }
      const dmg = calcDamage(d.stats.attack, atkMult, GS.enemies[tIdx].defense * GS.enemies[tIdx].defMult);
      await animAttack(`party-sprite-wrap-${i}`);
      await dealDamageToEnemy(tIdx, dmg, false);
      addLog(`⚔️ ${type}(${d.name})の攻撃！ ${GS.enemies[tIdx].name}に ${dmg} ダメージ！`, 'attack');
    }
    if (allEnemiesDead()) break;
  }
}

// ============================================
// MBTI COMPATIBILITY EVENT (強化版)
// ============================================
async function compatibilityEvent() {
  const alive = GS.party.filter(t => GS.partyHP[t] > 0);
  if (alive.length < 2) return;

  // Pick random pair
  const shuffled = alive.slice().sort(() => Math.random() - 0.5);
  const a = shuffled[0];
  const b = shuffled[1];

  const level = getCompatLevel(a, b);
  const templates = BATTLE_COMPAT_EVENTS[level];
  const tmpl = templates[Math.floor(Math.random() * templates.length)];

  // Show popup
  showCompatEventPopup(tmpl.title, tmpl.getDesc(a, b), level);
  addLog(`${tmpl.title} — ${tmpl.effectSummary(a, b)}`, 'event');

  await delay(200);

  // Apply effect
  await applyBattleCompatEffect(a, b, tmpl.key);
}

async function applyBattleCompatEffect(a, b, key) {
  const iA = GS.party.indexOf(a);
  const iB = GS.party.indexOf(b);
  const dA = MBTI_DATA[a];
  const dB = MBTI_DATA[b];

  switch (key) {
    // ----- 相性✗ WORST EVENTS -----
    case 'friendly_fire': {
      // AがBを攻撃してしまう
      const dmg = Math.max(1, Math.floor(dA.stats.attack * 0.7));
      addLog(`😱 ${a}の怒りが${b}に！ ${dmg}ダメージ！（友軍誤射）`, 'debuff');
      await animAttack(`party-sprite-wrap-${iA}`);
      await animDamage(`party-sprite-wrap-${iB}`);
      GS.partyHP[b] = Math.max(0, GS.partyHP[b] - dmg);
      showDmgFloat(`party-unit-${iB}`, `-${dmg}`, 'dmg-damage');
      updatePartyHPBar(iB);
      if (GS.partyHP[b] <= 0) {
        addLog(`💀 ${b}(${MBTI_DATA[b].name})が倒れた...！`, 'debuff');
        const u = $(`party-unit-${iB}`);
        if (u) u.classList.add('dead-unit');
      }
      break;
    }
    case 'both_stun': {
      // 両者が次ターン行動不能 + 小ダメージ
      const dmg = 8;
      GS.partyStatus[a].skip = true; GS.partyStatus[b].skip = true;
      GS.partyHP[a] = Math.max(1, GS.partyHP[a] - dmg);
      GS.partyHP[b] = Math.max(1, GS.partyHP[b] - dmg);
      updatePartyHPBar(iA); updatePartyHPBar(iB);
      updateStatusBadges(iA); updateStatusBadges(iB);
      showDmgFloat(`party-unit-${iA}`, `-${dmg}`, 'dmg-damage');
      showDmgFloat(`party-unit-${iB}`, `-${dmg}`, 'dmg-damage');
      await animDamage(`party-sprite-wrap-${iA}`);
      await animDamage(`party-sprite-wrap-${iB}`);
      addLog(`😵 ${a}と${b}は次のターン行動不能！`, 'debuff');
      break;
    }
    case 'enemy_extra_hit': {
      // Aが敵の追加攻撃を食らう
      const enemy = GS.enemies.find(e => !e.dead);
      if (enemy) {
        const raw = Math.floor(enemy.attack * 0.9);
        const dmg = Math.max(1, raw - Math.floor(dA.stats.defense * 0.4));
        addLog(`💥 集中力ゼロ！${a}が無防備に敵の攻撃を食らった！ ${dmg}ダメージ！`, 'debuff');
        await animDamage(`party-sprite-wrap-${iA}`);
        GS.partyHP[a] = Math.max(0, GS.partyHP[a] - dmg);
        showDmgFloat(`party-unit-${iA}`, `-${dmg}`, 'dmg-damage');
        updatePartyHPBar(iA);
        if (GS.partyHP[a] <= 0) {
          addLog(`💀 ${a}(${dA.name})が倒れた...`, 'debuff');
          const u = $(`party-unit-${iA}`);
          if (u) u.classList.add('dead-unit');
        }
      }
      break;
    }
    case 'party_atk_down': {
      GS.party.forEach((t, i) => {
        if (GS.partyHP[t] > 0) {
          GS.partyStatus[t].atkMult = Math.max(0.4, GS.partyStatus[t].atkMult * 0.75);
          updateStatusBadges(i);
        }
      });
      addLog(`⬇️ パーティー全員の攻撃力が低下...`, 'debuff');
      break;
    }

    // ----- 相性△ CAUTION EVENTS -----
    case 'ab_atk_down': {
      GS.partyStatus[a].atkMult = Math.max(0.5, GS.partyStatus[a].atkMult * 0.7);
      GS.partyStatus[b].atkMult = Math.max(0.5, GS.partyStatus[b].atkMult * 0.7);
      updateStatusBadges(iA); updateStatusBadges(iB);
      addLog(`⬇️ ${a}と${b}の攻撃力が低下...`, 'debuff');
      break;
    }
    case 'party_drain': {
      const dmg = 8;
      GS.party.forEach((t, i) => {
        if (GS.partyHP[t] > 0) {
          GS.partyHP[t] = Math.max(1, GS.partyHP[t] - dmg);
          updatePartyHPBar(i);
        }
      });
      addLog(`🌀 ギクシャクした空気でパーティー全員が消耗...`, 'debuff');
      break;
    }

    // ----- 相性○ GOOD EVENTS -----
    case 'heal_b': {
      // 死亡している場合は回復しない
      if (GS.partyHP[b] <= 0) {
        addLog(`💔 ${b}は倒れていて${a}の激励が届かない...`, 'debuff');
      } else {
        healPartyMember(b, 20, iB);
        addLog(`💚 ${a}の激ましで${b}のHPが20回復！`, 'heal');
      }
      break;
    }
    case 'ab_def_buff': {
      GS.partyStatus[a].defMult = Math.min(3.0, GS.partyStatus[a].defMult * 1.5);
      GS.partyStatus[b].defMult = Math.min(3.0, GS.partyStatus[b].defMult * 1.5);
      updateStatusBadges(iA); updateStatusBadges(iB);
      addLog(`🛡️ ${a}と${b}の防御力がアップ！`, 'buff');
      break;
    }
    case 'b_atk_buff': {
      GS.partyStatus[b].atkMult = Math.min(2.5, GS.partyStatus[b].atkMult * 1.4);
      updateStatusBadges(iB);
      addLog(`⬆️ ${b}の攻撃力が大幅アップ！`, 'buff');
      break;
    }

    // ----- 相性◎ BEST EVENTS -----
    case 'combo_attack': {
      const tIdx = getAliveEnemyIdx();
      if (tIdx >= 0) {
        const dmgA = calcDamage(dA.stats.attack, GS.partyStatus[a].atkMult, GS.enemies[tIdx].defense * GS.enemies[tIdx].defMult, true);
        await animAttack(`party-sprite-wrap-${iA}`);
        await dealDamageToEnemy(tIdx, dmgA, false);
        addLog(`⚔️ ${a}の連携攻撃！ ${dmgA}ダメージ！`, 'buff');
        if (!GS.enemies[tIdx].dead) {
          const dmgB = calcDamage(dB.stats.attack, GS.partyStatus[b].atkMult, GS.enemies[tIdx].defense * GS.enemies[tIdx].defMult, true);
          await animAttack(`party-sprite-wrap-${iB}`);
          await dealDamageToEnemy(tIdx, dmgB, false);
          addLog(`⚔️ ${b}も連携攻撃！ ${dmgB}ダメージ！`, 'buff');
        }
      }
      break;
    }
    case 'b_covers_a': {
      // BがAを守る（Bにシールドを付与 + ログ表示）
      GS.partyStatus[b].shield = true;
      GS.partyStatus[b].coverFor = a;
      updateStatusBadges(iB);
      await animSpecial(`party-sprite-wrap-${iB}`);
      addLog(`🛡️ ${b}が${a}の前に立ちはだかった！次の攻撃を身代わりに受ける！`, 'buff');
      break;
    }
    case 'party_atk_buff': {
      GS.party.forEach((t, i) => {
        if (GS.partyHP[t] > 0) {
          GS.partyStatus[t].atkMult = Math.min(2.5, GS.partyStatus[t].atkMult * 1.4);
          updateStatusBadges(i);
        }
      });
      await animSpecial(`party-sprite-wrap-${iA}`);
      await animSpecial(`party-sprite-wrap-${iB}`);
      addLog(`⬆️ シナジー爆発！パーティー全員の攻撃力が大幅アップ！`, 'buff');
      break;
    }
    case 'b_extra_special': {
      if (GS.partyHP[b] > 0) {
        addLog(`✨ ${b}がインスピレーションで追加特技「${dB.special.name}」を発動！`, 'buff');
        await animSpecial(`party-sprite-wrap-${iB}`);
        await applySpecial(b, dB.special, false);
      }
      break;
    }
  }
}

// compat event popup を表示
function showCompatEventPopup(title, desc, level) {
  const area = $('compat-event-area');
  if (!area) return;
  const clsMap = { best: 'popup-best', good: 'popup-good', caution: 'popup-caution', worst: 'popup-worst' };
  area.innerHTML = `
    <div class="compat-event-popup ${clsMap[level] || ''}">
      <div class="event-popup-title">${title}</div>
      <div class="event-popup-desc">${desc}</div>
    </div>
  `;
}

// ============================================
// SPECIAL ABILITY EFFECTS
// ============================================
async function applySpecial(casterType, special, isHero) {
  const d = MBTI_DATA[casterType];

  switch (special.type) {
    case 'all_attack':
      for (let i = 0; i < GS.enemies.length; i++) {
        if (GS.enemies[i].dead) continue;
        const dmg = calcDamage(d.stats.attack, special.power, GS.enemies[i].defense * GS.enemies[i].defMult, true);
        await dealDamageToEnemy(i, dmg, false);
        addLog(`→ ${GS.enemies[i].name}に ${dmg} ダメージ！`, 'attack');
      }
      break;
    case 'self_buff_double':
      GS.partyStatus[casterType].doubleDmg = true;
      updateStatusBadges(GS.party.indexOf(casterType));
      addLog(`⬆️ ${casterType}の次の攻撃が2倍になる！`, 'buff');
      break;
    case 'party_attack_buff':
      GS.party.forEach((t, i) => {
        if (GS.partyHP[t] > 0) { GS.partyStatus[t].atkMult = special.power; updateStatusBadges(i); }
      });
      addLog(`⬆️ パーティー全員の攻撃力が${special.power}倍になった！`, 'buff');
      break;
    case 'enemy_def_down': {
      const tIdx = getAliveEnemyIdx();
      if (tIdx >= 0) { GS.enemies[tIdx].defMult = special.power; addLog(`⬇️ ${GS.enemies[tIdx].name}の防御が半減！`, 'debuff'); }
      break;
    }
    case 'party_heal':
      GS.party.forEach((t, i) => { if (GS.partyHP[t] > 0) healPartyMember(t, special.power, i); });
      addLog(`💚 パーティー全員が${special.power}回復！`, 'heal');
      break;
    case 'random_power': {
      const tIdx = getAliveEnemyIdx();
      if (tIdx >= 0) {
        const mult = special.power[0] + Math.random() * (special.power[1] - special.power[0]);
        const dmg = calcDamage(d.stats.attack, mult, GS.enemies[tIdx].defense * GS.enemies[tIdx].defMult, true);
        await dealDamageToEnemy(tIdx, dmg, mult > 1.5);
        addLog(`${mult > 1.5 ? '💥 大爆発！' : '😅 やや弱い...'} ${dmg}ダメージ！`, mult > 1.5 ? 'buff' : 'attack');
      }
      break;
    }
    case 'party_heal_and_buff':
      GS.party.forEach((t, i) => {
        if (GS.partyHP[t] > 0) { healPartyMember(t, special.power, i); GS.partyStatus[t].atkMult = 1.3; updateStatusBadges(i); }
      });
      addLog(`💚 全員${special.power}回復＋攻撃力が上がった！`, 'buff');
      break;
    case 'random_target_big': {
      const tIdx = getAliveEnemyIdx();
      if (tIdx >= 0) {
        const dmg = calcDamage(d.stats.attack, special.power, GS.enemies[tIdx].defense * GS.enemies[tIdx].defMult, true);
        await dealDamageToEnemy(tIdx, dmg, true);
        addLog(`💥 超大ダメージ${dmg}！！`, 'buff');
      }
      break;
    }
    case 'party_shield':
      GS.party.forEach((t, i) => { if (GS.partyHP[t] > 0) { GS.partyStatus[t].shield = true; updateStatusBadges(i); } });
      addLog(`🛡️ 鉄壁の守り！次の攻撃を完全ガード！`, 'buff');
      break;
    case 'party_def_buff':
      GS.party.forEach((t, i) => { if (GS.partyHP[t] > 0) { GS.partyStatus[t].defMult = special.power; updateStatusBadges(i); } });
      addLog(`🛡️ パーティー全員の防御が${special.power}倍に！`, 'buff');
      break;
    case 'single_heal_max': {
      let minHP = Infinity, minIdx = 0;
      GS.party.forEach((t, i) => { if (GS.partyHP[t] > 0 && GS.partyHP[t] < minHP) { minHP = GS.partyHP[t]; minIdx = i; } });
      healPartyMember(GS.party[minIdx], special.power, minIdx);
      addLog(`💚 ${GS.party[minIdx]}を${special.power}回復！`, 'heal');
      break;
    }
    case 'critical_attack': {
      const tIdx = getAliveEnemyIdx();
      if (tIdx >= 0) {
        const crit = Math.random() < 0.8;
        const dmg = calcDamage(d.stats.attack, crit ? special.power : 1.0, GS.enemies[tIdx].defense * GS.enemies[tIdx].defMult, crit);
        await dealDamageToEnemy(tIdx, dmg, crit);
        addLog(`${crit ? '💥 クリティカル！ ' : ''}${dmg}ダメージ！`, crit ? 'buff' : 'attack');
      }
      break;
    }
    case 'gamble_attack': {
      const tIdx = getAliveEnemyIdx();
      if (tIdx >= 0) {
        if (Math.random() < 0.5) {
          const dmg = calcDamage(d.stats.attack, special.power, GS.enemies[tIdx].defense * GS.enemies[tIdx].defMult, true);
          await dealDamageToEnemy(tIdx, dmg, true);
          addLog(`🎲 大当たり！！ ${dmg}の超ダメージ！！`, 'buff');
        } else {
          showDmgFloat(`enemy-unit-${tIdx}`, 'MISS', 'dmg-miss');
          addLog(`🎲 大外れ...ミス！`, 'debuff');
        }
      }
      break;
    }
    case 'party_heal_random_buff':
      GS.party.forEach((t, i) => {
        if (GS.partyHP[t] > 0) {
          healPartyMember(t, special.power, i);
          GS.partyStatus[t].atkMult = Math.min(2.0, GS.partyStatus[t].atkMult * 1.2);
          updateStatusBadges(i);
        }
      });
      addLog(`🎉 全員${special.power}回復＋ランダムバフ発動！`, 'buff');
      break;
    default:
      break;
  }
}

// ============================================
// ENEMY TURN
// ============================================
async function enemyTurn() {
  for (let i = 0; i < GS.enemies.length; i++) {
    const enemy = GS.enemies[i];
    if (enemy.dead) continue;
    await delay(300);

    const aliveParty = GS.party.map((t, pi) => ({ t, pi })).filter(p => GS.partyHP[p.t] > 0);
    if (aliveParty.length === 0) return;
    const tgt = aliveParty[Math.floor(Math.random() * aliveParty.length)];

    const useSpecial = GS.isBossRound
      ? (Math.random() < 0.45)
      : (enemy.specials && enemy.specials.length > 0 && enemy.hp < enemy.maxHp * 0.5 && Math.random() < 0.35);

    if (useSpecial && enemy.specials && enemy.specials.length > 0) {
      const sp = enemy.specials[Math.floor(Math.random() * enemy.specials.length)];
      addLog(`⚠️ ${enemy.name}の「${sp.name}」！ ${sp.description}`, 'boss');
      if (sp.allTarget) {
        for (const { t, pi } of aliveParty) {
          const raw = Math.floor(enemy.attack * sp.damage);
          const dmg = applyPartyDefense(t, raw, pi);
          await enemyHitParty(t, pi, dmg);
          if (sp.debuff) { GS.partyStatus[t].atkMult = Math.max(0.5, GS.partyStatus[t].atkMult * 0.8); updateStatusBadges(pi); }
        }
      } else {
        const raw = Math.floor(enemy.attack * sp.damage);
        const dmg = applyPartyDefense(tgt.t, raw, tgt.pi);
        await enemyHitParty(tgt.t, tgt.pi, dmg);
        if (sp.lifesteal) {
          const heal = Math.floor(dmg * sp.lifesteal);
          GS.enemies[i].hp = Math.min(GS.enemies[i].maxHp, GS.enemies[i].hp + heal);
          updateEnemyHPBar(i);
          addLog(`🩸 ${enemy.name}がHP${heal}を吸収した！`, 'debuff');
        }
      }
    } else {
      const raw = Math.floor(enemy.attack * (0.85 + Math.random() * 0.3));
      const dmg = applyPartyDefense(tgt.t, raw, tgt.pi);
      addLog(`⚔️ ${enemy.name}の攻撃！ ${tgt.t}に ${dmg} ダメージ！`, 'attack');
      await enemyHitParty(tgt.t, tgt.pi, dmg);
    }
    if (allPartyDead()) return;
  }
}

function applyPartyDefense(type, rawDmg, partyIdx) {
  const status = GS.partyStatus[type];
  // Check if B is covering for A (type)
  const coverer = GS.party.find(t => t !== type && GS.partyStatus[t].coverFor === type && GS.partyStatus[t].shield);
  if (coverer) {
    const covererIdx = GS.party.indexOf(coverer);
    addLog(`🛡️ ${coverer}が${type}をかばった！`, 'buff');
    GS.partyStatus[coverer].shield = false;
    GS.partyStatus[coverer].coverFor = null;
    updateStatusBadges(covererIdx);
    // Damage goes to coverer instead
    const defMult = GS.partyStatus[coverer].defMult;
    return applyPartyDefenseInternal(coverer, covererIdx, rawDmg, defMult, true);
  }
  if (status.shield) {
    addLog(`🛡️ ${type}のシールドが攻撃をガード！`, 'buff');
    status.shield = false; status.coverFor = null;
    updateStatusBadges(partyIdx);
    return 0;
  }
  return Math.max(1, Math.floor(rawDmg / status.defMult));
}

function applyPartyDefenseInternal(coverer, covererIdx, rawDmg, defMult, shieldUsed) {
  const dmg = Math.max(1, Math.floor(rawDmg / defMult));
  GS.partyHP[coverer] = Math.max(0, GS.partyHP[coverer] - dmg);
  showDmgFloat(`party-unit-${covererIdx}`, `-${dmg}`, 'dmg-damage');
  updatePartyHPBar(covererIdx);
  if (GS.partyHP[coverer] <= 0) {
    addLog(`💀 ${coverer}が倒れた...`, 'debuff');
    const u = $(`party-unit-${covererIdx}`);
    if (u) u.classList.add('dead-unit');
  }
  return 0; // original target takes 0
}

async function enemyHitParty(type, partyIdx, dmg) {
  const enemyIdx = GS.enemies.findIndex(e => !e.dead);
  if (enemyIdx >= 0) await animAttack(`enemy-sprite-${enemyIdx}`);
  await animDamage(`party-sprite-wrap-${partyIdx}`);
  if (dmg > 0) {
    GS.partyHP[type] = Math.max(0, GS.partyHP[type] - dmg);
    showDmgFloat(`party-unit-${partyIdx}`, `-${dmg}`, 'dmg-damage');
  } else {
    showDmgFloat(`party-unit-${partyIdx}`, 'GUARD!', 'dmg-miss');
  }
  updatePartyHPBar(partyIdx);
  if (GS.partyHP[type] <= 0) {
    addLog(`💀 ${type}(${MBTI_DATA[type].name})は倒れた...`, 'debuff');
    const u = $(`party-unit-${partyIdx}`);
    if (u) u.classList.add('dead-unit');
  }
}

// ============================================
// BATTLE OUTCOMES
// ============================================
async function onBattleVictory() {
  GS.isAnimating = true;
  enableActions(false);
  if (GS.isBossRound) {
    addLog(`🏆 大魔王を倒した！世界に平和が訪れた！！`, 'system');
    await delay(1200);
    showGameClear();
  } else {
    addLog(`🎉 勇者たちは勝利した！先へ進むようです…`, 'system');
    await delay(1000);
    GS.currentRound++;
    showRoadEvent();
  }
}

async function onBattleDefeat() {
  // UI を即クリーン（操作不能ボタン・ポップアップを除去）
  enableActions(false);
  const ca = $('battle-continue-area');
  if (ca) ca.innerHTML = '';
  clearCompatPopup();

  if (!isHeroDead()) {
    // 主人公生存のまま全滅（念のため）
    addLog('💀 パーティーは全滅した...', 'system');
  }
  await delay(1500);
  showScreen('game-over');
  renderGameOver();
}

// ============================================
// ROAD EVENTS (パーティー組み合わせ対応版)
// ============================================
function showRoadEvent() {
  const event = generatePartyRoadEvent();
  applyRoadEventEffect(event);
  renderEventScreen(event);
  showScreen('event');
}

// パーティーの組み合わせに基づいてイベントを動的生成
function generatePartyRoadEvent() {
  const party = GS.party.filter(Boolean);
  const pool = []; // { weight, event }

  // ----- Pair-based events -----
  for (let i = 0; i < party.length; i++) {
    for (let j = i + 1; j < party.length; j++) {
      const a = party[i], b = party[j];
      const level = getCompatLevel(a, b);
      const templates = ROAD_EVENT_PAIR_TEMPLATES[level] || [];
      templates.forEach(tmpl => {
        pool.push({
          weight: (level === 'worst' || level === 'best') ? 3 : 2,
          event: {
            title: tmpl.title,
            description: tmpl.getDesc(a, b),
            effectText: tmpl.effectText,
            effect: { ...tmpl.effect }
          }
        });
      });
    }
  }

  // ----- Member-based events -----
  party.forEach(type => {
    const tmpl = ROAD_EVENT_MEMBER_TEMPLATES[type];
    if (tmpl) {
      pool.push({
        weight: 2,
        event: {
          title: tmpl.title,
          description: tmpl.getDesc(type),
          effectText: tmpl.effectText,
          effect: { ...tmpl.effect }
        }
      });
    }
  });

  // ----- Generic events -----
  ROAD_EVENTS_GENERIC.forEach(e => pool.push({ weight: 1, event: e }));

  // Weighted random pick
  const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const entry of pool) {
    rand -= entry.weight;
    if (rand <= 0) return entry.event;
  }
  return pool[pool.length - 1].event;
}

function applyRoadEventEffect(event) {
  const e = event.effect;
  // 死亡していないメンバーのみに回復を適用するヘルパー
  const healAlive = (t, amt) => {
    if (GS.partyHP[t] > 0)
      GS.partyHP[t] = Math.min(GS.partyMaxHP[t], GS.partyHP[t] + amt);
  };
  switch (e.type) {
    case 'heal_all':
      GS.party.forEach(t => healAlive(t, e.amount));
      break;
    case 'damage_all':
      // ダメージは死亡者には当たらない
      GS.party.forEach(t => { if (GS.partyHP[t] > 0) GS.partyHP[t] = Math.max(1, GS.partyHP[t] - e.amount); });
      break;
    case 'atk_buff_all':
      GS.pendingBuff = e.amount;
      break;
    case 'heal_and_atk_buff':
      GS.party.forEach(t => healAlive(t, e.heal));
      GS.pendingBuff = e.atkBuff;
      break;
    case 'heal_and_def_buff':
      GS.party.forEach(t => healAlive(t, e.heal));
      GS.pendingDefBuff = e.defBuff;
      break;
    case 'quarrel_night':
      GS.party.forEach(t => { if (GS.partyHP[t] > 0) GS.partyHP[t] = Math.max(1, GS.partyHP[t] - e.damage); });
      GS.pendingBuff = e.atkDebuff;
      break;
    case 'heal_min_hp': {
      // HP最少の「生存中」のメンバーを回復
      let minIdx = -1, minHP = Infinity;
      GS.party.forEach((t, i) => {
        if (GS.partyHP[t] > 0 && GS.partyHP[t] < minHP) { minHP = GS.partyHP[t]; minIdx = i; }
      });
      if (minIdx >= 0) healAlive(GS.party[minIdx], e.amount);
      break;
    }
    case 'gamble':
      if (Math.random() < 0.5) {
        GS.party.forEach(t => healAlive(t, e.winHeal));
        event.effectText = `大当たり！生存者のHPが${e.winHeal}回復した！`;
      } else {
        GS.party.forEach(t => { if (GS.partyHP[t] > 0) GS.partyHP[t] = Math.max(1, GS.partyHP[t] - e.loseDamage); });
        event.effectText = `大外れ...生存者全員がHP${e.loseDamage}のダメージを受けた...`;
      }
      break;
    case 'heal_and_random_atk_buff':
      GS.party.forEach(t => healAlive(t, e.heal));
      GS.pendingBuff = 1.1 + Math.random() * 0.15;
      break;
    case 'enemy_def_pre_down':
      GS.pendingEnemyDefDown = true;
      break;
  }
}

function renderEventScreen(event) {
  const iconMatch = event.title.match(/^(\S+)\s/);
  const icon = iconMatch ? iconMatch[1] : '📜';
  const titleText = event.title.replace(/^\S+\s/, '');
  $('event-icon').textContent = icon;
  $('event-title').textContent = titleText;
  $('event-desc').textContent  = event.description;
  $('event-effect').textContent = event.effectText;

  const hpList = $('event-party-hp');
  hpList.innerHTML = '';
  GS.party.forEach(type => {
    const d = MBTI_DATA[type];
    const hp = GS.partyHP[type], maxHp = GS.partyMaxHP[type];
    const div = el('div', 'event-member');
    div.innerHTML = `<span style="color:${d.color};font-weight:700">${type}</span><span style="font-size:0.75rem;color:var(--text-secondary)"> HP: ${hp}/${maxHp}</span>`;
    hpList.appendChild(div);
  });

  const isBoss = GS.currentRound >= GS.totalRounds;
  $('event-next-round').textContent = isBoss ? '⚠️ BOSS BATTLE へ !!!' : `ROUND ${GS.currentRound + 1} へ進む →`;
  $('event-next-round').className = isBoss ? 'btn btn-danger btn-lg btn-full' : 'btn btn-primary btn-lg btn-full';
}

window.continueToNextBattle = function() {
  initBattle();
  showScreen('battle');
};

// ============================================
// GAME CLEAR / OVER
// ============================================
function showGameClear() {
  showScreen('game-clear');
  renderGameClear();
}

function renderGameClear() {
  const area = $('clear-party-area');
  area.innerHTML = '';
  GS.party.forEach(type => {
    const d = MBTI_DATA[type];
    const div = el('div', 'result-party-member');
    div.innerHTML = `
      <div class="rp-sprite">${makeSpriteHTML(type, 'clear-sprite-' + type)}</div>
      <div class="rp-mbti" style="color:${d.color}">${type}</div>
      <div class="rp-name">${d.name}</div>
      <div style="font-size:0.65rem;color:var(--text-secondary)">HP: ${GS.partyHP[type]}</div>
    `;
    area.appendChild(div);
  });
}

function renderGameOver() {
  const area = $('over-party-area');
  area.innerHTML = '';
  GS.party.forEach(type => {
    const d = MBTI_DATA[type];
    const div = el('div', 'result-party-member');
    div.innerHTML = `
      <div class="rp-sprite" style="opacity:${GS.partyHP[type] > 0 ? 1 : 0.35}">${makeSpriteHTML(type, 'over-sprite-' + type)}</div>
      <div class="rp-mbti" style="color:${d.color}">${type}</div>
      <div class="rp-name">${d.name}</div>
    `;
    area.appendChild(div);
  });
}

window.returnToTitle = function() {
  GS.party = new Array(4).fill(null);
  GS.selectedSlot = 0;
  for (let i = 0; i < 4; i++) { GS.party[i] = null; updateSlotUI(i); }
  document.querySelectorAll('.mbti-list-btn').forEach(b => b.classList.remove('selected'));
  $('btn-depart').classList.add('hidden');
  $('char-info-panel').classList.remove('visible');
  showScreen('title');
};

window.viewCompatibility = function() {
  refreshCompatibilityScreen();
  showScreen('compatibility');
};

// ============================================
// COMPATIBILITY SCREEN
// ============================================
function refreshCompatibilityScreen() {
  const grid = $('compat-grid');
  grid.innerHTML = '';
  MBTI_LIST.forEach(type => {
    const d = MBTI_DATA[type];
    const card = el('div', 'compat-card');
    const isUnlocked = GS.unlockedPairs.has(type);
    if (isUnlocked) {
      card.classList.add('unlocked');
      card.innerHTML = `
        <div class="compat-card-header">
          <div class="compat-sprite">${makeSpriteHTML(type, 'cs-' + type)}</div>
          <div><div class="compat-mbti" style="color:${d.color}">${type}</div><div class="compat-name">${d.name}</div></div>
        </div>
        <div class="compat-rows">
          ${makeCompatRow('◎', d.compatibility.best)}
          ${makeCompatRow('○', d.compatibility.good)}
          ${makeCompatRow('△', d.compatibility.caution)}
          ${makeCompatRow('✗', d.compatibility.worst)}
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="compat-card-header">
          <div class="compat-sprite" style="background:rgba(255,255,255,0.05);border-radius:8px;display:flex;align-items:center;justify-content:center;width:44px;height:44px">
            <span style="font-size:1.2rem;color:var(--text-dim)">？</span>
          </div>
          <div><div class="compat-mbti" style="color:var(--text-dim)">${type}</div><div class="compat-name" style="color:var(--text-dim)">${d.name}</div></div>
        </div>
        <div class="compat-locked">彼らの相性はまだわからない</div>
      `;
    }
    grid.appendChild(card);
  });
}

function makeCompatRow(mark, compat) {
  return `
    <div class="compat-row">
      <span class="compat-mark">${mark}</span>
      <div class="compat-text">
        <span class="compat-type">${compat.type}</span>
        <span style="color:var(--text-dim)"> • </span>
        <span class="compat-reason">${compat.reason}</span>
      </div>
    </div>
  `;
}

// ============================================
// GEAR / SETTINGS
// ============================================
function openGearModal() {
  const overlay = el('div', 'modal-overlay');
  overlay.id = 'gear-modal';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-title">⚙️ 設定</div>
      <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:15px;line-height:1.7">
        解放済みの相性データはブラウザに自動保存されます。<br>
        データを削除すると相性一覧が初期化されます。
      </div>
      <div class="modal-actions" style="flex-direction:column; gap:10px; margin-bottom: 20px;">
        <button class="btn btn-primary" onclick="returnToTitleFromGear()">🏠 タイトルへ戻る</button>
        <button class="btn btn-danger" onclick="clearSaveData()">🗑️ セーブデータを消去</button>
      </div>
      
      <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:15px; margin-bottom:15px;">
        <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:5px;">秘密のあいことば</div>
        <input type="password" id="gear-password" placeholder="あいことばを入力" style="width:100%; padding:8px; background:rgba(0,0,0,0.5); border:1px solid #444; color:#fff; border-radius:4px; text-align:center;">
      </div>

      <div class="modal-actions">
        <button class="btn btn-outline btn-full" onclick="closeGearModal()">閉じる</button>
      </div>
    </div>
  `;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeGearModal(); });
  document.body.appendChild(overlay);

  const pwdInput = $('gear-password');
  if (pwdInput) {
    pwdInput.addEventListener('input', (e) => {
      if (e.target.value === 'runasandaisuki') {
        GS.testMode = true;
        toggleTestMode();
        e.target.value = '';
        addLog('🔧 テストモードが有効化されました', 'system');
      }
    });
  }
}
window.closeGearModal = function() { const m = $('gear-modal'); if (m) m.remove(); };
window.clearSaveData = function() {
  localStorage.removeItem('mbti_battle_pairs');
  GS.unlockedPairs.clear();
  closeGearModal();
  alert('セーブデータを消去しました。');
};
window.returnToTitleFromGear = function() {
  closeGearModal();
  returnToTitle(); // game.js 内の既存関数
};

// ============================================
// HELPERS
// ============================================
function makeSpriteHTML(type, imgId) {
  const d = MBTI_DATA[type];
  return `
    <div class="char-sprite">
      <img src="images/${type}.png" id="${imgId}" alt="${type}"
           style="width:100%;height:100%;object-fit:contain;border-radius:inherit;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="char-sprite-placeholder" style="display:none;background:linear-gradient(135deg,${d.bgColor},${d.color}44)">
        <span class="sp-code" style="color:${d.color}">${type}</span>
        <span class="sp-name" style="color:${d.color}aa">${d.name}</span>
      </div>
    </div>
  `;
}

function makeEnemySpriteHTML(enemy) {
  const c = enemy.color || '#888';
  let imgPath = enemy.image;
  // If there are multiple enemies of the same type, use variant B for the 2nd one
  if (enemy.id.endsWith('_1')) {
    imgPath = imgPath.replace('A.png', 'B.png');
  }
  return `
    <img src="${imgPath}" alt="${enemy.name}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div style="display:none;width:100%;height:100%;background:linear-gradient(135deg,#1a1a1a,${c}55);border-radius:inherit;align-items:center;justify-content:center;flex-direction:column;gap:4px">
      <span style="font-size:2rem">👾</span><span style="font-size:0.65rem;color:${c}">${enemy.name}</span>
    </div>
  `;
}

function calcDamage(atk, mult, def, ignoreVariance) {
  const base = atk * mult;
  const variance = ignoreVariance ? 0 : (Math.random() * 10 - 5);
  return Math.max(1, Math.round(base - def * 0.5 + variance));
}

function hpPct(hp, max) { return Math.max(0, Math.min(100, hp / max * 100)).toFixed(1); }
function hpColor(hp, max) {
  const pct = hp / max;
  if (pct > 0.6) return 'hp-green';
  if (pct > 0.3) return 'hp-yellow';
  return 'hp-red';
}

function updatePartyHPBar(idx) {
  const type = GS.party[idx]; if (!type) return;
  const hp = GS.partyHP[type], max = GS.partyMaxHP[type];
  const bar = $(`party-hp-bar-${idx}`), val = $(`party-hp-val-${idx}`);
  if (bar) { bar.style.width = hpPct(hp, max) + '%'; bar.className = `hp-bar ${hpColor(hp, max)}`; }
  if (val) val.textContent = `${hp} / ${max}`;
  if (hp <= 0) { const u = $(`party-unit-${idx}`); if (u) u.classList.add('dead-unit'); }
}

function updateEnemyHPBar(idx) {
  const enemy = GS.enemies[idx]; if (!enemy) return;
  const bar = $(`enemy-hp-bar-${idx}`), val = $(`enemy-hp-val-${idx}`);
  if (bar) { bar.style.width = hpPct(enemy.hp, enemy.maxHp) + '%'; bar.className = `hp-bar ${hpColor(enemy.hp, enemy.maxHp)}`; }
  if (val) val.textContent = `${enemy.hp} / ${enemy.maxHp}`;
}

function updateStatusBadges(partyIdx) {
  const type = GS.party[partyIdx]; if (!type) return;
  const status = GS.partyStatus[type];
  const wrap = $(`status-badges-${partyIdx}`); if (!wrap) return;
  wrap.innerHTML = '';
  if (status.atkMult > 1.05) wrap.innerHTML += `<span class="status-badge badge-buff">ATK↑</span>`;
  if (status.atkMult < 0.95) wrap.innerHTML += `<span class="status-badge badge-debuff">ATK↓</span>`;
  if (status.defMult > 1.05) wrap.innerHTML += `<span class="status-badge badge-buff">DEF↑</span>`;
  if (status.shield)    wrap.innerHTML += `<span class="status-badge badge-shield">🛡️</span>`;
  if (status.skip)      wrap.innerHTML += `<span class="status-badge badge-debuff">行動不能</span>`;
  if (status.doubleDmg) wrap.innerHTML += `<span class="status-badge badge-buff">2x</span>`;
  if (status.coverFor)  wrap.innerHTML += `<span class="status-badge badge-shield">COVER</span>`;
}

function healPartyMember(type, amount, idx) {
  // 死亡しているキャラは回復しない
  if (GS.partyHP[type] <= 0) return;
  GS.partyHP[type] = Math.min(GS.partyMaxHP[type], GS.partyHP[type] + amount);
  updatePartyHPBar(idx);
  showDmgFloat(`party-unit-${idx}`, `+${amount}`, 'dmg-heal');
}

async function dealDamageToEnemy(idx, dmg, isCrit) {
  const enemy = GS.enemies[idx]; if (enemy.dead) return;
  enemy.hp = Math.max(0, enemy.hp - dmg);
  showDmgFloat(`enemy-unit-${idx}`, isCrit ? `💥${dmg}` : `${dmg}`, isCrit ? 'dmg-crit' : 'dmg-damage');
  updateEnemyHPBar(idx);
  if (enemy.hp <= 0) {
    enemy.dead = true;
    const u = $(`enemy-unit-${idx}`); if (u) u.classList.add('enemy-dead');
    addLog(`💀 ${enemy.name}を倒した！`, 'buff');
    GS.targetEnemyIdx = getAliveEnemyIdx();
    refreshTargeting();
  } else {
    await animDamage(`enemy-sprite-${idx}`);
  }
}

function showDmgFloat(parentId, text, cls) {
  const parent = $(parentId); if (!parent) return;
  const rect = parent.getBoundingClientRect();
  const float = el('div', `dmg-float ${cls}`, text);
  float.style.cssText = `left:${rect.left + rect.width / 2 - 20}px;top:${rect.top + rect.height / 4}px;`;
  document.body.appendChild(float);
  setTimeout(() => float.remove(), 950);
}

function addLog(msg, type = 'attack') {
  const log = $('battle-log'); if (!log) return;
  const entry = el('div', `log-entry log-${type}`, msg);
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
  GS.battleLog.push({ msg, type });
}

function getAliveEnemyIdx() {
  let idx = GS.targetEnemyIdx;
  if (!GS.enemies[idx] || GS.enemies[idx].dead) idx = GS.enemies.findIndex(e => !e.dead);
  return idx;
}

function getCompatLevel(a, b) {
  const cA = MBTI_DATA[a]?.compatibility;
  if (!cA) return 'good';
  if (cA.best.type === b)    return 'best';
  if (cA.good.type === b)    return 'good';
  if (cA.caution.type === b) return 'caution';
  if (cA.worst.type === b)   return 'worst';
  const cB = MBTI_DATA[b]?.compatibility;
  if (!cB) return 'good';
  if (cB.best.type === a)    return 'best';
  if (cB.good.type === a)    return 'good';
  if (cB.caution.type === a) return 'caution';
  if (cB.worst.type === a)   return 'worst';
  return 'good';
}

function allEnemiesDead() { return GS.enemies.every(e => e.dead); }
function allPartyDead()   { return GS.party.every(t => GS.partyHP[t] <= 0); }

// ----- Animations -----
function animAttack(elId) {
  return new Promise(resolve => {
    const e = $(elId); if (!e) { resolve(); return; }
    e.classList.add('anim-jump');
    setTimeout(() => { e.classList.remove('anim-jump'); resolve(); }, 420);
  });
}
function animDamage(elId) {
  return new Promise(resolve => {
    const e = $(elId); if (!e) { resolve(); return; }
    e.classList.add('anim-shake');
    setTimeout(() => { e.classList.remove('anim-shake'); resolve(); }, 420);
  });
}
function animSpecial(elId) {
  return new Promise(resolve => {
    const e = $(elId); if (!e) { resolve(); return; }
    e.classList.add('anim-flash');
    setTimeout(() => { e.classList.remove('anim-flash'); resolve(); }, 520);
  });
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ----- LocalStorage -----
function saveProgress() {
  // localStorage.setItem('mbti_battle_pairs', JSON.stringify(Array.from(GS.unlockedPairs)));
}
function loadProgress() {
  // try {
  //   const saved = localStorage.getItem('mbti_battle_pairs');
  //   if (saved) GS.unlockedPairs = new Set(JSON.parse(saved));
  // } catch (e) { GS.unlockedPairs = new Set(); }
}
function unlockPairs(party) {
  party.filter(Boolean).forEach(type => GS.unlockedPairs.add(type));
}
