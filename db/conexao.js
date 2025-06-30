/**
 * Arquivo: conexao.js
 * Descrição: Responsável por configurar e exportar a conexão com o banco de dados MySQL,
 *            utilizando o módulo 'mysql2'. Esta conexão é utilizada pelos controllers para
 *            realizar operações de leitura, escrita, atualização e exclusão de dados no banco.
 *
 * Como utilizar:
 * - Importe este arquivo onde for necessário usar a conexão com o banco:
 *     import conexao from '../db/conexao.js';
 * - Utilize o objeto 'conexao' para executar queries SQL com segurança e controle de erros.
 *
 * Exemplo:
 *     conexao.query('SELECT * FROM Usuario', (err, results) => {
 *         if (err) throw err;
 *         console.log(results);
 *     });
 *
 * Observações:
 * - Os dados de autenticação e acesso ao banco estão definidos de forma explícita.
 *   Em ambientes reais, recomenda-se utilizar variáveis de ambiente (.env) para segurança.
 */

import mysql from 'mysql2';

//Configurações Banco de Dados
const DBPASSWORD = 'LPTeFSUz8QLKSVcp#';
const DATABASE = 'db_foodsharetech';
const HOST = 'localhost';
const USER = 'root';

const conexao = mysql.createConnection({
    host: HOST,
    user: USER,
    password: DBPASSWORD,
    database: DATABASE
});

conexao.connect(err => {
    if (err) throw err;
    console.log("Conexão com banco estabelecida");
});

export default conexao;
