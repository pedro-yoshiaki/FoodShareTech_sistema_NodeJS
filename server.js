/**
 * Arquivo: server.js
 * Descrição: Arquivo principal da aplicação. Responsável por inicializar o servidor Express,
 *            configurar middlewares globais, importar rotas da aplicação e definir a porta
 *            padrão de execução.
 *
 * Como utilizar:
 * - Inicie o servidor com o comando:
 *     node server.js
 * - O servidor será iniciado na porta 3000 (ou outra, caso alterada).
 * - Todas as requisições para endpoints definidos nas rotas serão tratadas a partir daqui.
 *
 * Estrutura:
 * - Utiliza o framework Express.js.
 * - Integra as rotas via app.use().
 * - Usa 'express.json()' para interpretar requisições com corpo em JSON.
 *
 * Observações:
 * - Certifique-se de que a conexão com o banco (conexao.js) esteja correta e ativa.
 * - Novas rotas devem ser registradas neste arquivo usando app.use().
 */

//Importar módulo express
import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js';
import doacaoRoutes from './routes/doacaoRoutes.js';
import ongRoutes from './routes/ongRoutes.js';
import avaliacaoRoutes from './routes/avaliacaoRoutes.js';
import relatorioRoutes from './routes/relatorioRoutes.js';
import beneficiarioRoutes from './routes/beneficiarioRoutes.js'; 

import path from 'path';
import { fileURLToPath } from 'url';

const app = express(); //Objeto 'app' com métodos do módulo express
const PORT = 3000; //Porta do server
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'view')));
app.use(express.json()); //Tipo de dados que a rota vai manipular
app.use(express.urlencoded({extended:false})); //Trabalhar com formulários HTML

//Rota GET padrão
app.get ("/", function (req, res){
    res.write("API FoodShareTech Ativa!");
    res.end();
})

app.use('/api', usuarioRoutes);
app.use('/api', doacaoRoutes);
app.use('/api', ongRoutes);
app.use('/api', avaliacaoRoutes);
app.use('/api', relatorioRoutes);
app.use('/api', beneficiarioRoutes);

app.listen(PORT, () => console.log(`O servidor está rodando na porta ${PORT}, abra seu navegador e digite na url -> localhost:${PORT}`));