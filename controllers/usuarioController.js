import conexao from '../db/conexao.js';

// Função para cadastrar um novo usuário (ONG ou Doador)
export const cadastrarUsuario = (req, res) => {
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