'use client';
import { EB_Garamond } from 'next/font/google';
import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import SpotifyLogo from './spotify-logo.png';
import SearchIcon from './search-icon.svg';
import SongCard from '@/components/songCard';
import { WebPlaybackSDK } from 'react-spotify-web-playback-sdk';
import { AppActionKind, Track } from '../../types/interface';
import { FooterPlayer } from '@/components/footerPlayer';
import { ISongDetails } from '../../types/interface';
import { useAppContext } from './wrapper';

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
});

export default function Home() {
  const { dispatch } = useAppContext();

  const [muteSound, setMuteSound] = useState<boolean>(false);
  const [songDetails, setSongDetails] = useState<ISongDetails>({ title: '' });
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(
    null
  );
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [playSong, setPlaySong] = useState<boolean>(false);

  const [hideText, setHideText] = useState<boolean>(false);

  const [songList, setSongList] = useState<Track[]>([]);

  const [search, setSearch] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSpotifyConnect = () => {
    const storedToken = localStorage.getItem('spotify_access_token');
    const tokenExpiry = localStorage.getItem('expires_in');

    if (
      storedToken &&
      tokenExpiry &&
      new Date().getTime() < parseInt(tokenExpiry)
    ) {
      setAccessToken(storedToken);
      setHideText(true);
    } else {
      window.location.href = 'api/login';
    }
  };

  const handleSongUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSongDetails({ title: file.name });
      setHideText(true);
      await processAudioFile(file);
    }
  };

  const processAudioFile = async (file: File) => {
    const context = new window.AudioContext();
    setAudioContext(context);
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    analyzeAudio(audioBuffer, context);
  };

  const analyzeAudio = (audioBuffer: AudioBuffer, context: AudioContext) => {
    if (audioSource) {
      audioSource.stop();
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    setAudioSource(source);

    const gainNode = context.createGain();
    setGainNode(gainNode);

    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(context.destination);

    source.start(0);
    dispatch({
      type: AppActionKind.playing,
      payload: true,
    });
    setPlaySong(true);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const getAudioData = () => {
      if (analyser) {
        analyser.getByteTimeDomainData(dataArray);
        dispatch({
          type: AppActionKind.amplitude,
          payload: Array.from(dataArray),
        });
        analyser.getByteFrequencyData(dataArray);
        dispatch({
          type: AppActionKind.frequency,
          payload: Array.from(dataArray),
        });
        setInterval(() => {
          setAnimationFrame(requestAnimationFrame(getAudioData));
        }, 50000);
      }
    };

    source.addEventListener('ended', () => {
      dispatch({
        type: AppActionKind.playing,
        payload: false,
      });
    });

    getAudioData();
  };

  const getRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token') ?? '';

    if (refreshToken) {
      try {
        const response = await axios.post('/api/refreshtoken', {
          body: JSON.stringify({ refreshToken: refreshToken }),
        });

        const { access_token, refresh_token, expires_in } = response.data;
        if (access_token) {
          localStorage.setItem('spotify_access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem(
            'expires_in',
            (new Date().getTime() + expires_in * 1000).toString()
          );

          setAccessToken(access_token);
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }
  };

  const getToken = async (code: string) => {
    try {
      const response = await axios.post('/api/token', {
        body: JSON.stringify({ code: code }),
      });

      const { access_token, refresh_token, expires_in } = response.data;
      if (access_token) {
        localStorage.setItem('spotify_access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem(
          'expires_in',
          (new Date().getTime() + expires_in * 1000).toString()
        );

        setAccessToken(access_token);
      }
    } catch (error) {
      console.error('Error fetching the token:', error);
    }
  };

  useEffect(() => {
    const checkForAccessToken = async () => {
      const storedToken = localStorage.getItem('spotify_access_token');
      const tokenExpiry = localStorage.getItem('expires_in');

      if (
        storedToken &&
        tokenExpiry &&
        new Date().getTime() < parseInt(tokenExpiry)
      ) {
        setAccessToken(storedToken);
        setHideText(true);
      } else {
        const urlAccessCode = searchParams?.get('code');
        if (urlAccessCode) {
          getToken(urlAccessCode);
          setHideText(true);

          const params = new URLSearchParams(window.location.search);
          params.delete('code');
          params.delete('state');

          const newUrl = `${pathname}?${params.toString()}`;
          router.replace(newUrl);
        } else {
          await getRefreshToken();
        }
      }
    };

    checkForAccessToken();
  }, [pathname]);

  const searchSongs = async (query: string) => {
    if (!accessToken) return;
    const result = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
      },
    });
    //todo: pass only five items to search
    console.log('track item:', result.data.tracks.items);
    const tracks = result.data.tracks.items?.slice(0, 5).map((i: any) => {
      return {
        id: i.id,
        href: i.href,
        uri: i.uri,
        name: i.name,
        duration: i.duration,
        preview_url: i.preview_url,
        artists: i.artists?.map((artist: any) => {
          return artist.name;
        }),
        album: {
          name: i.album.name,
          image: i.album.images[0],
        },
      };
    });
    setSongList(tracks);
    return;
  };

  const handleSetSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearch = async () => {
    const tokenExpiry = localStorage.getItem('expires_in');
    if (tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
      search && searchSongs(search);
    } else {
      await getRefreshToken();
      search && searchSongs(search);
    }
  };

  const getOAuthToken = useCallback(
    (callback: any) => callback(accessToken),
    [accessToken]
  );

  const analyzeMediaElementSource = (analyser: AnalyserNode) => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const getAudioData = () => {
      if (analyser) {
        analyser.getByteTimeDomainData(dataArray);
        dispatch({
          type: AppActionKind.amplitude,
          payload: Array.from(dataArray),
        });
        analyser.getByteFrequencyData(dataArray);
        dispatch({
          type: AppActionKind.frequency,
          payload: Array.from(dataArray),
        });

        setAnimationFrame(requestAnimationFrame(getAudioData));
      }
    };
    getAudioData();
  };

  const handleSpotifyPlay = async (song: Track, device_id: string) => {
    setAudioContext(new window.AudioContext());

    const uri = song.uri;
    try {
      await axios({
        method: 'put',
        url: `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
        headers: { Authorization: 'Bearer ' + accessToken },
        data: {
          uris: [uri],
        },
      });
    } catch (error) {
      console.log('Error playing track:', error);
    }

    setPlaySong(true);
    dispatch({
      type: AppActionKind.playing,
      payload: true,
    });
    setSongDetails({
      title: song.name,
      artists: song.artists.join(' & '),
      imageUrl: song.album?.image?.url,
    });

    const audio = new Audio();

    audio.src = song.preview_url;
    audio.crossOrigin = 'anonymous';

    audio.addEventListener('canplay', () => {
      if (audioContext) {
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyzeMediaElementSource(analyser);
      }
    });
    audio.load();
  };

  return (
    <main className={`${garamond.className} bg-bgBlue w-full h-full`}>
      <WebPlaybackSDK
        initialDeviceName='Perlin Spotify'
        getOAuthToken={getOAuthToken}
        initialVolume={1}
      >
        {playSong && (
          <FooterPlayer
            songDetails={songDetails}
            audioContext={audioContext}
            gainNode={gainNode}
            muteSound={muteSound}
            setMuteSound={setMuteSound}
          />
        )}

        {
          <div className='z-50 absolute flex-row items-center content-center justify-between p-12 lg:justify-start h-full'>
            <div className='flex-col justify-center bg-trans px-6 pb-6 rounded-2xl'>
              <div>
                <p className='text-6.5xl leading-xloose'>
                  Perlin Noise <br /> Music Visualizer
                </p>
                <p className='text-xl font-light pt-0'>
                  Music turned into captivating visual art using perlin noise.
                  <br /> To know more about perlin noise,{' '}
                  <span className='italic underline cursor-pointer'>
                    click here.
                  </span>
                </p>
              </div>

              {!hideText && (
                <div className='flex-col space-y-4  mt-4'>
                  <div>
                    <div
                      className='cursor-pointer rounded-lg text-base text-gray-100 bg-bgBlue text-center max-w-fit shadow-btn'
                      role='button'
                      aria-describedby='import music'
                    >
                      <label
                        htmlFor='song-upload'
                        className='cursor-pointer inline-block px-4 py-2'
                      >
                        Import song from library
                      </label>
                      <input
                        id='song-upload'
                        type='file'
                        onChange={handleSongUpload}
                        accept='.mp3'
                        className='hide'
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                  <p>Or</p>
                  <div>
                    <div aria-describedby='link to a music on spotify'>
                      <button
                        onClick={handleSpotifyConnect}
                        className='bg-spotifyGrn text-white py-2 px-4 rounded-lg flex items-center gap-2'
                      >
                        <Image
                          alt='spotify icon'
                          width={20}
                          height={20}
                          src={SpotifyLogo}
                        />{' '}
                        Play with Spotify
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {accessToken && hideText && (
                <>
                  <div className='flex mt-4 items-center border border-x-0 border-t-0 border-black bg-bgBlue text-white px-4 rounded-lg'>
                    <Image
                      onClick={handleSearch}
                      src={SearchIcon}
                      className='text-white cursor-pointer'
                      width={20}
                      height={20}
                      alt='search icon'
                    />
                    <input
                      value={search}
                      onChange={handleSetSearch}
                      placeholder='What do you want to play?'
                      className='text-base border-x-0 border-y-0 text-white pl-4 py-2 min-w-box
            bg-bgBlue
            rounded-lg
                   placeholder:text-white font-normal 
                    focus:outline-none'
                    />
                  </div>

                  {songList.length > 0 && (
                    <div className='bg-bgBlue rounded-lg mt-4 p-4'>
                      {songList.map((song, index) => (
                        <SongCard
                          key={index}
                          song={song}
                          handleSpotifyPlay={handleSpotifyPlay}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        }

        <div id='myContainer1'></div>
      </WebPlaybackSDK>
    </main>
  );
}
