import express from 'express';
import { cadastrarBeneficiario } from '../controllers/beneficiarioController.js';

const router = express.Router();

// Rota para cadastrar um novo beneficiário
router.post('/beneficiarios', cadastrarBeneficiario);

export default router;