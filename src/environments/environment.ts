// Import utilise pour la variable 'process'

import { } from 'node';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const backend = {
  url : process.env.BACKEND_URL || 'http://localhost:9100'
}

export const environment = {
  production: false,
  clientId: 'tenniscorpoclientid',
  clientPassword: 'ABi8u34kPoDo',
  tokenUrl: backend.url + '/oauth/token', // URL to auth api
  publicApiUrl: backend.url + '/api/v1/public',  // URL to public web api
  privateApiUrl: backend.url + '/api/v1/private'  // URL to private web api
};
