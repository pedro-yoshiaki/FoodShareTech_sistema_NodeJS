import conexao from '../db/conexao.js';

// Função para cadastrar um novo usuário (ONG ou Doador)
export const cadastrarUsuario = (req, res) => {
    console.log("Recebido:", req.body);
    const { nome, email, senha, tipo, cnpjCpf, endereco, contatos } = req.body;

    if (!nome || !email || !senha || !tipo || !endereco || !contatos || contatos.length === 0) {
        return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });
    }

    const data_cadastro = new Date();
    const sqlUsuario = 'INSERT INTO Usuario (nome, email, senha, tipo, data_cadastro) VALUES (?, ?, ?, ?, ?)';

    conexao.query(sqlUsuario, [nome, email, senha, tipo, data_cadastro], (erro, resultadoUsuario) => {
        if (erro) return res.status(500).json({ success: false, error: erro });

        const id_usuario = resultadoUsuario.insertId;

        // Inserir Endereço
        const { estado, cidade, bairro, logradouro, numero } = endereco;
        const sqlEndereco = 'INSERT INTO Endereco (estado, cidade, bairro, logradouro, numero, fk_usuario_id) VALUES (?, ?, ?, ?, ?, ?)';
        conexao.query(sqlEndereco, [estado, cidade, bairro, logradouro, numero, id_usuario], (erroEndereco) => {
            if (erroEndereco) return res.status(500).json({ success: false, error: erroEndereco });

            // Inserir Contatos (um ou mais)
            const sqlContato = 'INSERT INTO Contato (telefone, fk_usuario_id) VALUES ?';
            const valoresContatos = contatos.map(telefone => [telefone, id_usuario]);

            conexao.query(sqlContato, [valoresContatos], (erroContato) => {
                if (erroContato) return res.status(500).json({ success: false, error: erroContato });

                // Inserir ONG ou Doador
                if (tipo === 'ONG') {
                    const sqlOng = 'INSERT INTO ONG (nomeOng, cnpjOng, fk_usuario_id) VALUES (?, ?, ?)';
                    conexao.query(sqlOng, [nome, cnpjCpf, id_usuario], (errONG) => {
                        if (errONG) return res.status(500).json({ success: false, error: errONG });
                        return res.status(201).json({ success: true, message: 'Cadastro de ONG realizado com sucesso.' });
                    });
                } else if (tipo === 'Doador') {
                    const sqlDoador = 'INSERT INTO Doador (cnpjCpfDoador, fk_usuario_id) VALUES (?, ?)';
                    conexao.query(sqlDoador, [cnpjCpf, id_usuario], (errDoador) => {
                        if (errDoador) return res.status(500).json({ success: false, error: errDoador });
                        return res.status(201).json({ success: true, message: 'Cadastro de Doador realizado com sucesso.' });
                    });
                } else {
                    return res.status(400).json({ success: false, message: 'Tipo inválido (ONG ou Doador).' });
                }
            });
        });
    });
};


// Função para login do usuário
export const loginUsuario = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    const sql = 'SELECT * FROM Usuario WHERE email = ? AND senha = ?';
    conexao.query(sql, [email, senha], (erro, resultados) => {
        if (erro) return res.status(500).json({ success: false, error: erro });

        if (resultados.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }

        const usuario = resultados[0];
        return res.status(200).json({ success: true, usuario });
    });
};

// Função para visualizar perfil usuário Requisição GET
export const verPerfilUsuario = (req, res) => {
    const id_usuario = parseInt(req.query.id); // pegar via query string por enquanto

    const sqlUsuario = 'SELECT * FROM Usuario WHERE id_usuario = ?';
    const sqlEndereco = 'SELECT * FROM Endereco WHERE fk_usuario_id = ?';
    const sqlContatos = 'SELECT * FROM Contato WHERE fk_usuario_id = ?';

    conexao.query(sqlUsuario, [id_usuario], (err1, resultUsuario) => {
        if (err1) return res.status(500).json({ error: err1 });
        if (resultUsuario.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });

        const usuario = resultUsuario[0];

        conexao.query(sqlEndereco, [id_usuario], (err2, endereco) => {
            if (err2) return res.status(500).json({ error: err2 });

            conexao.query(sqlContatos, [id_usuario], (err3, contatos) => {
                if (err3) return res.status(500).json({ error: err3 });

                return res.status(200).json({
                    success: true,
                    usuario,
                    endereco: endereco[0], // assumindo apenas um endereço
                    contatos
                });
            });
        });
    });
};

// Função para atualizar perfil Usuário Requisição PUT
export const atualizarPerfilUsuario = (req, res) => {
    const id_usuario = parseInt(req.query.id); // pegar via query
    const { nome, email, endereco, contatos } = req.body;

    const sqlUpdateUsuario = 'UPDATE Usuario SET nome = ?, email = ? WHERE id_usuario = ?';
    conexao.query(sqlUpdateUsuario, [nome, email, id_usuario], (err1) => {
        if (err1) return res.status(500).json({ error: err1 });

        // Atualizar endereço
        const { estado, cidade, bairro, logradouro, numero } = endereco;
        const sqlEndereco = 'UPDATE Endereco SET estado = ?, cidade = ?, bairro = ?, logradouro = ?, numero = ? WHERE fk_usuario_id = ?';
        conexao.query(sqlEndereco, [estado, cidade, bairro, logradouro, numero, id_usuario], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });

            // Atualizar contatos (estratégia: apagar todos e inserir novamente)
            const sqlDeleteContatos = 'DELETE FROM Contato WHERE fk_usuario_id = ?';
            conexao.query(sqlDeleteContatos, [id_usuario], (err3) => {
                if (err3) return res.status(500).json({ error: err3 });

                const sqlInsertContatos = 'INSERT INTO Contato (telefone, fk_usuario_id) VALUES ?';
                const valoresContatos = contatos.map(telefone => [telefone, id_usuario]);

                conexao.query(sqlInsertContatos, [valoresContatos], (err4) => {
                    if (err4) return res.status(500).json({ error: err4 });

                    return res.status(200).json({ success: true, message: 'Informações atualizadas com sucesso!' });
                });
            });
        });
    });
};

export const deletarContaUsuario = (req, res) => {
    const id_usuario = parseInt(req.query.id);

    if (!id_usuario) {
        return res.status(400).json({ success: false, message: "ID do usuário é obrigatório." });
    }

    // Excluir Contatos
    const sqlDeleteContatos = 'DELETE FROM Contato WHERE fk_usuario_id = ?';
    conexao.query(sqlDeleteContatos, [id_usuario], (errContatos) => {
        if (errContatos) return res.status(500).json({ success: false, error: errContatos });

        // Excluir Endereços
        const sqlDeleteEnderecos = 'DELETE FROM Endereco WHERE fk_usuario_id = ?';
        conexao.query(sqlDeleteEnderecos, [id_usuario], (errEnderecos) => {
            if (errEnderecos) return res.status(500).json({ success: false, error: errEnderecos });

            // Por fim, excluir o Usuário
            const sqlDeleteUsuario = 'DELETE FROM Usuario WHERE id_usuario = ?';
            conexao.query(sqlDeleteUsuario, [id_usuario], (errUsuario) => {
                if (errUsuario) return res.status(500).json({ success: false, error: errUsuario });

                return res.status(200).json({ success: true, message: 'Conta excluída com sucesso.' });
            });
        });
    });
};