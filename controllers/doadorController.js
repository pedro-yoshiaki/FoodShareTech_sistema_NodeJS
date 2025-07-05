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