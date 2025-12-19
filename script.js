// State
let players = [];
let targets = [];

// Constants
const STORAGE_KEY = 'team_building_app_v1';

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderAll();
});

function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        players = parsed.players || [];
        targets = parsed.targets || [];
    } else {
        // Initial Demo Data (optional, remove if unwanted, but good for first impresssion)
        if (players.length === 0 && targets.length === 0) {
            targets = [
                { id: 1, name: '入口雕塑', score: 3 },
                { id: 2, name: '山顶凉亭', score: 5 },
                { id: 3, name: '神秘宝箱', score: 8 }
            ];
            players = [
                { id: 1, name: '张三', score: 0, visited: [] },
                { id: 2, name: '李四', score: 0, visited: [] }
            ];
        }
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, targets }));
    renderAll();
}

function renderAll() {
    renderLeaderboard();
    renderSidebarTargets();
}

// Render Leaderboard
function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';

    // Sort: Score DESC, then Name ASC
    const sortedPlayers = [...players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
    });

    sortedPlayers.forEach((p, index) => {
        const row = document.createElement('div');
        row.className = 'player-row';
        // Add minimal delay for animation stagger
        row.style.animationDelay = `${index * 0.05}s`;

        row.innerHTML = `
            <div class="player-rank">#${index + 1}</div>
            <div class="player-name">${escapeHtml(p.name)}</div>
            <div class="player-score">${p.score}</div>
            <div style="display: flex; justify-content: center;">
                <button class="action-btn" onclick="openScoreModal(${p.id})" title="打卡">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </button>
            </div>
        `;
        list.appendChild(row);
    });
}

// Render Sidebar Target List
function renderSidebarTargets() {
    const container = document.getElementById('targetListPreview');
    if (targets.length === 0) {
        container.innerHTML = '<p>暂无目标，请添加</p>';
        return;
    }

    container.innerHTML = targets.map(t => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05)">
            <span>${escapeHtml(t.name)}</span>
            <span style="color: var(--accent-color); font-weight: bold;">${t.score}分</span>
        </div>
    `).join('');
}

// Actions
function addPlayer() {
    const input = document.getElementById('newPlayerName');
    const name = input.value.trim();
    if (!name) return showToast('请输入姓名');

    players.push({
        id: Date.now(),
        name: name,
        score: 0,
        visited: []
    });
    
    input.value = '';
    closeModal('addPlayerModal');
    saveData();
    showToast(`已添加参与者: ${name}`);
}

function addTarget() {
    const nameInput = document.getElementById('newTargetName');
    const scoreInput = document.getElementById('newTargetScore');
    
    const name = nameInput.value.trim();
    const score = parseInt(scoreInput.value);

    if (!name) return showToast('请输入目标名称');
    if (!score || score < 1) return showToast('请输入有效的分数');

    targets.push({
        id: Date.now(),
        name: name,
        score: score
    });

    nameInput.value = '';
    scoreInput.value = '1';
    closeModal('addTargetModal');
    saveData();
    showToast(`已添加目标: ${name}`);
}

let currentPlayerId = null;

function openScoreModal(pid) {
    currentPlayerId = pid;
    const player = players.find(p => p.id === pid);
    if (!player) return;

    document.getElementById('currentScoringPlayer').innerText = `正在为 [${player.name}] 打卡`;
    
    const grid = document.getElementById('scoreTargetList');
    grid.innerHTML = '';

    if (targets.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">暂无目标可打卡</p>';
    }

    targets.forEach(t => {
        const isVisited = player.visited.includes(t.id);
        const btn = document.createElement('div');
        btn.className = `target-chip ${isVisited ? 'selected' : ''}`;
        if (isVisited) {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.innerHTML = `${t.name} <div class="target-points">已完成</div>`;
        } else {
            btn.onclick = () => confirmScore(t.id);
            btn.innerHTML = `${t.name} <div class="target-points">+${t.score} 分</div>`;
        }
        grid.appendChild(btn);
    });

    openModal('addScoreModal');
}

function confirmScore(tid) {
    const player = players.find(p => p.id === currentPlayerId);
    const target = targets.find(t => t.id === tid);
    
    if (player && target) {
        if (player.visited.includes(tid)) return; // Double check

        player.score += target.score;
        player.visited.push(tid);
        
        saveData();
        closeModal('addScoreModal');
        showToast(`${player.name} 打卡成功！+${target.score}分`);
    }
}

function resetGame() {
    if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
        players = [];
        targets = [];
        saveData();
        showToast('数据已重置');
    }
}

// Modal Utils
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Toast
function showToast(msg) {
    const el = document.getElementById('toast');
    el.innerText = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
}

// Security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
}
