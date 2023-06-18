import { TicketNFTContract, TicketingContract, getAllEvents, getMyEvents, singleEvent } from '@/Blockchain';
import LandingPage from '@/components/LandingPage';
import Head from 'next/head';
import { useEffect } from 'react';
import { useGlobalState } from 'store';

export default function Home() {
  const connectedAccount = useGlobalState('connectedAccount')
  

  useEffect(() => {
    const loadData = async () => {
      await getAllEvents();  
      getMyEvents()
     };
    loadData();
  }, [connectedAccount]);
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <LandingPage />
      </main>
    </>
  );
}
