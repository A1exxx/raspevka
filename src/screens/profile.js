// profile.js — экран профиля игрока: аватар, уровень XP, ачивки, статистика.
import * as progress from '../state/progress.js';

const AVATARS = ['🎤', '🦅', '🐦', '🦜', '🎸', '🌟', '🔥', '🎼', '👑', '🎧', '🦊', '🐺'];

export function renderProfile(app, { onExit }) {
  _render();

  function _render() {
    const profile = progress.getProfile();
    const avatar = profile.avatar || '🎤';
    const name = profile.name || '';
    const lvInfo = progress.getLevel();
    const xp = progress.getXp();
    const streak = progress.getStreak();
    const total = progress.getTotal();
    const breathBest = progress.getBreathBest();
    const range = progress.getRange();
    const rangeSt = range ? range.high - range.low : 0;
    const rangeLabel = range
      ? `${rangeSt} полутонов (${noteNameShort(range.low)}–${noteNameShort(range.high)})`
      : 'не определён';
    const unlocked = new Set(progress.getUnlockedAchievements());
    const examsPassed = progress.getExamsPassed().length;

    const achGrid = progress.ACHIEVEMENTS.map((a) => {
      const done = unlocked.has(a.id);
      return `
        <div class="ach-item ${done ? 'ach-unlocked' : 'ach-locked'}" title="${a.desc}">
          <div class="ach-icon">${done ? a.icon : '🔒'}</div>
          <div class="ach-name">${a.title}</div>
          ${!done ? `<div class="ach-desc">${a.desc}</div>` : ''}
        </div>`;
    }).join('');

    const xpToNext = lvInfo.nextMin ? lvInfo.nextMin - lvInfo.curMin - lvInfo.into : 0;

    app.innerHTML = `
      <div class="screen profile-screen">
        <div class="game-top">
          <button class="icon-btn" id="prof-back">‹ Назад</button>
        </div>

        <div class="prof-hero">
          <button class="prof-avatar-btn" id="prof-avatar" aria-label="Выбрать аватар">${avatar}</button>
          <div class="prof-avatar-hint">нажми чтобы изменить</div>
          <div class="prof-name-wrap">
            <input class="prof-name-input" id="prof-name" type="text"
              maxlength="32" placeholder="Как тебя зовут?" value="${escHtml(name)}">
          </div>
        </div>

        <div class="card prof-level-card">
          <div class="prof-level-head">
            <span class="prof-level-num">Ур. ${lvInfo.level}</span>
            <span class="prof-level-title">${lvInfo.title}</span>
            <span class="prof-xp-total">${xp} XP</span>
          </div>
          <div class="xp-bar-wrap xp-bar-wrap--lg">
            <div class="xp-bar-fill" style="width:${lvInfo.pct}%"></div>
          </div>
          <div class="prof-level-hint">
            ${lvInfo.nextMin
              ? `до уровня «${progress.LEVELS[lvInfo.level].title}» ещё ${xpToNext} XP`
              : 'Максимальный уровень — легенда!'}
          </div>
        </div>

        <div class="card prof-stats-card">
          <div class="prof-stats-title">Статистика</div>
          <div class="prof-stats-grid">
            <div class="prof-stat"><span class="prof-stat-val">${streak}</span><span class="prof-stat-lbl">стрик (дн.)</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${total}</span><span class="prof-stat-lbl">сессий</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${rangeLabel}</span><span class="prof-stat-lbl">диапазон</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${breathBest > 0 ? breathBest.toFixed(1) + ' с' : '—'}</span><span class="prof-stat-lbl">рекорд выдоха</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${examsPassed}</span><span class="prof-stat-lbl">экзаменов</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${unlocked.size}/${progress.ACHIEVEMENTS.length}</span><span class="prof-stat-lbl">наград</span></div>
          </div>
        </div>

        <div class="card prof-ach-card">
          <div class="prof-stats-title">Награды</div>
          <div class="ach-grid">${achGrid}</div>
        </div>

        <button class="btn btn-ghost" id="prof-exit" style="width:100%">← В меню</button>
      </div>
    `;

    document.getElementById('prof-back').addEventListener('click', onExit);
    document.getElementById('prof-exit').addEventListener('click', onExit);

    // Аватар — пикер
    let avatarIdx = AVATARS.indexOf(avatar);
    if (avatarIdx < 0) avatarIdx = 0;
    const avatarBtn = document.getElementById('prof-avatar');
    avatarBtn.addEventListener('click', () => {
      avatarIdx = (avatarIdx + 1) % AVATARS.length;
      const newAv = AVATARS[avatarIdx];
      avatarBtn.textContent = newAv;
      progress.setProfile({ avatar: newAv });
    });

    // Имя — сохраняем при потере фокуса и при Enter
    const nameInput = document.getElementById('prof-name');
    const saveName = () => progress.setProfile({ name: nameInput.value.trim() });
    nameInput.addEventListener('blur', saveName);
    nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { nameInput.blur(); } });
  }
}

function noteNameShort(midi) {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const oct = Math.floor(midi / 12) - 1;
  return NOTES[midi % 12] + oct;
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
