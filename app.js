const clubs = [
  { name:'Galatasaray', country:'Türkiye', league:'Süper Lig', strength:84 },
  { name:'Fenerbahçe', country:'Türkiye', league:'Süper Lig', strength:82 },
  { name:'Beşiktaş', country:'Türkiye', league:'Süper Lig', strength:78 },
  { name:'Real Madrid', country:'İspanya', league:'La Liga', strength:92 },
  { name:'Barcelona', country:'İspanya', league:'La Liga', strength:90 },
  { name:'Manchester City', country:'İngiltere', league:'Premier League', strength:92 },
  { name:'Arsenal', country:'İngiltere', league:'Premier League', strength:88 },
  { name:'Bayern Münih', country:'Almanya', league:'Bundesliga', strength:91 },
  { name:'Borussia Dortmund', country:'Almanya', league:'Bundesliga', strength:85 },
  { name:'Juventus', country:'İtalya', league:'Serie A', strength:84 },
  { name:'Inter', country:'İtalya', league:'Serie A', strength:88 },
  { name:'PSG', country:'Fransa', league:'Ligue 1', strength:89 },
  { name:'Benfica', country:'Portekiz', league:'Primeira Liga', strength:82 },
  { name:'Ajax', country:'Hollanda', league:'Eredivisie', strength:80 }
];

const state = {
  week: 1,
  club: null,
  player: null,
  matches: 0,
  goals: 0,
  assists: 0,
  wins: 0,
  title: null,
  table: [],
  achievements: [],
  log: []
};

const $ = (id) => document.getElementById(id);

function announce(message) {
  $('announcer').textContent = '';
  window.setTimeout(() => { $('announcer').textContent = message; }, 30);
}

function renderClubOptions() {
  $('club-select').innerHTML = clubs.map((club, index) =>
    `<option value="${index}">${club.name} — ${club.country}, ${club.league}</option>`
  ).join('');
}

function createTable(club) {
  const rivals = clubs.filter(c => c.league === club.league).slice(0, 6);
  if (!rivals.some(c => c.name === club.name)) rivals.push(club);
  state.table = rivals.map((c, i) => ({ name:c.name, played:0, won:0, drawn:0, lost:0, points:0, gd:0, strength:c.strength }));
}

function overall(player) {
  return Math.round((player.pace + player.shooting + player.passing + player.defending + player.fitness) / 5);
}

function renderPlayer() {
  const p = state.player;
  $('player-heading').textContent = p.name;
  $('player-summary').innerHTML = `
    <div><dt>Kulüp</dt><dd>${state.club.name}</dd></div>
    <div><dt>Mevki</dt><dd>${p.position}</dd></div>
    <div><dt>Ülke</dt><dd>${state.club.country}</dd></div>
    <div><dt>Lig</dt><dd>${state.club.league}</dd></div>
    <div><dt>Genel</dt><dd>${overall(p)}</dd></div>
    <div><dt>Piyasa değeri</dt><dd>€${p.value}M</dd></div>
    <div><dt>Sözleşme</dt><dd>${p.contract} hafta</dd></div>
  `;
}

function renderStats() {
  $('career-stats').innerHTML = `
    <div><dt>Maç</dt><dd>${state.matches}</dd></div>
    <div><dt>Gol</dt><dd>${state.goals}</dd></div>
    <div><dt>Asist</dt><dd>${state.assists}</dd></div>
    <div><dt>Galibiyet</dt><dd>${state.wins}</dd></div>
    <div><dt>Hız</dt><dd>${state.player.pace}</dd></div>
    <div><dt>Şut</dt><dd>${state.player.shooting}</dd></div>
    <div><dt>Pas</dt><dd>${state.player.passing}</dd></div>
    <div><dt>Savunma</dt><dd>${state.player.defending}</dd></div>
    <div><dt>Fizik</dt><dd>${state.player.fitness}</dd></div>
  `;
}

function renderTable() {
  const sorted = [...state.table].sort((a,b) => b.points-a.points || b.gd-a.gd);
  $('league-table').innerHTML = `<table><caption>Puan durumu</caption>
    <thead><tr><th scope="col">Takım</th><th scope="col">O</th><th scope="col">G</th><th scope="col">B</th><th scope="col">M</th><th scope="col">Averaj</th><th scope="col">P</th></tr></thead>
    <tbody>${sorted.map(t => `<tr><td>${t.name}</td><td>${t.played}</td><td>${t.won}</td><td>${t.drawn-t.drawn}</td><td>${t.lost}</td><td>${t.gd}</td><td>${t.points}</td></tr>`).join('')}</tbody>
  </table>`;
}

function renderLog() {
  $('match-log').innerHTML = state.log.slice(-5).reverse().map(item => `<p>${item}</p>`).join('');
}

function renderAchievements() {
  $('achievements').innerHTML = state.achievements.length
    ? state.achievements.map(a => `<li>${a}</li>`).join('')
    : '<li>Henüz başarı yok.</li>';
}

function transferValue() {
  const base = overall(state.player) - 55;
  return Math.max(1, Math.round((1.2 + base * 0.12) * 10) / 10);
}

function renderTransfers() {
  const offers = clubs.filter(c => c.name !== state.club.name && c.strength >= state.club.strength - 8)
    .sort((a,b) => b.strength-a.strength).slice(0,4);
  $('transfer-list').innerHTML = offers.map((club, i) =>
    `<button type="button" data-transfer="${clubs.indexOf(club)}">${club.name} — ${club.league} / €${transferValue()}M</button>`
  ).join('<br>');
  document.querySelectorAll('[data-transfer]').forEach(button => {
    button.addEventListener('click', () => transferTo(clubs[Number(button.dataset.transfer)]));
  });
}

function transferTo(club) {
  const level = overall(state.player);
  if (club.strength > level + 15) {
    announce(`${club.name}, oyuncunun yeterli olmadığını söylüyor. Transfer teklifini alamadınız.`);
    return;
  }
  state.club = club;
  state.player.contract = 52;
  state.player.value = transferValue();
  createTable(club);
  renderAll();
  announce(`${club.name} kulübüne transfer oldunuz.`);
}

function addAchievement(text) {
  if (!state.achievements.includes(text)) {
    state.achievements.push(text);
    announce(`Yeni başarı: ${text}`);
  }
}

function renderAll() {
  $('week').textContent = state.week;
  renderPlayer();
  renderStats();
  renderTable();
  renderLog();
  renderTransfers();
  renderAchievements();
}

function train(attribute, label) {
  const p = state.player;
  if (p.fitness < 35) {
    announce('Fizik çok düşük. Maç oynamadan dinlenemezsiniz.');
    return;
  }
  p[attribute] = Math.min(99, p[attribute] + 2);
  p.fitness = Math.max(20, p.fitness - 4);
  p.value = transferValue();
  state.week++;
  p.contract--;
  state.log.push(`Hafta ${state.week - 1}: ${label} antrenmanı yaptınız. ${attribute === 'pace' ? 'Hız' : attribute === 'shooting' ? 'Şut' : 'Pas'} ${p[attribute]} oldu.`);
  if (overall(p) >= 75) addAchievement('Yeteneği 75 seviyeye çıkardın');
  renderAll();
  announce(`${label} antrenmanı tamamlandı. ${attribute === 'pace' ? 'Hız' : attribute === 'shooting' ? 'Şut' : 'Pas'}: ${p[attribute]}.`);
}

function playMatch() {
  const rival = state.table.find(t => t.name !== state.club.name) || state.table[0];
  const teamEntry = state.table.find(t => t.name === state.club.name);
  const playerOverall = overall(state.player);
  const teamChance = (state.club.strength + playerOverall) / 2;
  const randomShift = Math.floor(Math.random()*21)-10;
  const scoreFor = Math.max(0, Math.round((teamChance + randomShift - rival.strength + 20) / 34));
  const scoreAgainst = Math.max(0, Math.round((rival.strength - teamChance + randomShift + 12) / 38));

  state.matches++;
  state.week++;
  state.player.fitness = Math.max(15, state.player.fitness - 8);
  state.player.contract--;

  const goalChance = state.player.shooting + state.player.pace + Math.random()*30;
  const assistChance = state.player.passing + Math.random()*25;
  const goals = goalChance > 125 ? (Math.random() > .65 ? 2 : 1) : 0;
  const assists = assistChance > 105 && Math.random() > .5 ? 1 : 0;
  state.goals += goals;
  state.assists += assists;

  teamEntry.played++;
  rival.played++;
  teamEntry.gd += scoreFor-scoreAgainst;
  rival.gd += scoreAgainst-scoreFor;

  let result;
  if (scoreFor > scoreAgainst) {
    teamEntry.won++; teamEntry.points += 3; rival.lost++; state.wins++; result='Kazandınız';
  } else if (scoreFor === scoreAgainst) {
    teamEntry.drawn++; teamEntry.points += 1; rival.drawn++; rival.points += 1; result='Berabere kaldınız';
  } else {
    teamEntry.lost++; rival.won++; rival.points += 3; result='Kaybettiniz';
  }

  const personal = `${goals ? goals + ' gol' : 'gol yok'}${assists ? ', ' + assists + ' asist' : ''}`;
  const message = `Hafta ${state.week-1}: ${state.club.name} ${scoreFor}-${scoreAgainst} ${rival.name}. ${result}. Bireysel performans: ${personal}.`;
  state.log.push(message);

  if (state.goals >= 10) addAchievement('10 gol barajını aş');
  if (state.matches >= 10) addAchievement('10 profesyonel maç');
  if (state.wins >= 5) addAchievement('5 lig galibiyeti');
  if (state.week >= 34) {
    const champion = [...state.table].sort((a,b) => b.points-a.points)[0];
    if (champion.name === state.club.name) {
      addAchievement(`${state.club.league} şampiyonu`);
      state.title = state.club.league;
    }
  }

  state.player.value = transferValue();
  renderAll();
  announce(message);
}

$('create-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.club = clubs[Number(data.get('club'))];
  state.player = {
    name:String(data.get('name')).trim(),
    position:String(data.get('position')),
    pace:Number(data.get('pace')),
    shooting:Number(data.get('shooting')),
    passing:Number(data.get('passing')),
    defending:Number(data.get('defending')),
    fitness:Number(data.get('fitness')),
    contract:52,
    value:1
  };
  state.player.value = transferValue();
  createTable(state.club);
  $('screen-create').hidden = true;
  $('screen-game').hidden = false;
  state.log.push('Kariyer başladı. İlk maçını oynamaya hazırsın!');
  renderAll();
  $('game-title').focus?.();
  announce(`${state.player.name} olarak kariyer başladı. Kulüp ${state.club.name}.`);
  window.scrollTo(0,0);
});

['pace','shooting','passing','defending','fitness'].forEach(id => {
  $(id).addEventListener('input', () => { $(`${id}-out`).textContent = $(id).value; });
});

$('train-pace').addEventListener('click', () => train('pace','Hız'));
$('train-shooting').addEventListener('click', () => train('shooting','Şut'));
$('train-passing').addEventListener('click', () => train('passing','Pas'));
$('play-match').addEventListener('click', playMatch);

$('contrast-toggle').addEventListener('click', () => {
  const enabled = document.body.classList.toggle('high-contrast');
  $('contrast-toggle').setAttribute('aria-pressed', String(enabled));
  $('contrast-toggle').textContent = enabled ? 'Yüksek kontrastı kapat' : 'Yüksek kontrastı aç';
  announce(enabled ? 'Yüksek kontrast açıldı.' : 'Yüksek kontrast kapatıldı.');
});

renderClubOptions();
