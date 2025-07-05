import express from 'express';
import {  listarBeneficiariosPorOng, cadastrarBeneficiario, excluirBeneficiario} from '../controllers/beneficiarioController.js';

const router = express.Router();

router.get('/beneficiarios', listarBeneficiariosPorOng); 
// Rota para cadastrar um novo beneficiário
router.post('/beneficiarios', cadastrarBeneficiario);
router.delete('/beneficiarios/:id', excluirBeneficiario);

export default router;