import express from 'express';
import { cadastrarUsuario, loginUsuario, verPerfilUsuario, atualizarPerfilUsuario, deletarContaUsuario} from '../controllers/usuarioController.js';

const router = express.Router();

// Rota para cadastro
router.post('/cadastro', cadastrarUsuario);

// Rota para login
router.post('/login', loginUsuario);

//Rota para Visualizar informações
router.get('/usuarios/me', verPerfilUsuario);
router.put('/usuarios/me', atualizarPerfilUsuario);
router.delete('/usuarios/me', deletarContaUsuario);

export default router;