// components/P5jsContainer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { sketch } from './sketch';
import p5Types from 'p5';

export const P5jsContainer = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // if not mounted, do nothing yet.
    if (!isMounted) return;

    // our current p5 sketch instance
    let p5instance: p5Types;

    // function that loads p5 and creates the sketch inside the div.
    const initP5 = async () => {
      try {
        // import the p5 and p5-sounds client-side
        const p5 = (await import('p5')).default;
        // await import("p5/lib/addons/p5.sound");
        // initalize the sketch
        new p5((p) => {
          sketch(p);
          p5instance = p;
        });
      } catch (error) {
        console.log(error);
      }
    };

    initP5();

    return () => p5instance.remove();
  }, [isMounted]);
  return <div></div>;
};
