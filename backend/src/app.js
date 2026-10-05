// Importe Express, qui sert à construire notre API.
import express from 'express';
// Importe le routeur qui contient la route d'inscription.
import authRouter from './routes/auth.routes.js';
// Importe le gestionnaire des erreurs inattendues.
import { errorHandler } from './middlewares/error.middleware.js';// Reçoit les erreurs inattendues transmises par les routes et contrôleurs.
// Importe CORS pour autoriser le frontend à appeler l'API depuis son navigateur.
import cors from 'cors';
// Crée l'application Express.
const app = express();
// Construit le chemin du dossier où les photos sont enregistrées.
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Importe le routeur des fonctionnalités utilisateur.
import userRouter from './routes/user.routes.js'
// Autorise le frontend configuré pour cet environnement.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
app.use(cors({ origin: allowedOrigins }));

// Permet à Express de lire les données JSON envoyées dans les requêtes.
app.use(express.json({ limit: '10kb' }));
// Calcule le chemin absolu du dossier backend/uploads.
const uploadsDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../uploads'
)

// Rend les photos enregistrées accessibles au navigateur.
app.use('/uploads', express.static(uploadsDirectory, { index: false }))
// Route d'accueil : elle répond à une demande GET sur "/".
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenue sur l’API StudentSpace.',
  });
});
 // Relie le préfixe /api/users aux routes utilisateur.
app.use('/api/users', userRouter)
// Route de vérification : elle répond à une demande GET sur "/health".
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Le backend StudentSpace répond.',
  });
});
// Route d'exercice : reçoit du JSON avec POST et le renvoie à Postman.
// Elle ne sauvegarde pas les données dans une base de données.
app.post('/api/demo', (req, res) => {
  res.status(200).json({
    message: 'Le backend a reçu les données.',
    donneesRecues: req.body,
  });
});

// Relie le préfixe /api/auth aux routes d'authentification.
app.use('/api/auth', authRouter);

// Si aucune route ne correspond à la demande, renvoie une réponse 404.
app.use((req, res) => {
  res.status(404).json({
    error: 'Route introuvable.',
  });
});
// Importe le gestionnaire des erreurs inattendues.
app.use(errorHandler);

// Rend l'application accessible depuis server.js.
export default app;