import express from 'express';
import {
  criarDoacao,
  listarDoacoesPorDoador,
  detalharDoacao,
  listarDoacoesDisponiveis, 
  excluirDoacao
} from '../controllers/doacaoController.js';

const router = express.Router();

router.post('/doacoes', criarDoacao);
router.get('/doador/doacoes', listarDoacoesPorDoador);
router.get('/doacoes/disponiveis', listarDoacoesDisponiveis);
router.get('/doacoes/:id', detalharDoacao);
router.delete('/doacoes/:id', excluirDoacao);


export default router;
