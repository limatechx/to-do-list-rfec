// Alterna status de finalizada ao clicar em uma li

function salvarTarefas(tarefas) {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function carregarTarefas() {
    const tarefas = localStorage.getItem('tarefas');
    return tarefas ? JSON.parse(tarefas) : [];
}

function renderizarTarefas(ul, tarefas, filtro = 'todos') {
    ul.innerHTML = '';
    let tarefasFiltradas = tarefas;
    if (filtro === 'completos') {
        tarefasFiltradas = tarefas.filter(t => t.finalizada);
    } else if (filtro === 'pendentes') {
        tarefasFiltradas = tarefas.filter(t => !t.finalizada);
    }
    tarefasFiltradas.forEach((tarefa, idx) => {
        const li = document.createElement('li');
        if (tarefa.finalizada) li.classList.add('finalizada');
        const span = document.createElement('span');
        span.textContent = tarefa.texto;
        const btn = document.createElement('button');
        btn.className = 'deletar';
        btn.id = 'deletar';
        btn.textContent = '❌';
        li.appendChild(span);
        li.appendChild(btn);
        ul.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const ul = document.getElementById('task-list-ul');
    const input = document.getElementById('task-input');
    const addBtn = document.getElementById('add-task-btn');
    const filtroTodos = document.getElementById('filtro-todos');
    const filtroCompletos = document.getElementById('filtro-completos');
    const filtroPendentes = document.getElementById('filtro-pendentes');
    let filtroAtual = 'todos';
    // Elemento para mostrar o streak
    let streakDiv = document.getElementById('streak-info');
    if (!streakDiv) {
        streakDiv = document.createElement('div');
        streakDiv.id = 'streak-info';
        streakDiv.style.margin = '16px 0';
        streakDiv.style.fontWeight = 'bold';
        ul.parentElement.insertBefore(streakDiv, ul);
    }
    function getTodayStr() {
        const today = new Date();
        return today.toISOString().slice(0, 10); // yyyy-mm-dd
    }
    function getStreak() {
        const streakData = JSON.parse(localStorage.getItem('streakData') || '{}');
        return streakData;
    }
    function setStreak(streakData) {
        localStorage.setItem('streakData', JSON.stringify(streakData));
    }
    function atualizarStreak(tarefas) {
        const streakData = getStreak();
        const todayStr = getTodayStr();
        // Se todas as tarefas estão finalizadas hoje, atualiza streak
        const todasFinalizadas = tarefas.length > 0 && tarefas.every(t => t.finalizada);
        if (todasFinalizadas) {
            if (streakData.lastDay === todayStr) {
                // já contou hoje
            } else {
                const ontem = new Date();
                ontem.setDate(ontem.getDate() - 1);
                const ontemStr = ontem.toISOString().slice(0, 10);
                if (streakData.lastDay === ontemStr) {
                    streakData.streak = (streakData.streak || 0) + 1;
                } else {
                    streakData.streak = 1;
                }
                streakData.lastDay = todayStr;
                setStreak(streakData);
            }
        } else {
            // Se desmarcou alguma tarefa hoje, e já tinha contado streak hoje, remove o dia de hoje
            if (streakData.lastDay === todayStr) {
                streakData.lastDay = undefined;
                streakData.streak = Math.max(0, (streakData.streak || 1) - 1);
                setStreak(streakData);
            }
        }
        streakDiv.textContent = `Streak: ${streakData.streak || 0} dia(s) seguido(s)!`;
    }
    let tarefas = carregarTarefas();
    renderizarTarefas(ul, tarefas, filtroAtual);
    atualizarStreak(tarefas);
    function atualizarFiltroClasse() {
        document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('filtro-ativo'));
        if (filtroAtual === 'todos') filtroTodos.classList.add('filtro-ativo');
        if (filtroAtual === 'completos') filtroCompletos.classList.add('filtro-ativo');
        if (filtroAtual === 'pendentes') filtroPendentes.classList.add('filtro-ativo');
    }
    if (filtroTodos && filtroCompletos && filtroPendentes) {
        filtroTodos.addEventListener('click', function () {
            filtroAtual = 'todos';
            renderizarTarefas(ul, tarefas, filtroAtual);
            atualizarFiltroClasse();
        });
        filtroCompletos.addEventListener('click', function () {
            filtroAtual = 'completos';
            renderizarTarefas(ul, tarefas, filtroAtual);
            atualizarFiltroClasse();
        });
        filtroPendentes.addEventListener('click', function () {
            filtroAtual = 'pendentes';
            renderizarTarefas(ul, tarefas, filtroAtual);
            atualizarFiltroClasse();
        });
    }
    addBtn.addEventListener('click', function () {
        const value = input.value.trim();
        if (!value) return;
        tarefas.push({ texto: value, finalizada: false });
        salvarTarefas(tarefas);
        renderizarTarefas(ul, tarefas, filtroAtual);
        atualizarStreak(tarefas);
        input.value = '';
        input.focus();
    });
    ul.addEventListener('click', function (e) {
        // Se clicar no botão deletar, remove a tarefa
        if (e.target.classList.contains('deletar')) {
            const li = e.target.closest('li');
            // Precisa mapear o índice real na lista filtrada para o índice na lista original
            let idxFiltrada = Array.from(ul.children).indexOf(li);
            let tarefasFiltradas = tarefas;
            if (filtroAtual === 'completos') tarefasFiltradas = tarefas.filter(t => t.finalizada);
            if (filtroAtual === 'pendentes') tarefasFiltradas = tarefas.filter(t => !t.finalizada);
            const tarefaRemover = tarefasFiltradas[idxFiltrada];
            const idx = tarefas.indexOf(tarefaRemover);
            if (idx > -1) {
                tarefas.splice(idx, 1);
                salvarTarefas(tarefas);
                renderizarTarefas(ul, tarefas, filtroAtual);
                atualizarStreak(tarefas);
            }
            return;
        }
        // Alterna status de finalizada
        let li = e.target;
        if (li.tagName !== 'LI') {
            li = li.closest('li');
        }
        if (li) {
            let idxFiltrada = Array.from(ul.children).indexOf(li);
            let tarefasFiltradas = tarefas;
            if (filtroAtual === 'completos') tarefasFiltradas = tarefas.filter(t => t.finalizada);
            if (filtroAtual === 'pendentes') tarefasFiltradas = tarefas.filter(t => !t.finalizada);
            const tarefaAlterar = tarefasFiltradas[idxFiltrada];
            const idx = tarefas.indexOf(tarefaAlterar);
            if (idx > -1) {
                tarefas[idx].finalizada = !tarefas[idx].finalizada;
                salvarTarefas(tarefas);
                renderizarTarefas(ul, tarefas, filtroAtual);
                atualizarStreak(tarefas);
            }
        }
    });
});
