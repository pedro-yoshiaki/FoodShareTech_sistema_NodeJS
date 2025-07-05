import conexao from '../db/conexao.js';

/**
 * Lista todos os beneficiários de uma ONG específica.
 * Rota: GET /api/beneficiarios?idOng=1
 */
export const listarBeneficiariosPorOng = (req, res) => {
    const { idOng } = req.query;
    if (!idOng) {
        return res.status(400).json({ success: false, message: "O ID da ONG é obrigatório." });
    }
    const sql = "SELECT * FROM Beneficiario WHERE fk_ong_id = ?";
    conexao.query(sql, [idOng], (erro, resultados) => {
        if (erro) return res.status(500).json({ success: false, error: erro });
        return res.status(200).json({ success: true, beneficiarios: resultados });
    });
};

/**
 * Cadastra um novo beneficiário e o associa a uma ONG.
 * O trigger no banco cuidará de atualizar a contagem de beneficiários da ONG.
 * Rota: POST /api/beneficiarios
 */
export const cadastrarBeneficiario = (req, res) => {
    const { cpfBeneficiario, numeroDependentes, idOng } = req.body;
    if (!cpfBeneficiario || !idOng) {
        return res.status(400).json({ success: false, message: "CPF e ID da ONG são obrigatórios." });
    }
    const sql = "INSERT INTO Beneficiario (cpfBeneficiario, numeroDependentes, fk_ong_id) VALUES (?, ?, ?)";
    conexao.query(sql, [cpfBeneficiario, numeroDependentes || 0, idOng], (erro, resultado) => {
        if (erro) {
            const message = erro.code === 'ER_DUP_ENTRY' ? 'Este CPF já está cadastrado.' : 'Erro ao cadastrar beneficiário.';
            return res.status(400).json({ success: false, message });
        }
        res.status(201).json({ success: true, message: 'Beneficiário cadastrado!', idBeneficiario: resultado.insertId });
    });
};

/**
 * Exclui um beneficiário.
 * O trigger no banco cuidará de atualizar a contagem de beneficiários da ONG.
 * Rota: DELETE /api/beneficiarios/:id
 */
export const excluirBeneficiario = (req, res) => {
    const { id } = req.params; // Usando o ID do beneficiário como parâmetro de rota
    if (!id) {
        return res.status(400).json({ success: false, message: "O ID do beneficiário é obrigatório." });
    }
    const sql = "DELETE FROM Beneficiario WHERE id_beneficiario = ?";
    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ success: false, error: erro });
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Beneficiário não encontrado." });
        }
        res.status(200).json({ success: true, message: 'Beneficiário excluído com sucesso.' });
    });
};