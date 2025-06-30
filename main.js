document.addEventListener('DOMContentLoaded', function() {
    const inscricaoForm = document.getElementById('inscricaoForm');
    const listaInscricoes = document.getElementById('listaInscricoes');
    const apiUrl = '/api/inscricoes/'; 

    function carregarInscricoes() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                listaInscricoes.innerHTML = '';
                data.forEach(inscricao => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Inscrição ID: ${inscricao.ID_Inscricao} - Aluno ID: ${inscricao.ID_Aluno}, Curso ID: ${inscricao.ID_Curso}, Data: ${new Date(inscricao.Data_Inscricao).toLocaleDateString()}`;
                    listaInscricoes.appendChild(listItem);
                });
            })
            .catch(error => console.error('Erro ao carregar inscrições:', error));
    }

    inscricaoForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const aluno = document.getElementById('id_aluno').value;
        const curso = document.getElementById('id_curso').value;
        const data_inscricao = new Date().toISOString().split('T')[0];

        const novaInscricao = {
            ID_Aluno: aluno,
            ID_Curso: curso,
            Data_Inscricao: data_inscricao
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novaInscricao)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Erro ao criar inscrição.');
        })
        .then(data => {
            console.log('Inscrição criada com sucesso:', data);
            inscricaoForm.reset();
            carregarInscricoes();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Não foi possível realizar a inscrição. Verifique o console para mais detalhes.');
        });
    });

    carregarInscricoes();
});