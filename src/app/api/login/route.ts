import type { NextApiRequest, NextApiResponse } from 'next';
import { uuid } from 'uuidv4';
import { redirect } from 'next/navigation';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

export async function GET(_req: NextApiRequest, res: NextApiResponse) {
  const scope =
    'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state';
  const state = uuid();

  const authQueryParameters = new URLSearchParams({
    response_type: 'code',
    client_id: client_id!,
    scope: scope,
    redirect_uri: redirect_uri!,
    state: state,
  });
  redirect(
    'https://accounts.spotify.com/authorize/?' + authQueryParameters.toString()
  );
}
