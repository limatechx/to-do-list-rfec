// Alterna status de finalizada ao clicar em uma li

function salvarTarefas(tarefas) {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function carregarTarefas() {
    const tarefas = localStorage.getItem('tarefas');
    return tarefas ? JSON.parse(tarefas) : [];
}

function renderizarTarefas(ul, tarefas) {
    ul.innerHTML = '';
    tarefas.forEach((tarefa, idx) => {
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

    let tarefas = carregarTarefas();
    renderizarTarefas(ul, tarefas);

    addBtn.addEventListener('click', function () {
        const value = input.value.trim();
        if (!value) return;
        tarefas.push({ texto: value, finalizada: false });
        salvarTarefas(tarefas);
        renderizarTarefas(ul, tarefas);
        input.value = '';
        input.focus();
    });

    ul.addEventListener('click', function (e) {
        // Se clicar no botão deletar, remove a tarefa
        if (e.target.classList.contains('deletar')) {
            const li = e.target.closest('li');
            const idx = Array.from(ul.children).indexOf(li);
            if (idx > -1) {
                tarefas.splice(idx, 1);
                salvarTarefas(tarefas);
                renderizarTarefas(ul, tarefas);
            }
            return;
        }
        // Alterna status de finalizada
        let li = e.target;
        if (li.tagName !== 'LI') {
            li = li.closest('li');
        }
        if (li) {
            const idx = Array.from(ul.children).indexOf(li);
            if (idx > -1) {
                tarefas[idx].finalizada = !tarefas[idx].finalizada;
                salvarTarefas(tarefas);
                renderizarTarefas(ul, tarefas);
            }
        }
    });
});
