import fs from 'fs';
import yaml from 'yamljs';
import path from 'path';
import { SERVER_URL } from './env.js';

const swaggerPath = path.resolve(process.cwd(), "docs/swagger.yaml");

// baca YAML sebagai text
let rawYaml = fs.readFileSync(swaggerPath, "utf8");

// replace placeholder ke ENV
rawYaml = rawYaml.replace(/{{SERVER_URL}}/g, SERVER_URL);

// load setelah replace
const swaggerDocument = yaml.parse(rawYaml);

export default swaggerDocument;