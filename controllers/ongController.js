import conexao from '../db/conexao.js';

/**
 * Função para uma ONG fazer um lance (reivindicar) em uma doação.
 * Ela primeiro calcula a prioridade da ONG usando a FUNCTION do banco
 * e depois insere o registro na tabela de Reivindicação.
 * * Rota: POST /api/reivindicacoes
 */
export const fazerReivindicacao = (req, res) => {
    // Pega os IDs da ONG e da Doação do corpo da requisição
    const { idOng, idDoacao } = req.body;

    // Validação para garantir que os dados necessários foram enviados
    if (!idOng || !idDoacao) {
        return res.status(400).json({ success: false, message: "ID da ONG e ID da Doação são obrigatórios." });
    }

    // Passo 1: Chamar a FUNCTION 'calcular_prioridade' do MySQL
    const sqlCalculaPrioridade = 'SELECT calcular_prioridade(?) AS prioridade';

    conexao.query(sqlCalculaPrioridade, [idOng], (erroPrioridade, resultadoPrioridade) => {
        if (erroPrioridade) {
            console.error("Erro ao calcular prioridade:", erroPrioridade);
            return res.status(500).json({ success: false, message: "Erro interno ao calcular prioridade.", error: erroPrioridade });
        }

        // Extrai o valor da prioridade calculado pelo banco
        const prioridade = resultadoPrioridade[0].prioridade;

        // Passo 2: Inserir a nova reivindicação na tabela
        const sqlInsertReivindicacao = `
            INSERT INTO Reivindicacao (prioridadeCalculada, statusReivindicacao, dataReivindicacao, fk_ong_id, fk_doacao_id) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const dataReivindicacao = new Date();
        const statusInicial = 'Pendente';

        conexao.query(sqlInsertReivindicacao, [prioridade, statusInicial, dataReivindicacao, idOng, idDoacao], (erroInsert, resultadoInsert) => {
            if (erroInsert) {
                console.error("Erro ao inserir reivindicação:", erroInsert);
                // --- LÓGICA ADICIONADA AQUI ---
                // Verifica se o código do erro é de entrada duplicada
                if (erroInsert.code === 'ER_DUP_ENTRY') {
                    // Se for, envia uma mensagem amigável com status 409 (Conflict)
                    return res.status(409).json({ success: false, message: 'Você já fez um lance para esta doação.' });
                }
                // --- FIM DA LÓGICA ---
                return res.status(500).json({ success: false, message: "Erro ao registrar reivindicação.", error: erroInsert });
            }

            // Retorna uma resposta de sucesso para o frontend
            return res.status(201).json({ 
                success: true, 
                message: 'Reivindicação realizada com sucesso!',
                idReivindicacao: resultadoInsert.insertId 
            });
        });
    });
};

/**
 * Função para uma ONG ver todas as suas reivindicações (lances) feitas.
 * Rota: GET /api/ong/reivindicacoes
 */
export const verReivindicacoes = (req, res) => {
    // Em um app real, o id da ONG viria de um token de autenticação do usuário logado.
    // Para este exemplo, vamos pegá-lo da query string da URL.
    const { idOng } = req.query;

    if (!idOng) {
        return res.status(400).json({ success: false, message: "O ID da ONG é obrigatório na query string." });
    }

    const sql = `
        SELECT 
            r.idReivindicacao,
            r.statusReivindicacao,
            r.dataReivindicacao,
            r.prioridadeCalculada,
            d.idDoacao,
            d.statusDoacao,
            a.nomeAlimento
        FROM Reivindicacao r
        JOIN Doacao d ON r.fk_doacao_id = d.idDoacao
        JOIN Alimento a ON d.idDoacao = a.fk_doacao_id
        WHERE r.fk_ong_id = ?
        ORDER BY r.dataReivindicacao DESC
    `;

    conexao.query(sql, [idOng], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar reivindicações:", erro);
            return res.status(500).json({ success: false, error: erro });
        }

        return res.status(200).json({ success: true, reivindicacoes: resultados });
    });
};

/**
 * Função para confirmar a coleta de uma doação após vencer a disputa.
 * Rota: POST /api/reivindicacoes/:id/confirmar
 */
export const confirmarColeta = (req, res) => {
    const { id } = req.params; // ID da Reivindicação vencedora

    const sqlBuscaDoacao = 'SELECT fk_doacao_id, statusDoacao FROM Doacao INNER JOIN Reivindicacao ON Doacao.idDoacao = Reivindicacao.fk_doacao_id WHERE Reivindicacao.idReivindicacao = ?';

    conexao.query(sqlBuscaDoacao, [id], (erroBusca, resultadoBusca) => {
        if (erroBusca) return res.status(500).json({ success: false, error: erroBusca });
        if (resultadoBusca.length === 0) return res.status(404).json({ success: false, message: "Reivindicação ou doação associada não encontrada." });

        const idDoacao = resultadoBusca[0].fk_doacao_id;
        const statusAtual = resultadoBusca[0].statusDoacao;

        // 1. VERIFICAÇÃO: Garante que a coleta só pode ser confirmada se o status for 'Aguardando Coleta'
        if (statusAtual !== 'Aguardando Coleta') {
            return res.status(400).json({ success: false, message: `Ação não permitida. O status da doação é '${statusAtual}', não 'Aguardando Coleta'.` });
        }

        // 2. ATUALIZAÇÃO FINAL: Muda o status para 'Coletada' e o status da coleta para 'Confirmada'.
        // Também atualiza a data e hora para o momento exato da confirmação.
        const sqlUpdateFinal = `
            UPDATE Doacao 
            SET 
                statusDoacao = 'Coletada',
                statusColeta = 'Confirmada',
                dataColeta = CURDATE(), 
                horaColeta = CURTIME()
            WHERE idDoacao = ?
        `;

        conexao.query(sqlUpdateFinal, [idDoacao], (erroUpdate, resultadoUpdate) => {
            if (erroUpdate) return res.status(500).json({ success: false, error: erroUpdate });

            if (resultadoUpdate.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Doação não encontrada para confirmação." });
            }

            // 3. (Opcional, mas recomendado) Atualiza o status da reivindicação para 'Concluída'
            const sqlUpdateReivindicacao = "UPDATE Reivindicacao SET statusReivindicacao = 'Concluída' WHERE idReivindicacao = ?";
            conexao.query(sqlUpdateReivindicacao, [id]);

            return res.status(200).json({ success: true, message: "Coleta da doação confirmada com sucesso!" });
        });
    });
};