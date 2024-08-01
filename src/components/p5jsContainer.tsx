'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sketch } from './sketch';
import p5Types from 'p5';
import { useAppContext } from '@/app/wrapper';

export const P5jsContainer = () => {
  const p5Ref = useRef<p5Types | null>(null);
  const { state } = useAppContext();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const p5State: IP5State = {
    angMult: 25,
    angTurn: 1,
    cols: 0,
    rows: 0,
    zoff: 0,
    particles: [],
    flowfield: [],
    p: 1,
    hu: 0,
    zOffInc: 0.00001,
    inc: 0.1,
    scl: 10,
    colorInc: 1.5,
  };

  // on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // if not mounted, do nothing yet.
    if (!isMounted) return;

    let p5instance: p5Types;

    const initP5 = async () => {
      try {
        const p5 = (await import('p5')).default;
        // initalize the sketch
        p5Ref.current = new p5((p) => {
          Sketch(p, p5State);
          p5instance = p;
        });
      } catch (error) {
        console.log(error);
      }
    };

    initP5();

    return () => p5instance.remove();
  }, [isMounted]);

  useEffect(() => {
    if (p5Ref.current !== null) {
      p5Ref.current.draw = () => {
        if (!state.isPlaying) p5Ref.current?.noLoop();
        if (p5State.p > 0) {
          var yoff = 0;
          for (var y = 0; y < p5State.rows; y++) {
            var xoff = 0;
            for (var x = 0; x < p5State.cols; x++) {
              var index = x + y * p5State.cols;
              var angle = p5Ref.current
                ? p5Ref.current.noise(xoff, yoff, p5State.zoff) *
                    p5State.angMult +
                  p5State.angTurn
                : 0;

              if (state.amplitudeData.length > 0) {
                angle +=
                  (state.amplitudeData[index % state.amplitudeData.length] /
                    256.0) *
                  Math.PI *
                  2;
              }

              var v = p5Ref.current
                ? // @ts-ignore
                  p5Ref.current.constructor?.Vector?.fromAngle(angle)
                : 0;
              v?.setMag(1);
              p5State.flowfield[index] = v;
              xoff += p5State.inc;
            }
            yoff += p5State.inc;

            p5State.zoff += p5State.zOffInc;
          }

          for (var i = 0; i < p5State.particles.length; i++) {
            p5State.particles[i].follow(p5State.flowfield);
            p5State.particles[i].update();
            p5State.particles[i].edges();
            p5State.particles[i].show();
          }

          // fr.html(floor(frameRate()));
          p5State.hu += p5State.colorInc;
          if (p5State.hu > 359) {
            p5State.hu = 0;
          }
        }
      };
    }
  }, [state.amplitudeData, state.isPlaying]);

  return <div></div>;
};
