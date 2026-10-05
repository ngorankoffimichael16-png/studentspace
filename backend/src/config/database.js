// Importe Pool, le gestionnaire de connexions fourni par le paquet pg.
import { Pool } from 'pg';

// Importe les réglages lus et vérifiés dans env.js.
import { env } from './env.js';

// Prépare un pool de connexions vers PostgreSQL.
export const pool = new Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,

  // Limite le nombre de connexions simultanées.
  max: 10,

  // Attend au maximum cinq secondes pour obtenir une connexion.
  connectionTimeoutMillis: 5000,
});

// Signale une erreur imprévue sur une connexion inactive du pool.
pool.on('error', (error) => {
  console.error('Erreur sur une connexion PostgreSQL inactive :', error.message);
});

// Vérifie la connexion en demandant le nom de la base active.
export async function testDatabaseConnection() {
  const result = await pool.query('SELECT current_database()');

  return result.rows[0].current_database;
}