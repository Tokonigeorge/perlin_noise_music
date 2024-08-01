import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import playIcon from '../app/play-icon-track.svg';
import { Track } from '../../types/interface';
import {
  WebPlaybackSDK,
  usePlayerDevice,
  useSpotifyPlayer,
  usePlaybackState,
} from 'react-spotify-web-playback-sdk';

const SongCard = ({
  song,
  handleSpotifyPlay,
}: {
  song: Track;
  handleSpotifyPlay: (song: Track, deviceId: string) => void;
}) => {
  const device = usePlayerDevice();

  const playbackState = usePlaybackState();
  const player = useSpotifyPlayer();

  return (
    <div
      className=' text-white flex items-center justify-between my-4 hover:bg-transparent cursor-pointer'
      onClick={() => handleSpotifyPlay(song, device?.device_id ?? '')}
    >
      <div className='flex items-center gap-2'>
        <Image
          src={song.album?.image?.url}
          width={40}
          height={40}
          alt='track'
        />
        <div>
          <p className='leading-tight text-ellipsis max-w-72'>{song.name}</p>
          <p className='text-sm text-gray-400 text-ellipsis'>
            {song.artists.join(' & ')}
          </p>
        </div>
      </div>

      {/* <div>
        <Image
          onClick={() => player?.resume()}
          src={playIcon}
          className='text-white cursor-pointer'
          width={20}
          height={20}
          alt='play icon'
        />
      </div> */}
    </div>
  );
};

export default SongCard;
