import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// In-memory storage 
interface Schema {
  id: string;
  name: string;
  schema: any;
  createdAt: string;
}

interface Submission {
  id: string;
  schemaId: string;
  data: any;
  submittedAt: string;
}

let schemas: Schema[] = [];
let submissions: Submission[] = [];

// Load data from files if they exist
const loadData = async () => {
  try {
    const schemasData = await fs.readFile(path.join(process.cwd(), 'data', 'schemas.json'), 'utf-8');
    schemas = JSON.parse(schemasData);
    console.log('Loaded schemas:', schemas.length);
  } catch (error) {
    console.log('No existing schemas file found, starting fresh');
  }

  try {
    const submissionsData = await fs.readFile(path.join(process.cwd(), 'data', 'submissions.json'), 'utf-8');
    submissions = JSON.parse(submissionsData);
    console.log('Loaded submissions:', submissions.length);
  } catch (error) {
    console.log('No existing submissions file found, starting fresh');
  }
};

// Save data to files
const saveData = async () => {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    await fs.writeFile(
      path.join(process.cwd(), 'data', 'schemas.json'),
      JSON.stringify(schemas, null, 2)
    );
    await fs.writeFile(
      path.join(process.cwd(), 'data', 'submissions.json'),
      JSON.stringify(submissions, null, 2)
    );
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// static path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../../dist')));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});


// Routes
app.post('/api/schemas', async (req, res) => {
  try {
    console.log('Received schema creation request:', req.body);
    const { name, schema } = req.body;

    if (!name || !schema) {
      console.log('Missing name or schema');
      return res.status(400).json({ error: 'Name and schema are required' });
    }

    // Validate 
    try {
      const validator = ajv.compile(schema);
      console.log('Schema validation successful');
    } catch (error) {
      console.log('Schema validation failed:', error);
      return res.status(400).json({ error: 'Invalid JSON Schema format' });
    }

    const newSchema: Schema = {
      id: uuidv4(),
      name,
      schema,
      createdAt: new Date().toISOString(),
    };

    schemas.push(newSchema);
    await saveData();

    console.log('Schema created successfully:', newSchema.id);
    res.json(newSchema);
  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/schemas', (req, res) => {
  console.log('Fetching schemas, count:', schemas.length);
  res.json(schemas);
});

app.get('/api/schemas/:id', (req, res) => {
  const schema = schemas.find(s => s.id === req.params.id);
  if (!schema) {
    return res.status(404).json({ error: 'Schema not found' });
  }
  res.json(schema);
});

app.post('/api/schemas/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    console.log('Form submission for schema:', id);

    const schema = schemas.find(s => s.id === id);
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }

    // Validate data against schema
    const validate = ajv.compile(schema.schema);
    const valid = validate(data);

    if (!valid) {
      console.log('Validation failed:', validate.errors);
      return res.status(400).json({
        error: 'Validation failed',
        errors: validate.errors,
      });
    }

    const submission: Submission = {
      id: uuidv4(),
      schemaId: id,
      data,
      submittedAt: new Date().toISOString(),
    };

    submissions.push(submission);
    await saveData();

    console.log('Form submitted successfully:', submission.id);
    res.json(submission);
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/schemas/:id/submissions', (req, res) => {
  const { id } = req.params;
  const schemaSubmissions = submissions.filter(s => s.schemaId === id);
  console.log('Fetching submissions for schema:', id, 'count:', schemaSubmissions.length);
  res.json(schemaSubmissions);
});

app.get('/api/submissions', (req, res) => {
  console.log('Fetching all submissions, count:', submissions.length);
  res.json(submissions);
});

app.delete('/api/schemas/:id', async (req, res) => {
  const { id } = req.params;
  const index = schemas.findIndex(s => s.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Schema not found' });
  }

  schemas.splice(index, 1);
  // remove associated submissions
  submissions = submissions.filter(s => s.schemaId !== id);
  
  await saveData();
  console.log('Schema deleted:', id);
  res.json({ message: 'Schema deleted successfully' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize data and start server
loadData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Loaded ${schemas.length} schemas and ${submissions.length} submissions`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});