import conexao from '../db/conexao.js';

/**
 * Função para gerar um relatório para um Doador ou uma ONG.
 * A função verifica o tipo de usuário passado na query string
 * e executa a consulta correspondente.
 * Rota: GET /api/relatorios
 */
export const gerarRelatorio = (req, res) => {
    // Pega o tipo de usuário (Doador ou ONG) e o ID da query string
    const { tipo, id } = req.query;

    // Validação de entrada
    if (!tipo || !id) {
        return res.status(400).json({ success: false, message: "O tipo (Doador ou ONG) e o ID são obrigatórios." });
    }

    if (tipo.toLowerCase() === 'doador') {
        // Se o usuário for um Doador, chama a Stored Procedure
        const sql = 'CALL sp_gerar_relatorio_doacoes(?)';
        conexao.query(sql, [id], (erro, resultados) => {
            if (erro) {
                console.error("Erro ao gerar relatório de doador:", erro);
                return res.status(500).json({ success: false, error: erro });
            }
            // O resultado de uma procedure geralmente vem em um array aninhado
            return res.status(200).json({ success: true, relatorio: resultados[0] });
        });

    } else if (tipo.toLowerCase() === 'ong') {
        // Se for uma ONG, faz uma consulta para buscar o histórico de reivindicações
        const sql = `
            SELECT 
                r.idReivindicacao,
                r.dataReivindicacao,
                r.statusReivindicacao,
                d.idDoacao,
                d.statusDoacao,
                a.nomeAlimento,
                u.nome AS nomeDoador
            FROM Reivindicacao r
            JOIN Doacao d ON r.fk_doacao_id = d.idDoacao
            JOIN Alimento a ON d.idDoacao = a.fk_doacao_id
            JOIN Doador doador ON d.idDoacao = doador.fk_doacao_id
            JOIN Usuario u ON doador.fk_usuario_id = u.id_usuario
            WHERE r.fk_ong_id = ?
            ORDER BY r.dataReivindicacao DESC;
        `;
        conexao.query(sql, [id], (erro, resultados) => {
            if (erro) {
                console.error("Erro ao gerar relatório de ONG:", erro);
                return res.status(500).json({ success: false, error: erro });
            }
            return res.status(200).json({ success: true, relatorio: resultados });
        });

    } else {
        return res.status(400).json({ success: false, message: "Tipo de usuário inválido. Use 'Doador' ou 'ONG'." });
    }
};