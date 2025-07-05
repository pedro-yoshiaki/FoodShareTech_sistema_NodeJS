import express from 'express';
import { listarOngsParaAvaliar, listarDoacoesAguardandoColeta } from '../controllers/doadorController.js';

const router = express.Router();

// Rota para buscar a lista de ONGs que um doador pode avaliar
router.get('/doador/:id/ongs-para-avaliar', listarOngsParaAvaliar);
router.get('/doador/:id/aguardando-coleta', listarDoacoesAguardandoColeta);

export default router;