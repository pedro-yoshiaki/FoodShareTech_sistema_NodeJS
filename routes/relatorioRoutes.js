import express from 'express';
import { gerarRelatorio } from '../controllers/relatorioController.js';

const router = express.Router();

// Rota para gerar relatórios para Doadores ou ONGs
router.get('/relatorios', gerarRelatorio);

export default router;