// import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse, NextRequest } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

export async function POST(_req: Request) {
  const data = await _req.json();
  const code = JSON.parse(data.body).code;

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: new URLSearchParams({
      code: code as string,
      redirect_uri: redirect_uri!,
      grant_type: 'authorization_code',
    }),
  };

  try {
    const response = await axios(authOptions);
    const { access_token, expires_in, refresh_token } = response.data;
    return NextResponse.json(
      { access_token, expires_in, refresh_token },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
