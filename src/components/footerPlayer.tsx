import React, { useEffect } from 'react';
import Image from 'next/image';
import VolumeUp from '@/app/volume-loud.svg';
import VolumeMute from '@/app/volume-mute.svg';
import musicIcon from '@/app/music-play.svg';
import playIcon from '@/app/play-icon.svg';
import pauseIcon from '@/app/pause-icon.svg';
import { AppActionKind } from '../../types/interface';
import {
  usePlaybackState,
  useSpotifyPlayer,
} from 'react-spotify-web-playback-sdk';
import { ISongDetails } from '../../types/interface';
import { useAppContext } from '@/app/wrapper';

export const FooterPlayer = ({
  songDetails,
  muteSound,
  setMuteSound,
  audioContext,
  gainNode,
}: {
  songDetails: ISongDetails;
  muteSound: boolean;
  setMuteSound: React.Dispatch<React.SetStateAction<boolean>>;
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
}) => {
  const player = useSpotifyPlayer();

  const {
    state: { isPlaying },
    dispatch,
  } = useAppContext();

  const handleMute = () => {
    if (gainNode) {
      console.log('hdne:', gainNode.gain.value);
      gainNode.gain.setValueAtTime(0, audioContext!.currentTime);
    }
  };

  const handleUnmute = () => {
    if (gainNode) {
      console.log('hdne2w:', gainNode.gain.value);
      gainNode.gain.setValueAtTime(1, audioContext!.currentTime);
    }
  };

  useEffect(() => {
    player?.getCurrentState().then((state) => {
      if (!state) {
        dispatch({
          type: AppActionKind.playing,
          payload: false,
        });
      }
    });
  }, [player]);

  return (
    <div className='absolute bottom-0 left-0 w-full'>
      <div className='relative'>
        <div className='w-full h-0.5 absolute top-0 left-0 bg-gray-300'>
          <div className=' bg-bgBlue h-0.5'></div>
        </div>
      </div>
      <div className='bg-white grid grid-cols-3 items-center'>
        <div className='flex-row flex items-center gap-3'>
          <div className='w-16 h-16 bg-orange-100'>
            <Image
              src={songDetails.imageUrl || musicIcon}
              className=''
              width={200}
              height={200}
              alt='music playig icon'
            />
          </div>
          <div>
            <p className='font-semibold'>{songDetails.title}</p>
            <p className='text-sm text-gray-300 leading-3'>
              {songDetails.artists ?? ''}
            </p>
          </div>
        </div>
        <div
          className='w-16 h-16 mx-auto py-2.5 px-2'
          style={{ zIndex: '100' }}
        >
          {isPlaying ? (
            <Image
              alt='play-icon'
              width={200}
              height={200}
              onClick={() => {
                player && player?.pause();
                audioContext && audioContext.suspend();
                dispatch({
                  type: AppActionKind.playing,
                  payload: !isPlaying,
                });
              }}
              src={pauseIcon}
              className='cursor-pointer'
            />
          ) : (
            <Image
              alt='play-icon'
              width={200}
              height={200}
              onClick={() => {
                player && player.resume();
                audioContext && audioContext.resume();
                dispatch({
                  type: AppActionKind.playing,
                  payload: !isPlaying,
                });
              }}
              src={playIcon}
              className='cursor-pointer'
            />
          )}
        </div>
        <div className='w-16 h-16 flex flex-row justify-self-end py-6 px-6'>
          {muteSound ? (
            <Image
              alt='mute-volume icon'
              width={200}
              height={200}
              src={VolumeMute}
              onClick={() => {
                player && player?.setVolume(1);

                handleUnmute();

                setMuteSound(!muteSound);
              }}
              className='cursor-pointer'
            />
          ) : (
            <Image
              alt='play-volume icon'
              width={200}
              height={200}
              src={VolumeUp}
              onClick={() => {
                player && player?.setVolume(0);
                handleMute();
                setMuteSound(!muteSound);
              }}
              className='cursor-pointer'
            />
          )}
        </div>
      </div>
    </div>
  );
};
