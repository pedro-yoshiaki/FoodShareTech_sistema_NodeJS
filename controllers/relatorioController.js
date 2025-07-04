import conexao from '../db/conexao.js';

/**
 * Função para gerar um relatório para um Doador ou uma ONG.
 * A função verifica o tipo de usuário passado na query string
 * e executa a consulta correspondente.
 * Rota: GET /api/relatorios
 */
export const gerarRelatorio = (req, res) => {
    const { tipo, id } = req.query;

    if (!tipo || !id) {
        return res.status(400).json({ success: false, message: "O tipo (Doador ou ONG) e o ID são obrigatórios." });
    }

    if (tipo.toLowerCase() === 'doador') {
        // A chamada para a Stored Procedure do doador já está correta após nossa última correção.
        const sql = 'CALL sp_gerar_relatorio_doacoes(?)';
        conexao.query(sql, [id], (erro, resultados) => {
            if (erro) {
                console.error("Erro ao gerar relatório de doador:", erro);
                return res.status(500).json({ success: false, error: erro });
            }
            return res.status(200).json({ success: true, relatorio: resultados[0] });
        });

    } else if (tipo.toLowerCase() === 'ong') {
        // A CONSULTA PARA A ONG PRECISAVA DE CORREÇÃO NO JOIN
        const sql = `
                SELECT 
                    r.idReivindicacao,
                    r.dataReivindicacao,
                    r.prioridadeCalculada,
                    d.idDoacao,
                    a.nomeAlimento,
                    u.nome AS nomeDoador,
                    CASE
                        WHEN d.fk_reivindicacao_id = r.idReivindicacao AND d.statusDoacao = 'Coletada' THEN 'Coletado por sua ONG'
                        WHEN d.fk_reivindicacao_id = r.idReivindicacao AND d.statusDoacao = 'Aguardando Coleta' THEN 'Aguardando sua Coleta'
                        WHEN d.statusDoacao = 'Disponível' THEN 'Em disputa'
                        WHEN d.statusDoacao = 'Cancelada' THEN 'Doação Cancelada'
                        ELSE 'Disputa Encerrada (Não Venceu)'
                    END AS resultadoFinal
                FROM Reivindicacao r
                LEFT JOIN Doacao d ON r.fk_doacao_id = d.idDoacao
                LEFT JOIN Alimento a ON d.idDoacao = a.fk_doacao_id
                LEFT JOIN Doador doador ON d.fk_doador_id = doador.idDoador
                LEFT JOIN Usuario u ON doador.fk_usuario_id = u.id_usuario
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