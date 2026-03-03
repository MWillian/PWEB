import usuariosRouter from './routes/usuarios.routes.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import multer from 'muter';
import path from 'path';
import compression from 'compression';

const app = express();

//uso do compression
app.use(compression());
app.use(
  compression({
    level: 6,        // Nível de compressão: 0 (nenhum) a 9 (máximo). 6 é o padrão.
    threshold: 1024, // Só comprime respostas maiores que 1 KB
    filter: (req, res) => {
      // Não comprime se o cliente enviar o cabeçalho x-no-compression
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res); // Comportamento padrão para os demais casos
    },
  })
);


//uso do morgan
app.use(morgan('dev'));

//uso do cors
app.use(cors());//dev
app.use(cors({
  origin: ['https://meuapp.com', 'https://admin.meuapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());//auto parsing pra json

//uso do router
app.use('/usuarios', usuariosRouter);
app.use(helmet);

//alguns middlewares
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}()]  ${req.method}  ${req.url}`);
});

app.use((req, res, next) => {
  req.timestampInicio = Date.now();
  next();
});

//uso do rate-limit
const limiteGeral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos em milissegundos
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,  // Inclui headers RateLimit-* na resposta
  legacyHeaders: false,
});

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Apenas 10 tentativas de login por janela
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

//uso do multer
// Configuração de armazenamento em disco
const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Diretório de destino
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    cb(null, nomeUnico);
  },
});

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 MB
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const valido = tiposPermitidos.test(file.mimetype);
    cb(null, valido); // true = aceita, false = rejeita
  },
});

// Upload de arquivo único no campo "foto"
app.post('/usuarios/:id/foto', upload.single('foto'), (req, res) => {
  res.json({ caminho: req.file.path });
});

// Upload de múltiplos arquivos
app.post('/galeria', upload.array('imagens', 5), (req, res) => {
  const caminhos = req.files.map((f) => f.path);
  res.json({ arquivos: caminhos });
});

//endpoints
app.get('/saude', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/usuarios', (req, res) => {
  const { nome, email } = req.body;
  res.status(201).json({ nome, email });
});

// Define uma rota PUT em /produtos/:id — substitui completamente um recurso existente
app.put('/produtos/:id', (req, res) => {
  console.log(req.body);
  const { id } = req.params; // Extrai o segmento dinâmico da URL
  // Ex: PUT /produtos/42  →  id === "42"
  // Atenção: params sempre retorna string, mesmo que o valor seja numérico
  res.json({ ...req.body, id }); // Combina o id com os dados recebidos no corpo
  // Ex: { id: "42", nome: "Cadeira", preco: 350 }
  // O spread ...req.body "espalha" as propriedades do objeto recebido (ver explicação abaixo)
});

// Define uma rota DELETE em /produtos/:id — remove o recurso identificado pelo id
app.delete('/produtos/:id', (req, res) => {
  res.status(204).send(); // 204 No Content: operação bem-sucedida, sem corpo na resposta
  // Usar res.json() aqui seria incorreto — 204 não deve ter body
});


app.listen(3000);                     