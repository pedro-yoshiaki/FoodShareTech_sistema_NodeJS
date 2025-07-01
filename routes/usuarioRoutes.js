import express from 'express';
import { cadastrarUsuario, loginUsuario } from '../controllers/usuarioController.js';

const router = express.Router();

// Rota para cadastro
router.post('/cadastro', cadastrarUsuario);

// Rota para login
router.post('/login', loginUsuario);

export default router;