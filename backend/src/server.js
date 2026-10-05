// Importe l'application Express et ses routes.
import app from './app.js';

// Importe la configuration du serveur.
import { env } from './config/env.js';

// Importe le pool et la fonction de vérification PostgreSQL.
import { pool, testDatabaseConnection } from './config/database.js';

// Cette fonction démarre le backend après avoir vérifié la base.
async function startServer() {
  try {
    // Attend la réponse de PostgreSQL avant de continuer.
    const databaseName = await testDatabaseConnection();

    // Démarre l'API seulement si la connexion à la base a réussi.
    app.listen(env.port, () => {
      console.log(`Connecté à la base PostgreSQL : ${databaseName}`);
      console.log(`StudentSpace écoute sur http://localhost:${env.port}`);
    });
  } catch (error) {
    // Explique clairement pourquoi le backend n'a pas pu démarrer.
    console.error(
      'Impossible de démarrer le backend : connexion PostgreSQL échouée.',
      error.message
    );

    // Ferme proprement les connexions ouvertes.
    await pool.end();

    // Indique au système que le démarrage s'est terminé en erreur.
    process.exitCode = 1;
  }
}

// Lance la fonction de démarrage.
startServer();