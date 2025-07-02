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
router.get('/doacoes/disponiveis', listarDoacoesDisponiveis);
router.get('/doacoes/:id', detalharDoacao);


export default router;
