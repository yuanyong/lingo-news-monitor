import Exa from 'exa-js';

const exaApiKey = process.env.EXA_API_KEY;

if (!exaApiKey) {
  throw new Error('EXA_API_KEY environment variable is not set');
}

export const exa = new Exa(exaApiKey);
