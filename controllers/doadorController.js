import conexao from '../db/conexao.js';

/**
 * Lista as ONGs que coletaram uma doação de um doador específico
 * e que ainda não foram avaliadas por ele.
 * Rota: GET /api/doador/:id/ongs-para-avaliar
 */
export const listarOngsParaAvaliar = (req, res) => {
    const { id } = req.params; // ID do Doador

    const sql = `
        SELECT DISTINCT
            o.idOng,
            o.nomeOng
        FROM Doacao d
        -- Encontra a reivindicação vencedora e a ONG correspondente
        JOIN Reivindicacao r ON d.fk_reivindicacao_id = r.idReivindicacao
        JOIN ONG o ON r.fk_ong_id = o.idOng
        WHERE
            -- Filtra pelas doações do doador logado
            d.fk_doador_id = ?
            -- Apenas as que já foram coletadas
            AND d.statusDoacao = 'Coletada'
            -- E para as quais ainda NÃO EXISTE uma avaliação deste doador para esta ONG
            AND NOT EXISTS (
                SELECT 1 
                FROM Avaliacao av 
                WHERE av.fk_doador_id = d.fk_doador_id AND av.fk_ong_id = o.idOng
            );
    `;

    conexao.query(sql, [id], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar ONGs para avaliar:", erro);
            return res.status(500).json({ success: false, error: erro });
        }
        // Retorna um objeto no padrão da nossa API
        return res.status(200).json({ success: true, ongs: resultados });
    });
};

/**
 * Lista as doações de um doador que estão aguardando coleta pela ONG vencedora.
 * Rota: GET /api/doador/:id/aguardando-coleta
 */
export const listarDoacoesAguardandoColeta = (req, res) => {
    const { id } = req.params; // ID do Doador

    // --- CONSULTA CORRIGIDA ---
    const sql = `
        SELECT 
            d.idDoacao,
            d.statusDoacao,
            d.dataColeta AS prazoDataColeta,
            d.horaColeta AS prazoHoraColeta,
            a.nomeAlimento,
            o.nomeOng,
            o.idOng,
            u_ong.email AS ongEmail,
            -- Agrupa todos os telefones encontrados em uma única string separada por vírgula
            GROUP_CONCAT(c.telefone SEPARATOR ', ') AS ongTelefone
        FROM Doacao d
        JOIN Reivindicacao r ON d.fk_reivindicacao_id = r.idReivindicacao
        JOIN ONG o ON r.fk_ong_id = o.idOng
        JOIN Alimento a ON d.idDoacao = a.fk_doacao_id
        JOIN Usuario u_ong ON o.fk_usuario_id = u_ong.id_usuario
        LEFT JOIN Contato c ON u_ong.id_usuario = c.fk_usuario_id
        WHERE
            d.fk_doador_id = ?
            AND d.statusDoacao = 'Aguardando Coleta'
        -- Agrupa por todas as colunas não agregadas para compatibilidade
        GROUP BY d.idDoacao, a.nomeAlimento, o.nomeOng, o.idOng, u_ong.email
        ORDER BY d.dataColeta ASC;
    `;

    conexao.query(sql, [id], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar doações aguardando coleta:", erro);
            return res.status(500).json({ success: false, error: erro });
        }
        return res.status(200).json({ success: true, doacoes: resultados });
    });
};