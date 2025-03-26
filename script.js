const app = document.getElementById('app');

const childrenData = [
    { id: 1, name: 'Maria Silva', avatar: 'https://via.placeholder.com/100' },
    { id: 2, name: 'João Santos', avatar: 'https://via.placeholder.com/100' },
    { id: 3, name: 'Ana Souza', avatar: 'https://via.placeholder.com/100' }
];

let currentScreen = 'login';
let selectedChild = null;

function renderHeader() {
    return `
        <header>
            <h1>Agenda Escolar</h1>
            <a href="#" id="backToDashboard">Todos os Alunos</a>
        </header>
    `;
}

function renderLogin() {
    app.innerHTML = `
        <div class="login-page">
            <div class="login-container">
                <h2>Agenda Escolar</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Tipo de Usuário</label>
                        <div class="user-type-buttons">
                            <button type="button" class="user-type-btn parent active" data-type="parent">👤 Responsável</button>
                            <button type="button" class="user-type-btn teacher" data-type="teacher">📖 Professor</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>E-mail</label>
                        <input type="email" required>
                        <span class="error-message" id="emailError">Por favor, insira um e-mail válido.</span>
                    </div>
                    <div class="form-group">
                        <label>Senha</label>
                        <input type="password" required>
                        <span class="error-message" id="passwordError">A senha deve ter pelo menos 6 caracteres.</span>
                    </div>
                    <button type="submit" class="login-btn">Entrar</button>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('loginForm');
    const buttons = document.querySelectorAll('.user-type-btn');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    let userType = 'parent';

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            userType = btn.dataset.type;
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        emailError.style.display = 'none';
        passwordError.style.display = 'none';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.style.display = 'block';
            return;
        }
        if (password.length < 6) {
            passwordError.style.display = 'block';
            return;
        }

        currentScreen = 'dashboard';
        renderApp();
    });
}

function renderDashboard() {
    app.innerHTML = `
        ${renderHeader()}
        <div class="dashboard">
            <div class="container">
                <h1>Meus Alunos</h1>
                <div class="children-grid">
                    ${childrenData.map(child => `
                        <div class="child-card" data-id="${child.id}">
                            <img src="${child.avatar}" alt="${child.name}">
                            <h3>${child.name}</h3>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('.child-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedChild = childrenData.find(c => c.id === parseInt(card.dataset.id));
            currentScreen = 'childDiary';
            renderApp();
        });
    });

    document.getElementById('backToDashboard').addEventListener('click', (e) => {
        e.preventDefault();
        currentScreen = 'dashboard';
        renderApp();
    });
}

function renderChildDiary() {
    app.innerHTML = `
        ${renderHeader()}
        <div class="child-diary">
            <div class="container">
                <div class="diary-container">
                    <h2>Diário de ${selectedChild.name}</h2>
                    <input type="date" id="diaryDate">
                    <div class="activities-grid">
                        <div class="activity-item" data-key="bath">🚿 Tomou Banho</div>
                        <div class="activity-item" data-key="lunch">🍽️ Almoçou</div>
                        <div class="activity-item" data-key="dinner">🍲 Jantou</div>
                        <div class="activity-item" data-key="fruit">🍎 Comeu Fruta</div>
                        <div class="activity-item" data-key="milkNotice">🥛 Precisa Trazer Leite</div>
                        <div class="activity-item" data-key="diaperNotice">👶 Precisa Trazer Fralda</div>
                    </div>
                    <textarea placeholder="Observações sobre o dia da criança..."></textarea>
                    <div class="photo-upload">
                        <label class="upload-btn">📷 Carregar Foto<input type="file" accept="image/*" id="photoUpload" hidden></label>
                        <img id="photoPreview" class="photo-preview" style="display: none;">
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn report">📧 Enviar Relatório</button>
                        <button class="action-btn notify">🔔 Notificar Responsável</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const activities = {};
    const dateInput = document.getElementById('diaryDate');
    const textarea = document.querySelector('textarea');
    const photoUpload = document.getElementById('photoUpload');
    const photoPreview = document.getElementById('photoPreview');

    // Carregar dados salvos
    loadDiaryData(activities, dateInput, textarea, photoPreview);

    document.querySelectorAll('.activity-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('active');
            activities[item.dataset.key] = item.classList.contains('active');
            saveDiaryData(activities, dateInput.value, textarea.value, photoPreview.src);
        });
    });

    dateInput.addEventListener('change', () => {
        saveDiaryData(activities, dateInput.value, textarea.value, photoPreview.src);
    });

    textarea.addEventListener('input', () => {
        saveDiaryData(activities, dateInput.value, textarea.value, photoPreview.src);
    });

    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                photoPreview.src = reader.result;
                photoPreview.style.display = 'block';
                saveDiaryData(activities, dateInput.value, textarea.value, photoPreview.src);
            };
            reader.readAsDataURL(file);
        }
    });

    document.querySelector('.action-btn.report').addEventListener('click', () => {
        showNotification('Relatório enviado com sucesso!');
    });

    document.getElementById('backToDashboard').addEventListener('click', (e) => {
        e.preventDefault();
        currentScreen = 'dashboard';
        renderApp();
    });
}

function saveDiaryData(activities, date, observation, photoSrc) {
    const diaryData = {
        activities,
        date,
        observation,
        photo: photoSrc !== '' && photoSrc !== 'about:blank' ? photoSrc : null
    };
    localStorage.setItem(`diary_${selectedChild.id}`, JSON.stringify(diaryData));
}

function loadDiaryData(activities, dateInput, textarea, photoPreview) {
    const saved = localStorage.getItem(`diary_${selectedChild.id}`);
    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data.activities).forEach(key => {
            if (data.activities[key]) {
                const item = document.querySelector(`[data-key="${key}"]`);
                if (item) item.classList.add('active');
                activities[key] = true;
            }
        });
        dateInput.value = data.date || '';
        textarea.value = data.observation || '';
        if (data.photo) {
            photoPreview.src = data.photo;
            photoPreview.style.display = 'block';
        }
    }
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    notif.style.display = 'block';
    setTimeout(() => notif.remove(), 3000);
}

function renderApp() {
    switch (currentScreen) {
        case 'login':
            renderLogin();
            break;
        case 'dashboard':
            renderDashboard();
            break;
        case 'childDiary':
            renderChildDiary();
            break;
    }
}

renderApp();