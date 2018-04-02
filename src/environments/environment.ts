// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  clientId: 'tenniscorpoclientid',
  clientPassword: 'ABi8u34kPoDo',
  tokenUrl: 'http://localhost:9100/oauth/token', // URL to auth api
  publicApiUrl: 'http://localhost:9100/api/v1/public',  // URL to public web api
  privateApiUrl: 'http://localhost:9100/api/v1/private'  // URL to private web api
};
