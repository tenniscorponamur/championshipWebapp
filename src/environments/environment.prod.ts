// Import utilise pour la variable 'process'

import { } from 'node';

const backend = {
  url : 'https://tenniscorponamurengine.herokuapp.com'
}

export const environment = {
  production: true,
  clientId: 'tenniscorpoclientid',
  clientPassword: 'ABi8u34kPoDo',
  tokenUrl: backend.url + '/oauth/token', // URL to auth api
  publicApiUrl: backend.url + '/api/v1/public',  // URL to public web api
  privateApiUrl: backend.url + '/api/v1/private'  // URL to private web api
};
