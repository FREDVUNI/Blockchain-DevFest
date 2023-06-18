'use client';
import React, { useReducer } from 'react';
import Hero from './Hero';
import { useGlobalState } from 'store';
import Events from './AllEvents';

const LandingPage = () => {
  const connectedAccount = useGlobalState('connectedAccount');

  return (
    <div className='py-24 sm:py-28 max-w-4xl mx-auto'>
      <Hero />
      <div className='pb-10 sm:pb-10 text-white'>
        {connectedAccount ? (
          <h2 className='font-semibold text-2xl text-center sm:text-left'>
            Latest events
          </h2>
        ) : (
          <p className='font-bold text-center pt-5'>
            Please, Connecte Your Celo extension wallet!
          </p>
        )}
      </div>
      <Events/>
    </div>
  );
};

export default LandingPage;
