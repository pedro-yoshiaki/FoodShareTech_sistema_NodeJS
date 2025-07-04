import conexao from '../db/conexao.js';

/**
 * Cadastra um novo beneficiário e o associa a uma ONG.
 * O trigger no banco de dados cuidará de atualizar a contagem.
 * Rota: POST /api/beneficiarios
 */
export const cadastrarBeneficiario = (req, res) => {
    const { cpfBeneficiario, numeroDependentes, idOng } = req.body;

    if (!cpfBeneficiario || !idOng) {
        return res.status(400).json({ success: false, message: "CPF e ID da ONG são obrigatórios." });
    }

    const sql = `
        INSERT INTO Beneficiario (cpfBeneficiario, numeroDependentes, fk_ong_id) 
        VALUES (?, ?, ?)
    `;

    conexao.query(sql, [cpfBeneficiario, numeroDependentes || 0, idOng], (erro, resultado) => {
        if (erro) {
            const message = erro.code === 'ER_DUP_ENTRY' ? 'Este CPF já está cadastrado.' : 'Erro ao cadastrar beneficiário.';
            return res.status(400).json({ success: false, message, error: erro });
        }
        
        // Não precisamos fazer mais nada, o trigger já fez o trabalho de contagem.
        return res.status(201).json({ 
            success: true, 
            message: 'Beneficiário cadastrado com sucesso!',
            idBeneficiario: resultado.insertId
        });
    });
};