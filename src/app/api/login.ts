// import type { NextApiRequest, NextApiResponse } from 'next';
// import { uuid } from 'uuidv4';

// const client_id = process.env.SPOTIFY_CLIENT_ID;
// const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// const login = (_req: NextApiRequest, res: NextApiResponse) => {
//   const scope = 'user-read-private user-read-email streaming';
//   const state = uuid();

//   const authQueryParameters = new URLSearchParams({
//     response_type: 'code',
//     client_id: client_id!,
//     scope: scope,
//     redirect_uri: redirect_uri!,
//     state: state,
//   });

//   res.redirect(
//     'https://accounts.spotify.com/authorize/?' + authQueryParameters.toString()
//   );
// };

// export default login;
