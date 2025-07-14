document.addEventListener('DOMContentLoaded', () => {

    // URL base da sua API. Altere se o seu servidor rodar em outra porta.
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    // Elementos do DOM
    const formCurso = document.getElementById('form-curso');
    const nomeCursoInput = document.getElementById('nome-curso');
    const listaCursos = document.getElementById('lista-cursos');
    const selectCurso = document.getElementById('select-curso');

    const formAluno = document.getElementById('form-aluno');
    const nomeAlunoInput = document.getElementById('nome-aluno');
    const listaAlunos = document.getElementById('lista-alunos');
    const selectAluno = document.getElementById('select-aluno');

    const formInscricao = document.getElementById('form-inscricao');
    const dataInscricaoInput = document.getElementById('data-inscricao');
    const tabelaInscricoesBody = document.querySelector('#tabela-inscricoes tbody');

    // Armazenamento local dos dados para evitar múltiplas chamadas
    let alunosData = [];
    let cursosData = [];

    // Funções de Fetch
    const fetchData = async (endpoint) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar ${endpoint}:`, error);
        }
    };

    const postData = async (endpoint, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} -> ${JSON.stringify(errorData)}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao criar ${endpoint}:`, error);
        }
    };

    const deleteData = async (endpoint, id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}/`, {
                method: 'DELETE',
            });
            if (!response.ok && response.status !== 204) { // 204 No Content é um sucesso para DELETE
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return true; // Sucesso
        } catch (error) {
            console.error(`Falha ao deletar ${endpoint} com id ${id}:`, error);
            return false;
        }
    };


    // Funções de Renderização
    const renderAlunos = async () => {
        alunosData = await fetchData('alunos') || [];
        listaAlunos.innerHTML = '';
        selectAluno.innerHTML = '<option value="">Selecione um aluno</option>';
        alunosData.forEach(aluno => {
            // Adiciona na lista de exibição
            const li = document.createElement('li');
            li.textContent = aluno.nome;
            li.dataset.id = aluno.id;
            listaAlunos.appendChild(li);
            // Adiciona no dropdown do formulário de inscrição
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = aluno.nome;
            selectAluno.appendChild(option);
        });
    };

    const renderCursos = async () => {
        cursosData = await fetchData('cursos') || [];
        listaCursos.innerHTML = '';
        selectCurso.innerHTML = '<option value="">Selecione um curso</option>';
        cursosData.forEach(curso => {
            // Adiciona na lista de exibição
            const li = document.createElement('li');
            li.textContent = curso.nome;
            li.dataset.id = curso.id;
            listaCursos.appendChild(li);
            // Adiciona no dropdown do formulário de inscrição
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nome;
            selectCurso.appendChild(option);
        });
    };

    const renderInscricoes = async () => {
        const inscricoes = await fetchData('inscricoes') || [];
        tabelaInscricoesBody.innerHTML = '';
        inscricoes.forEach(inscricao => {
            const aluno = alunosData.find(a => a.id === inscricao.aluno);
            const curso = cursosData.find(c => c.id === inscricao.curso);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aluno ? aluno.nome : 'Aluno não encontrado'}</td>
                <td>${curso ? curso.nome : 'Curso não encontrado'}</td>
                <td>${new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td>
                    <button class="delete-btn" data-id="${inscricao.id}">Deletar</button>
                </td>
            `;
            tabelaInscricoesBody.appendChild(tr);
        });
    };

    // Handlers de Eventos
    formAluno.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = nomeAlunoInput.value.trim();
        if (nome) {
            await postData('alunos', { nome });
            nomeAlunoInput.value = '';
            await renderAlunos(); // Atualiza a lista de alunos e o select
            await renderInscricoes(); // Atualiza a tabela caso algum nome tenha sido corrigido
        }
    });

    formCurso.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = nomeCursoInput.value.trim();
        if (nome) {
            await postData('cursos', { nome });
            nomeCursoInput.value = '';
            await renderCursos(); // Atualiza a lista de cursos e o select
            await renderInscricoes(); // Atualiza a tabela caso algum nome tenha sido corrigido
        }
    });

    formInscricao.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alunoId = selectAluno.value;
        const cursoId = selectCurso.value;
        const dataInscricao = dataInscricaoInput.value;

        if (alunoId && cursoId && dataInscricao) {
            const data = {
                aluno: parseInt(alunoId),
                curso: parseInt(cursoId),
                data_inscricao: dataInscricao
            };
            await postData('inscricoes', data);
            formInscricao.reset();
            await renderInscricoes();
        } else {
            alert('Por favor, preencha todos os campos da inscrição.');
        }
    });
    
    tabelaInscricoesBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const inscricaoId = e.target.dataset.id;
            const success = await deleteData('inscricoes', inscricaoId);
            if (success) {
                // Remove a linha da tabela sem precisar recarregar tudo
                e.target.closest('tr').remove();
            }
        }
    });

    // Função de Inicialização
    const init = async () => {
        await renderAlunos();
        await renderCursos();
        await renderInscricoes();
    };

    init();
});