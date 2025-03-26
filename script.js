const app = document.getElementById('app');

// Carrega os dados do localStorage ou usa os dados iniciais
let childrenData = JSON.parse(localStorage.getItem('childrenData')) || [
    { id: 1, name: 'Maria Silva', avatar: "assets/img/child_01.jpg", parentEmail: "maria@email.com" },
    { id: 2, name: 'João Santos', avatar: "assets/img/child_02.jpg", parentEmail: "joao@email.com" },
    { id: 3, name: 'Ana Souza', avatar: "assets/img/child_03.jpg", parentEmail: "ana@email.com" }
];

let teachersData = JSON.parse(localStorage.getItem('teachersData')) || [
    { id: 1, name: 'Professor Padrão', email: 'professor@escola.com.br' }
];

let currentScreen = 'login';
let selectedChild = null;
let userType = 'parent';
let loggedUserEmail = '';

function saveChildrenData() {
    localStorage.setItem('childrenData', JSON.stringify(childrenData));
}

function saveTeachersData() {
    localStorage.setItem('teachersData', JSON.stringify(teachersData));
}

function renderHeader() {
    return `
        <header>
            <div class="header-container">
                <h1>Agenda Escolar</h1>
                <div class="header-buttons">
                    ${userType === 'teacher' ? `
                        <a href="#" id="manageStudentsLink">Gerenciar Alunos</a>
                        <a href="#" id="manageTeachersLink">Gerenciar Professores</a>
                        <a href="#" id="listStudentsLink">Todos os Alunos</a>
                    ` : `
                        <a href="#" id="backToDashboard">Todos os Alunos</a>
                    `}
                    <button id="logoutBtn" class="action-btn logout">🚪 Sair</button>
                </div>
            </div>
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
                        <span class="error-message" id="passwordError">Credenciais inválidas.</span>
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

        if (userType === 'teacher') {
            if (email !== 'professor@escola.com.br' || password !== '123456') {
                passwordError.style.display = 'block';
                return;
            }
        } else if (password.length < 6) {
            passwordError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
            passwordError.style.display = 'block';
            return;
        }

        loggedUserEmail = email;
        currentScreen = 'dashboard';
        renderApp();
    });
}

function renderDashboard() {
    let filteredChildren = userType === 'parent' 
        ? childrenData.filter(child => child.parentEmail === loggedUserEmail)
        : childrenData;

    app.innerHTML = `
        ${renderHeader()}
        <div class="dashboard">
            <div class="container">
                <h1>Meus Alunos</h1>
                <div class="children-grid">
                    ${filteredChildren.map(child => `
                        <div class="child-card" data-id="${child.id}">
                            <img src="${child.avatar}" alt="${child.name}">
                            <h3>${child.name}</h3>
                        </div>
                    `).join('')}
                </div>
                ${userType === 'teacher' ? `
                    <div class="teacher-menu">
                        <button id="manageStudentsBtn" class="action-btn">📚 Gerenciar Alunos</button>
                        <button id="manageTeachersBtn" class="action-btn">👩‍🏫 Gerenciar Professores</button>
                        <button id="listStudentsBtn" class="action-btn">👦 Listar Todos os Alunos</button>
                    </div>
                    <div id="teacherContent" class="crud-section"></div>
                ` : ''}
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

    if (userType === 'teacher') {
        const manageStudentsBtn = document.getElementById('manageStudentsBtn');
        const manageTeachersBtn = document.getElementById('manageTeachersBtn');
        const listStudentsBtn = document.getElementById('listStudentsBtn');
        const manageStudentsLink = document.getElementById('manageStudentsLink');
        const manageTeachersLink = document.getElementById('manageTeachersLink');
        const listStudentsLink = document.getElementById('listStudentsLink');

        manageStudentsBtn.addEventListener('click', () => renderManageStudents());
        manageTeachersBtn.addEventListener('click', () => renderManageTeachers());
        listStudentsBtn.addEventListener('click', () => renderListStudents());
        manageStudentsLink.addEventListener('click', (e) => { e.preventDefault(); renderManageStudents(); });
        manageTeachersLink.addEventListener('click', (e) => { e.preventDefault(); renderManageTeachers(); });
        listStudentsLink.addEventListener('click', (e) => { e.preventDefault(); renderListStudents(); });

        renderManageStudents();
    }

    document.getElementById('backToDashboard')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentScreen = 'dashboard';
        renderApp();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        loggedUserEmail = '';
        userType = 'parent';
        currentScreen = 'login';
        renderApp();
    });
}

function renderManageStudents() {
    const content = document.getElementById('teacherContent');
    content.innerHTML = `
        <h2>Gerenciar Alunos</h2>
        <button id="addChildBtn" class="action-btn add">➕ Adicionar Aluno</button>
        <div class="crud-table">
            ${childrenData.map(child => `
                <div class="crud-item">
                    <span>${child.name} (${child.parentEmail})</span>
                    <div>
                        <button class="edit-btn" data-id="${child.id}">✏️ Editar</button>
                        <button class="delete-btn" data-id="${child.id}">🗑️ Excluir</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('addChildBtn').addEventListener('click', () => renderChildForm(null));
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const child = childrenData.find(c => c.id === parseInt(btn.dataset.id));
            renderChildForm(child);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este aluno?')) {
                childrenData = childrenData.filter(c => c.id !== parseInt(btn.dataset.id));
                saveChildrenData();
                renderManageStudents();
            }
        });
    });
}

function renderManageTeachers() {
    const content = document.getElementById('teacherContent');
    content.innerHTML = `
        <h2>Gerenciar Professores</h2>
        <button id="addTeacherBtn" class="action-btn add">➕ Adicionar Professor</button>
        <div class="crud-table">
            ${teachersData.map(teacher => `
                <div class="crud-item">
                    <span>${teacher.name} (${teacher.email})</span>
                    <div>
                        <button class="edit-btn" data-id="${teacher.id}">✏️ Editar</button>
                        <button class="delete-btn" data-id="${teacher.id}">🗑️ Excluir</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('addTeacherBtn').addEventListener('click', () => renderTeacherForm(null));
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const teacher = teachersData.find(t => t.id === parseInt(btn.dataset.id));
            renderTeacherForm(teacher);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este professor?')) {
                teachersData = teachersData.filter(t => t.id !== parseInt(btn.dataset.id));
                saveTeachersData();
                renderManageTeachers();
            }
        });
    });
}

function renderListStudents() {
    const content = document.getElementById('teacherContent');
    content.innerHTML = `
        <h2>Todos os Alunos</h2>
        <div class="crud-table">
            ${childrenData.map(child => `
                <div class="crud-item">
                    <span>${child.name} (${child.parentEmail})</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderChildForm(child) {
    const isEdit = !!child;
    app.innerHTML = `
        ${renderHeader()}
        <div class="modal">
            <div class="modal-content">
                <h2>${isEdit ? 'Editar Aluno' : 'Adicionar Aluno'}</h2>
                <form id="childForm">
                    <div class="form-group">
                        <label>Nome</label>
                        <input type="text" id="childName" value="${child?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>E-mail do Responsável</label>
                        <input type="email" id="childParentEmail" value="${child?.parentEmail || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>URL do Avatar (opcional)</label>
                        <input type="text" id="childAvatar" value="${child?.avatar || ''}">
                    </div>
                    <button type="submit" class="action-btn">${isEdit ? 'Salvar' : 'Adicionar'}</button>
                    <button type="button" id="cancelForm" class="action-btn cancel">Cancelar</button>
                </form>
                <button id="backBtn" class="action-btn back">⬅️ Voltar</button>
            </div>
        </div>
    `;

    document.getElementById('childForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('childName').value;
        const parentEmail = document.getElementById('childParentEmail').value;
        const avatar = document.getElementById('childAvatar').value || 'assets/img/default.jpg';

        if (isEdit) {
            child.name = name;
            child.parentEmail = parentEmail;
            child.avatar = avatar;
        } else {
            const newId = Math.max(...childrenData.map(c => c.id), 0) + 1;
            childrenData.push({ id: newId, name, avatar, parentEmail });
        }
        saveChildrenData();
        currentScreen = 'dashboard';
        renderApp();
    });

    document.getElementById('cancelForm').addEventListener('click', () => {
        currentScreen = 'dashboard';
        renderApp();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        loggedUserEmail = '';
        userType = 'parent';
        currentScreen = 'login';
        renderApp();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        currentScreen = 'dashboard';
        renderApp();
    });
}

function renderTeacherForm(teacher) {
    const isEdit = !!teacher;
    app.innerHTML = `
        ${renderHeader()}
        <div class="modal">
            <div class="modal-content">
                <h2>${isEdit ? 'Editar Professor' : 'Adicionar Professor'}</h2>
                <form id="teacherForm">
                    <div class="form-group">
                        <label>Nome</label>
                        <input type="text" id="teacherName" value="${teacher?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>E-mail</label>
                        <input type="email" id="teacherEmail" value="${teacher?.email || ''}" required>
                    </div>
                    <button type="submit" class="action-btn">${isEdit ? 'Salvar' : 'Adicionar'}</button>
                    <button type="button" id="cancelForm" class="action-btn cancel">Cancelar</button>
                </form>
                <button id="backBtn" class="action-btn back">⬅️ Voltar</button>
            </div>
        </div>
    `;

    document.getElementById('teacherForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('teacherName').value;
        const email = document.getElementById('teacherEmail').value;

        if (isEdit) {
            teacher.name = name;
            teacher.email = email;
        } else {
            const newId = Math.max(...teachersData.map(t => t.id), 0) + 1;
            teachersData.push({ id: newId, name, email });
        }
        saveTeachersData();
        currentScreen = 'dashboard';
        renderApp();
    });

    document.getElementById('cancelForm').addEventListener('click', () => {
        currentScreen = 'dashboard';
        renderApp();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        loggedUserEmail = '';
        userType = 'parent';
        currentScreen = 'login';
        renderApp();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
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
                    <div class="child-info">
                        <img src="${selectedChild.avatar}" alt="${selectedChild.name}" class="child-avatar">
                        <h2>Diário de ${selectedChild.name}</h2>
                    </div>
                    <input type="date" id="diaryDate">
                    <div class="activities-grid">
                        <div class="activity-item" data-key="bath">🚿 Tomou Banho</div>
                        <div class="activity-item" data-key="lunch">🍽️ Almoçou</div>
                        <div class="activity-item" data-key="dinner">🍲 Jantou</div>
                        <div class="activity-item" data-key="fruit">🍎 Comeu Fruta</div>
                        <div class="activity-item" data-key="milkNotice">🥛 Precisa Trazer Leite</div>
                        <div class="activity-item" data-key="diaperNotice">👶 Precisa Trazer Fralda</div>
                    </div>
                    <textarea placeholder="Observações sobre o dia da criança..." ${userType === 'parent' ? 'readonly' : ''}></textarea>
                    <div class="photo-upload">
                        <label class="upload-btn" ${userType === 'parent' ? 'style="display:none"' : ''}>📷 Carregar Foto<input type="file" accept="image/*" id="photoUpload" hidden></label>
                        <img id="photoPreview" class="photo-preview" style="display: none;">
                    </div>
                    <div class="action-buttons">
                        ${userType === 'teacher' ? `
                            <button class="action-btn report">📧 Enviar Relatório</button>
                            <button class="action-btn notify">🔔 Notificar Responsável</button>
                        ` : ''}
                    </div>
                    <button id="backBtn" class="action-btn back">⬅️ Voltar</button>
                </div>
            </div>
        </div>
    `;

    const activities = {};
    const dateInput = document.getElementById('diaryDate');
    const textarea = document.querySelector('textarea');
    const photoUpload = document.getElementById('photoUpload');
    const photoPreview = document.getElementById('photoPreview');

    dateInput.value = new Date().toISOString().split('T')[0];
    loadDiaryData(activities, dateInput.value);

    document.querySelectorAll('.activity-item').forEach(item => {
        if (userType === 'teacher') {
            item.addEventListener('click', () => {
                item.classList.toggle('active');
                activities[item.dataset.key] = item.classList.contains('active');
                saveDiaryData(activities, dateInput.value, textarea.value, photoPreview.src);
            });
        }
    });

    dateInput.addEventListener('change', () => {
        loadDiaryData(activities, dateInput.value);
        if (userType === 'teacher') {
            saveDiaryData(activities, dateInput.value, textarea.value, photoPreview.src);
        }
    });

    if (userType === 'teacher') {
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
    }

    document.getElementById('backToDashboard')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentScreen = 'dashboard';
        renderApp();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        loggedUserEmail = '';
        userType = 'parent';
        currentScreen = 'login';
        renderApp();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        currentScreen = 'dashboard';
        renderApp();
    });
}

function saveDiaryData(activities, date, observation, photoSrc) {
    const diaryData = {
        activities,
        observation,
        photo: photoSrc !== '' && photoSrc !== 'about:blank' ? photoSrc : null
    };
    localStorage.setItem(`diary_${selectedChild.id}_${date}`, JSON.stringify(diaryData));
}

function loadDiaryData(activities, date) {
    const saved = localStorage.getItem(`diary_${selectedChild.id}_${date}`);
    const items = document.querySelectorAll('.activity-item');
    const textarea = document.querySelector('textarea');
    const photoPreview = document.getElementById('photoPreview');

    items.forEach(item => {
        item.classList.remove('active');
        activities[item.dataset.key] = false;
    });
    textarea.value = '';
    photoPreview.style.display = 'none';
    photoPreview.src = '';

    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data.activities).forEach(key => {
            if (data.activities[key]) {
                const item = document.querySelector(`[data-key="${key}"]`);
                if (item) {
                    item.classList.add('active');
                    activities[key] = true;
                }
            }
        });
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