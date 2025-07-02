import express from 'express';
import { avaliarONG } from '../controllers/avaliacaoController.js';

const router = express.Router();

// Rota para um Doador enviar uma nova avaliação para uma ONG
// Acessada via: POST http://localhost:3000/api/avaliacoes
router.post('/avaliacoes', avaliarONG);

export default router;