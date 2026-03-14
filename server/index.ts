import express from 'express';
import cors from 'cors';
import * as neo4jService from './neo4j-service.js';
import * as kuzuService from './kuzu-service.js';
import type { DbType } from './types.js';

const app = express();
app.use(cors());
app.use(express.json());

let activeDb: DbType | null = null;

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, connected: activeDb, timestamp: new Date().toISOString() });
});

// Connect to a database
app.post('/api/connect', async (req, res) => {
  const { dbType, uri, username, password, database, dbPath } = req.body as {
    dbType: DbType;
    uri?: string;
    username?: string;
    password?: string;
    database?: string;
    dbPath?: string;
  };

  try {
    // Disconnect existing
    if (activeDb === 'neo4j') await neo4jService.disconnect();
    if (activeDb === 'kuzu') await kuzuService.disconnect();

    if (dbType === 'neo4j') {
      if (!uri || !username || !password) {
        res.status(400).json({ success: false, error: 'Missing Neo4j connection parameters (uri, username, password)' });
        return;
      }
      await neo4jService.connect(uri, username, password, database);
      activeDb = 'neo4j';
    } else if (dbType === 'kuzu') {
      if (!dbPath) {
        res.status(400).json({ success: false, error: 'Missing KuzuDB path (dbPath)' });
        return;
      }
      await kuzuService.connect(dbPath);
      activeDb = 'kuzu';
    } else {
      res.status(400).json({ success: false, error: `Unsupported dbType: ${String(dbType)}` });
      return;
    }

    res.json({ success: true, data: { dbType: activeDb } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Connection failed' });
  }
});

// Disconnect
app.post('/api/disconnect', async (_req, res) => {
  try {
    if (activeDb === 'neo4j') await neo4jService.disconnect();
    if (activeDb === 'kuzu') await kuzuService.disconnect();
    activeDb = null;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Disconnect failed' });
  }
});

// Get schema
app.get('/api/schema', async (_req, res) => {
  try {
    if (!activeDb) {
      res.status(400).json({ success: false, error: 'Not connected to any database' });
      return;
    }
    const schema = activeDb === 'neo4j'
      ? await neo4jService.getSchema()
      : await kuzuService.getSchema();
    res.json({ success: true, data: schema });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to get schema' });
  }
});

// Execute query
app.post('/api/query', async (req, res) => {
  const { cypher } = req.body as { cypher: string };

  if (!cypher || typeof cypher !== 'string') {
    res.status(400).json({ success: false, error: 'Missing cypher query' });
    return;
  }

  try {
    if (!activeDb) {
      res.status(400).json({ success: false, error: 'Not connected to any database' });
      return;
    }
    const result = activeDb === 'neo4j'
      ? await neo4jService.executeQuery(cypher)
      : await kuzuService.executeQuery(cypher);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Query failed' });
  }
});

const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
