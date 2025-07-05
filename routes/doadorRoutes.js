import express from 'express';
import { listarOngsParaAvaliar } from '../controllers/doadorController.js';

const router = express.Router();

// Rota para buscar a lista de ONGs que um doador pode avaliar
router.get('/doador/:id/ongs-para-avaliar', listarOngsParaAvaliar);

export default router;