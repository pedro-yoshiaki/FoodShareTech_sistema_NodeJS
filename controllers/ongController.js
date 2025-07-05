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
    const { idReivindicacao } = req.params;
    const { idDoacao } = req.body; // Recebe o código de confirmação do corpo da requisição

    if (!idDoacao) {
        return res.status(400).json({ success: false, message: "O código da doação é obrigatório para confirmar." });
    }

    // Primeiro, verifica se o idDoacao fornecido corresponde ao da reivindicação
    const sqlVerify = "SELECT fk_doacao_id FROM Reivindicacao WHERE idReivindicacao = ?";
    
    conexao.query(sqlVerify, [idReivindicacao], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err });
        if (results.length === 0) return res.status(404).json({ success: false, message: "Reivindicação não encontrada." });

        const doacaoCorretaId = results[0].fk_doacao_id;

        // Valida se o código informado pela ONG é o correto
        if (doacaoCorretaId !== idDoacao) {
            return res.status(400).json({ success: false, message: "Código da doação incorreto. Verifique com o doador." });
        }

        // Se o código estiver correto, atualiza o status da doação para 'Coletada'
        const sqlUpdate = "UPDATE Doacao SET statusDoacao = 'Coletada' WHERE idDoacao = ?";
        conexao.query(sqlUpdate, [doacaoCorretaId], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ success: false, error: errUpdate });
            
            res.status(200).json({ success: true, message: "Coleta confirmada com sucesso!" });
        });
    });
};

/**
 * Lista as doações que uma ONG específica venceu e que estão aguardando a coleta.
 * Rota: GET /api/ong/coletas-pendentes
 */
export const listarColetasPendentes = (req, res) => {
    // Pega o ID da ONG logada da query string
    const { idOng } = req.query;

    if (!idOng) {
        return res.status(400).json({ success: false, message: "O ID da ONG é obrigatório." });
    }

    // Consulta que busca as doações que estão 'Aguardando Coleta' E
    // onde a reivindicação vencedora pertence à ONG logada.
    const sql = `
                SELECT 
                d.idDoacao,
                d.quantidadeDoacao,
                d.validade,
                d.statusDoacao,
                d.dataColeta AS prazoDataColeta,
                d.horaColeta AS prazoHoraColeta,
                a.nomeAlimento,
                a.categoria,
                a.unidadeMedida,
                u_doador.nome AS nomeDoador,
                CONCAT(e_doador.logradouro, ', ', e_doador.numero, ' - ', e_doador.bairro, ', ', e_doador.cidade, '/', e_doador.estado) AS enderecoColeta,
                GROUP_CONCAT(c_doador.telefone SEPARATOR ', ') AS doadorTelefone,
                r.idReivindicacao
            FROM Doacao d
            JOIN Reivindicacao r ON d.fk_reivindicacao_id = r.idReivindicacao
            JOIN Alimento a ON d.idDoacao = a.fk_doacao_id
            JOIN Doador doador ON d.fk_doador_id = doador.idDoador
            JOIN Usuario u_doador ON doador.fk_usuario_id = u_doador.id_usuario
            LEFT JOIN Endereco e_doador ON u_doador.id_usuario = e_doador.fk_usuario_id
            LEFT JOIN Contato c_doador ON u_doador.id_usuario = c_doador.fk_usuario_id
            WHERE
                d.statusDoacao = 'Aguardando Coleta' 
                AND r.fk_ong_id = 1
            GROUP BY
                d.idDoacao,
                d.quantidadeDoacao,
                d.validade,
                d.statusDoacao,
                d.dataColeta,
                d.horaColeta,
                a.nomeAlimento,
                a.categoria,
                a.unidadeMedida,
                u_doador.nome,
                e_doador.logradouro,
                e_doador.numero,
                e_doador.bairro,
                e_doador.cidade,
                e_doador.estado,
                r.idReivindicacao
            ORDER BY 
                d.dataColeta ASC;
        `;

    conexao.query(sql, [idOng], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar coletas pendentes:", erro);
            return res.status(500).json({ success: false, error: erro });
        }
        return res.status(200).json({ success: true, coletas: resultados });
    });
};