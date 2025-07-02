import express from 'express';
import {
  criarDoacao,
  listarDoacoesPorDoador,
  detalharDoacao,
  listarDoacoesDisponiveis
} from '../controllers/doacaoController.js';

const router = express.Router();

router.post('/doacoes', criarDoacao);
router.get('/doador/doacoes', listarDoacoesPorDoador);
router.get('/doacoes/:id', detalharDoacao);
// Exibir todas as doações disponíveis para ONGs
router.get('/doacoes/disponiveis', listarDoacoesDisponiveis);

export default router;
