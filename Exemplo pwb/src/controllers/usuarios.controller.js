import { UsuariosService } from '../services/usuarios.service.js';

const service = new UsuariosService();

export const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await service.listarTodos();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
};

export const obterUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await service.buscarPorId(Number(id));

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (err) {
    next(err);
  }
};

export const criarUsuario = async (req, res, next) => {
  try {
    const dados = req.body;
    const novoUsuario = await service.criar(dados);
    res.status(201).json(novoUsuario);
  } catch (err) {
    next(err);
  }
};

export const atualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;
    const usuarioAtualizado = await service.atualizar(Number(id), dados);
    res.json(usuarioAtualizado);
  } catch (err) {
    next(err);
  }
};

export const removerUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    await service.remover(Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};