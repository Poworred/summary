import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 我的配置信息
const firebaseConfig = {
    apiKey: "AIzaSyAqxa_wtFwpDhavXZDowqHY5_9oqzX_EZo",
    authDomain: "summary-7fa47.firebaseapp.com",
    projectId: "summary-7fa47",
    storageBucket: "summary-7fa47.firebasestorage.app",
    messagingSenderId: "1006366612870",
    appId: "1:1006366612870:web:55dd0a3b0a7d88dbaa2007",
    measurementId: "G-7DRKNG2JH3"
};

// 初始化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const GAME_DOC_REF = doc(db, "events", "2024_teambuilding");

// 状态管理
let players = [];
let targets = [];
let isAdmin = false;
let currentPlayerId = null;

// 实时监听
onSnapshot(GAME_DOC_REF, (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        players = data.players || [];
        targets = data.targets || [];
        console.log("数据同步成功");
    } else {
        console.log("初始化新数据...");
        initDefaultData();
    }
    renderAll();
});

// 数据同步函数
async function pushToCloud() {
    if (!isAdmin) {
        showToast("只有管理员可以修改数据！");
        return;
    }
    try {
        await setDoc(GAME_DOC_REF, { players, targets });
    } catch (e) {
        console.error(e);
        showToast("同步失败: " + e.message);
    }
}

async function initDefaultData() {
    const defaultPlayers = [
        "赖心怡", "矣润羲", "张瑶", "万诗琴", "李梓睿", "俞丽君", "甘宇强", "赵文彤", "曾嘉琪",
        "王文洋", "邱荣毅", "杨许玮", "周之杰", "游英健", "陈诗棋", "马昀隆", "卢艺文", "李佳龙", "张科宇",
        "蔡一民", "毛思涵", "蔡睿喆", "石祥鹏", "郑福祥", "莫天泽", "杨美铃", "陈可珍", "张润诚"
    ].map((name, index) => ({
        id: Date.now() + index,
        name: name,
        score: 0,
        visited: []
    }));

    const defaultTargets = [
        { id: 1, name: '入口打卡', score: 5 }
    ];

    await setDoc(GAME_DOC_REF, { players: defaultPlayers, targets: defaultTargets });
}

// 交互逻辑
window.addPlayer = function () {
    if (!isAdmin) return showToast("请先登录管理员");
    const name = document.getElementById('newPlayerName').value.trim();
    if (!name) return showToast('请输入姓名');
    players.push({ id: Date.now(), name, score: 0, visited: [] });
    closeModal('addPlayerModal');
    pushToCloud();
    showToast(`已添加: ${name}`);
};

window.addTarget = function () {
    if (!isAdmin) return showToast("请先登录管理员");
    const name = document.getElementById('newTargetName').value.trim();
    const score = parseInt(document.getElementById('newTargetScore').value);
    if (!name) return showToast('请输入名称');
    targets.push({ id: Date.now(), name, score });
    closeModal('addTargetModal');
    pushToCloud();
    showToast(`已添加目标: ${name}`);
};

window.confirmScore = function (tid) {
    if (!isAdmin) return showToast("请先登录管理员");
    const player = players.find(p => p.id === currentPlayerId);
    const target = targets.find(t => t.id === tid);
    if (player && target) {
        if (player.visited && player.visited.includes(tid)) return;
        if (!player.visited) player.visited = [];

        player.score += target.score;
        player.visited.push(tid);
        closeModal('addScoreModal');
        pushToCloud();
        showToast("打卡成功！");
    }
};

window.resetGame = function () {
    if (!isAdmin) return showToast("请先登录管理员");
    if (confirm('确定要清空所有数据吗？')) {
        players = [];
        targets = [];
        pushToCloud();
        showToast('数据已重置');
    }
};

window.adminLogin = function () {
    const pwd = prompt("请输入管理员密码：");
    if (pwd === "admin888") {
        isAdmin = true;
        document.getElementById('adminControls').style.display = 'block';
        document.getElementById('adminControlsFooter').style.display = 'block';
        document.getElementById('guestMessage').style.display = 'none';
        document.getElementById('adminLoginBtn').style.display = 'none';
        showToast("管理员模式已开启");
        renderAll();
    } else {
        alert("密码错误");
    }
};

// 渲染与辅助函数
function renderAll() {
    renderLeaderboard();
    renderSidebarTargets();
}

window.renderLeaderboard = function () {
    const list = document.getElementById('leaderboardList');
    const searchVal = document.getElementById('searchInput').value.trim().toLowerCase();
    list.innerHTML = '';

    let displayPlayers = players;
    if (searchVal) displayPlayers = players.filter(p => p.name.toLowerCase().includes(searchVal));

    const sorted = [...displayPlayers].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    sorted.forEach((p, index) => {
        const row = document.createElement('div');
        row.className = 'player-row';
        const btnHtml = isAdmin ? `
            <button class="action-btn" onclick="openScoreModal(${p.id})">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            </button>` : '';

        row.innerHTML = `
            <div class="player-rank">#${index + 1}</div>
            <div class="player-name">${escapeHtml(p.name)}</div>
            <div class="player-score">${p.score}</div>
            <div style="display: flex; justify-content: center;">${btnHtml}</div>
        `;
        list.appendChild(row);
    });
};

window.deleteTarget = function (id) {
    if (!isAdmin) return showToast("请先登录管理员");
    const tIndex = targets.findIndex(t => t.id === id);
    if (tIndex > -1) {
        if (confirm(`确定要彻底删除 [${targets[tIndex].name}] 吗？\n警告：这不会影响已打卡该目标的玩家及其分数。`)) {
            targets.splice(tIndex, 1);
            pushToCloud();
            showToast("目标已删除");
        }
    }
}

function renderSidebarTargets() {
    const div = document.getElementById('targetListPreview');
    if (!targets.length) { div.innerHTML = '<p>暂无目标</p>'; return; }
    div.innerHTML = targets.map(t => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05)">
            <div>
                <span>${escapeHtml(t.name)}</span>
            </div>
            <div style="display:flex; align-items:center;">
                <span style="color:#38bdf8;font-weight:bold;margin-right:8px;">${t.score}分</span>
                ${isAdmin ? `<span onclick="deleteTarget(${t.id})" style="color:#f87171;cursor:pointer;font-weight:bold;margin-left:4px;" title="删除">×</span>` : ''}
            </div>
        </div>`).join('');
}

// Utils
window.openModal = (id) => document.getElementById(id).classList.add('active');
window.closeModal = (id) => document.getElementById(id).classList.remove('active');
window.showToast = (msg) => {
    const el = document.getElementById('toast');
    el.innerText = msg; el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
};
function escapeHtml(text) { return document.createElement('div').appendChild(document.createTextNode(text)).parentNode.innerHTML; }

// 修改后的 confirmScore 变成 toggleScore，逻辑更智能
window.toggleScore = function (tid) {
    if (!isAdmin) return showToast("请先登录管理员");
    const player = players.find(p => p.id === currentPlayerId);
    const target = targets.find(t => t.id === tid);

    if (player && target) {
        if (!player.visited) player.visited = [];
        const visitedIndex = player.visited.indexOf(tid);

        if (visitedIndex > -1) {
            // 已打卡 -> 取消打卡（扣分）
            if (confirm(`确定要取消 [${target.name}] 的打卡吗？\n将扣除 ${target.score} 分。`)) {
                player.score -= target.score;
                player.visited.splice(visitedIndex, 1);
                showToast("已取消打卡");
            } else {
                return; // 用户取消操作
            }
        } else {
            // 未打卡 -> 进行打卡（加分）
            player.score += target.score;
            player.visited.push(tid);
            showToast("打卡成功！");
        }

        closeModal('addScoreModal');
        pushToCloud();
    }
};

window.openScoreModal = function (pid) {
    if (!isAdmin) return;
    currentPlayerId = pid;
    const player = players.find(p => p.id === pid);
    if (!player) return;
    document.getElementById('currentScoringPlayer').innerText = `正在为 [${player.name}] 打卡`;
    const grid = document.getElementById('scoreTargetList');
    grid.innerHTML = '';
    targets.forEach(t => {
        const isVisited = player.visited && player.visited.includes(t.id);
        const btn = document.createElement('div');
        btn.className = `target-chip ${isVisited ? 'selected' : ''}`;

        // 绑定点击事件，无论是打卡还是取消打卡
        btn.onclick = () => toggleScore(t.id);

        if (isVisited) {
            // 已完成状态：允许点击取消
            btn.innerHTML = `${t.name} <div class="target-points">已完成 (点击取消)</div>`;
        } else {
            // 未完成状态：点击打卡
            btn.innerHTML = `${t.name} <div class="target-points">+${t.score} 分</div>`;
        }
        grid.appendChild(btn);
    });
    openModal('addScoreModal');
};

document.getElementById('searchInput').addEventListener('input', renderLeaderboard);
renderAll();
