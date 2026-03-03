// src/routes/usuarios.routes.js
import { Router } from 'express';
import { validarCriacaoUsuario } from '../middlewares/validacao.middleware.js';
import {
  listarUsuarios,
  obterUsuario,
  criarUsuario,
  atualizarUsuario,
  removerUsuario,
} from '../controllers/usuarios.controller.js';

const router = Router();

router.get('/', listarUsuarios);
router.get('/:id', obterUsuario);
router.post('/', validarCriacaoUsuario, criarUsuario);
router.put('/:id', atualizarUsuario);
router.delete('/:id', removerUsuario);

export default router;