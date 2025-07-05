import conexao from '../db/conexao.js';

export const criarDoacao = (req, res) => {
  const { id_doador, quantidadeDoacao, validade, alimento } = req.body;

  const dataAtual = new Date();
  const statusDoacao = 'Disponível';
  
  // Calcula o momento exato da expiração (agora + 2 minutos para teste)
  const dataHoraExpiracao = new Date(dataAtual.getTime() + 30 * 60000); 

  // Removemos a coluna horaColeta que era nula
  const sqlDoacao = `
    INSERT INTO Doacao (dataDoacao, quantidadeDoacao, validade, statusDoacao, fk_doador_id, tempoReivindicacao)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Passamos o objeto dataHoraExpiracao diretamente para a coluna tempoReivindicacao
  conexao.query(
    sqlDoacao,
    [dataAtual, quantidadeDoacao, validade, statusDoacao, id_doador, dataHoraExpiracao],
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
        d.idDoacao, d.dataDoacao, d.quantidadeDoacao, d.validade, d.statusDoacao,
        d.tempoReivindicacao, d.dataColeta, d.horaColeta, d.statusColeta,
        
        -- Colunas da tabela Alimento
        a.nomeAlimento, a.categoria, a.unidadeMedida, a.prioridade,
        
        -- Nome do Doador vindo da tabela Usuario
        u.nome AS nomeDoador,

        -- COLUNAS DO ENDEREÇO
        e.logradouro, e.numero, e.bairro, e.cidade, e.estado
    FROM
        Doacao d
    LEFT JOIN
        Alimento a ON a.fk_doacao_id = d.idDoacao
    LEFT JOIN 
        Doador doador ON d.fk_doador_id = doador.idDoador
    LEFT JOIN 
        Usuario u ON doador.fk_usuario_id = u.id_usuario
    LEFT JOIN -- ADICIONADO: junta com a tabela Endereco para pegar o endereço do doador
        Endereco e ON u.id_usuario = e.fk_usuario_id
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
  // A função agora recebe o ID da ONG logada pela query string
  const { idOng } = req.query;

  if (!idOng) {
      return res.status(400).json({ success: false, message: "ID da ONG é obrigatório para listar doações." });
  }

  // A consulta agora usa LEFT JOIN para verificar se existe uma reivindicação da ONG logada
  const sql = `
      SELECT 
          v.*,
          -- Cria uma coluna virtual 'jaReivindicado' (1 para sim, 0 para não)
          CASE WHEN r.idReivindicacao IS NOT NULL THEN TRUE ELSE FALSE END AS jaReivindicado
      FROM 
          view_doacoes_disponiveis v
      LEFT JOIN
          Reivindicacao r ON v.idDoacao = r.fk_doacao_id AND r.fk_ong_id = ?
  `;

  conexao.query(sql, [idOng], (err, resultados) => {
      if (err) {
          console.error('Erro ao buscar doações disponíveis:', err);
          return res.status(500).json({ error: 'Erro ao buscar doações disponíveis' });
      }
      return res.status(200).json(resultados);
  });
};
  
