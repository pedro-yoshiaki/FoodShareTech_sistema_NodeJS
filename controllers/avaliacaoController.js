import conexao from '../db/conexao.js';

/**
 * Função para um Doador avaliar uma ONG após uma coleta.
 * Rota: POST /api/avaliacoes
 */
export const avaliarONG = (req, res) => {
    // Pega os dados do corpo da requisição
    const { idDoador, idOng, nota, comentario } = req.body;

    // Validação para garantir que os dados essenciais foram enviados
    if (!idDoador || !idOng || nota === undefined) {
        return res.status(400).json({ success: false, message: "ID do Doador, ID da ONG e a nota são obrigatórios." });
    }

    // Pega a data atual para registrar na avaliação
    const dataAvaliacao = new Date();

    // Query SQL para inserir a nova avaliação na tabela, agora com as chaves estrangeiras corretas
    const sql = `
        INSERT INTO Avaliacao (nota, comentario, dataAvaliacao, fk_doador_id, fk_ong_id) 
        VALUES (?, ?, ?, ?, ?)
    `;

    conexao.query(sql, [nota, comentario, dataAvaliacao, idDoador, idOng], (erro, resultado) => {
        if (erro) {
            console.error("Erro ao registrar avaliação:", erro);
            return res.status(500).json({ success: false, message: "Erro interno ao registrar avaliação.", error: erro });
        }

        // Importante: Após este INSERT, o TRIGGER 'tr_update_media_avaliacao'
        // será disparado automaticamente no banco,
        // atualizando a nota média da ONG que foi avaliada.

        return res.status(201).json({ 
            success: true, 
            message: 'Avaliação registrada com sucesso!',
            idAvaliacao: resultado.insertId
        });
    });
};