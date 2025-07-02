import conexao from '../db/conexao.js';

export const criarDoacao = (req, res) => {
    const {
      id_doador,
      quantidadeDoacao,
      validade,
      alimento
    } = req.body;
  
    const dataAtual = new Date();
    const dataDoacao = dataAtual.toISOString().split('T')[0]; // yyyy-mm-dd
    const statusDoacao = 'Disponível';
  
    // Tempo de reivindicação = agora + 30 minutos
    const dataReivindicacaoLimite = new Date(dataAtual.getTime() + 30 * 60000);
    const tempoReivindicacao = dataReivindicacaoLimite.toTimeString().split(' ')[0]; // HH:MM:SS
  
    // Tempo de coleta será NULL por enquanto, só após a ONG ganhar o lance
    const tempoColeta = null;
  
    const sqlDoacao = `
      INSERT INTO Doacao (dataDoacao, quantidadeDoacao, validade, statusDoacao, tempoReivindicacao, tempoColeta)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    conexao.query(
      sqlDoacao,
      [dataDoacao, quantidadeDoacao, validade, statusDoacao, tempoReivindicacao, tempoColeta],
      (err1, result1) => {
        if (err1) return res.status(500).json({ error: err1 });
  
        const idDoacao = result1.insertId;
  
        const sqlAlimento = `
          INSERT INTO Alimento (nomeAlimento, categoria, unidadeMedida, prioridade, fk_doacao_id)
          VALUES (?, ?, ?, ?, ?)
        `;
  
        conexao.query(
          sqlAlimento,
          [alimento.nomeAlimento, alimento.categoria, alimento.unidadeMedida, alimento.prioridade, idDoacao],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
  
            const sqlRelacaoDoador = `
              UPDATE Doador SET fk_doacao_id = ? WHERE idDoador = ?
            `;
  
            conexao.query(sqlRelacaoDoador, [idDoacao, id_doador], (err3) => {
              if (err3) return res.status(500).json({ error: err3 });
  
              return res.status(201).json({
                success: true,
                message: 'Doação cadastrada com sucesso!',
                idDoacao
              });
            });
          }
        );
      }
    );
  };

// 2. Listar todas as doações de um doador
export const listarDoacoesPorDoador = (req, res) => {
  const idDoador = parseInt(req.query.id);

  const sql = `
    SELECT d.idDoacao, d.dataDoacao, d.statusDoacao, a.nomeAlimento, a.categoria, a.quantidadePacote
    FROM Doacao d
    JOIN Alimento a ON a.fk_doacao_id = d.idDoacao
    JOIN Doador doador ON doador.fk_doacao_id = d.idDoacao
    WHERE doador.idDoador = ?
  `;

  conexao.query(sql, [idDoador], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.status(200).json(results);
  });
};

// 3. Detalhar doação específica
export const detalharDoacao = (req, res) => {
  const idDoacao = parseInt(req.params.id);

  const sql = `
    SELECT d.*, a.*
    FROM Doacao d
    LEFT JOIN Alimento a ON a.fk_doacao_id = d.idDoacao
    WHERE d.idDoacao = ?
  `;

  conexao.query(sql, [idDoacao], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Doação não encontrada" });

    return res.status(200).json(result[0]);
  });
};

// 4. Listar doações com status 'Disponível' e tempo de reivindicação ativo
export const listarDoacoesDisponiveis = (req, res) => {
    const sql = `SELECT * FROM view_doacoes_disponiveis`;
  
    conexao.query(sql, (err, resultados) => {
      if (err) {
        console.error('Erro ao buscar doações disponíveis:', err);
        return res.status(500).json({ error: 'Erro ao buscar doações disponíveis' });
      }
  
      return res.status(200).json(resultados);
    });
  };
  
