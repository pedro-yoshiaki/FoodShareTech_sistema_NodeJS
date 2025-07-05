import express from 'express';
// Importa apenas a função que vamos usar por enquanto
import { fazerReivindicacao, verReivindicacoes, confirmarColeta, listarColetasPendentes  } from '../controllers/ongController.js';

const router = express.Router();

// Rota para uma ONG fazer uma nova reivindicação (lance)
// Acessada via: POST http://localhost:3000/api/reivindicacoes
router.post('/reivindicacoes', fazerReivindicacao);
// Exemplo de uso: GET http://localhost:3000/api/ong/reivindicacoes?idOng=1
router.get('/ong/reivindicacoes', verReivindicacoes);
// Exemplo de uso: POST http://localhost:3000/api/reivindicacoes/5/confirmar
router.post('/reivindicacoes/:id/confirmar', confirmarColeta);
// ROTA NOVA: Retorna as doações vencidas pela ONG que estão aguardando coleta
router.get('/ong/coletas-pendentes', listarColetasPendentes)

export default router;