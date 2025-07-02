import conexao from '../db/conexao.js';

export const criarDoacao = (req, res) => {
  const {
    id_doador, // ID do doador que está fazendo a doação
    quantidadeDoacao,
    validade,
    alimento
  } = req.body;

  const dataAtual = new Date();
  const dataDoacao = dataAtual.toISOString().split('T')[0];
  const statusDoacao = 'Disponível';
  const dataReivindicacaoLimite = new Date(dataAtual.getTime() + 30 * 60000);
  const tempoReivindicacao = dataReivindicacaoLimite.toTimeString().split(' ')[0];
  const horaColeta = null;

  // 1. O INSERT na Doacao agora inclui o fk_doador_id
  const sqlDoacao = `
    INSERT INTO Doacao (dataDoacao, quantidadeDoacao, validade, statusDoacao, tempoReivindicacao, horaColeta, fk_doador_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  conexao.query(
    sqlDoacao,
    // Adicionamos o id_doador aos parâmetros do INSERT
    [dataDoacao, quantidadeDoacao, validade, statusDoacao, tempoReivindicacao, horaColeta, id_doador],
    (err1, result1) => {
      if (err1) return res.status(500).json({ error: err1 });

      const idDoacao = result1.insertId;

      // 2. O INSERT em Alimento continua o mesmo
      const sqlAlimento = `
        INSERT INTO Alimento (nomeAlimento, categoria, unidadeMedida, prioridade, fk_doacao_id)
        VALUES (?, ?, ?, ?, ?)
      `;

      conexao.query(
        sqlAlimento,
        [alimento.nomeAlimento, alimento.categoria, alimento.unidadeMedida, alimento.prioridade, idDoacao],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2 });

          // 3. O passo de UPDATE no Doador foi REMOVIDO.
          // A lógica termina aqui, retornando sucesso.
          return res.status(201).json({
            success: true,
            message: 'Doação cadastrada com sucesso!',
            idDoacao
          });
        }
      );
    }
  );
};

//2. Listar doações por doador
export const listarDoacoesPorDoador = (req, res) => {
  const idDoador = parseInt(req.query.id);

  // A consulta foi simplificada para filtrar diretamente na tabela Doacao
  const sql = `
    SELECT d.idDoacao, d.dataDoacao, d.statusDoacao, a.nomeAlimento, a.categoria, a.unidadeMedida
    FROM Doacao d
    JOIN Alimento a ON a.fk_doacao_id = d.idDoacao
    WHERE d.fk_doador_id = ? -- Filtro direto na coluna correta
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
    SELECT
        -- Colunas da tabela Doacao
        d.idDoacao,
        d.dataDoacao,
        d.quantidadeDoacao,
        d.validade,
        d.statusDoacao,
        d.tempoReivindicacao,
        d.dataColeta,      -- Adicionada de volta
        d.horaColeta,      -- Adicionada de volta
        d.statusColeta,    -- Adicionada de volta
        
        -- Colunas da tabela Alimento (sem o id_alimento)
        a.nomeAlimento,
        a.categoria,
        a.unidadeMedida,
        a.prioridade,
        
        -- Nome do Doador vindo da tabela Usuario
        u.nome AS nomeDoador
    FROM
        Doacao d
    LEFT JOIN
        Alimento a ON a.fk_doacao_id = d.idDoacao
    LEFT JOIN 
        Doador doador ON d.fk_doador_id = doador.idDoador
    LEFT JOIN 
        Usuario u ON doador.fk_usuario_id = u.id_usuario
    WHERE
        d.idDoacao = ?
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
  
