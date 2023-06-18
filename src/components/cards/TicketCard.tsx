'use client';
import React, { useEffect, useState } from 'react';
import { FaTicketAlt } from 'react-icons/fa';
import { HiOutlineLocationMarker } from 'react-icons/hi';

import { useRouter } from 'next/router';
import { displayData, setGlobalState, useGlobalState } from 'store';
import {
  TicketNFTAddress,
  buyTicket,
  fetchMinted,
  mintsByUser,
  renderQRcode,
  safeMint,
  uploadJson,
  uploadTicketImage,
} from '@/Blockchain';
import { toast } from 'react-hot-toast';
import ShowRQ from '../ShowRQ';

interface ITicketCard {
  category: string;
  eventDate?: number | undefined;
  eventTitle: string;
  sold: boolean;
  ticketId: number;
  ticketPrice: string;
  eventVenue: string;
  eventId: number;
  completed: boolean;
  eventOwner: string;
}

const TicketCard = ({
  category,
  eventDate,
  eventId,
  sold,
  eventVenue,
  eventTitle,
  ticketId,
  ticketPrice,
  completed,
  eventOwner,
}: ITicketCard) => {
  const router = useRouter();
  const [connectedAccount] = useGlobalState('connectedAccount');
  const [minted, setMinted] = useState([]);
  console.log('loging it ', ticketId);

  const checkOwner =
    connectedAccount?.toLocaleLowerCase() == eventOwner?.toLocaleLowerCase();
  const handlePurchase = async () => {
    try {
      const purchase = await buyTicket(eventId, category, ticketPrice);

      // router.push('/myTickets');
    } catch (error) {
      console.log('error: ', error);
    }
  };
  // qr code image data if requested
  const [qr_code, setQRcode] = useState('');

  // watch qr code button event
  //@ts-ignore
  const watchQRcode = async (ticketId) => {
    //@ts-ignore
    setQRcode(await renderQRcode(ticketId, 'data'));
  };

  // mint nft event
  const mintNFT = async () => {
    // upload ticket qr code image to pinata
    // it have been already uploaded so pinata does not upload it again
    // and only returns it's ipfs hash
    const image_hash = await uploadTicketImage(ticketId);

    // get uploaded metadata hash
    const meta_hash = await uploadJson(ticketId, image_hash);

    toast('Loading, please wait..');

    // mint nft with specific ipfs gateway url
    if (
      await safeMint(ticketId, `https://gateway.pinata.cloud/ipfs/${meta_hash}`)
    )
      await fetchMinted();
  };

  // fetch minted nfts by user
  const fetchMinted = async () => {
    const mints = await mintsByUser();
    setMinted(mints);
  };
  // render button on ticket
  console.log(minted);
  const renderButton = () => {
    //@ts-ignore
    const search = minted.find((value) => value.ticket_id === ticketId);

    if (search) {
      return (
        <a
          className='w-40 bg-[#fff] text-gray-800 text-base py-1.5 px-2 rounded-2xl hover:bg-gray-100 hover:border-none shadow-xl font-semibold'
          //@ts-ignore
          href={`https://explorer.celo.org/alfajores/token/${TicketNFTAddress.toLowerCase()}/instance/${search.token_id}`}
          target='_blank'
        >
          Watch Ticket
        </a>
      );
    } else {
      return (
        <button
          className='w-40 bg-[#fff] text-gray-800 text-base   rounded-2xl hover:bg-gray-100 hover:border-none shadow-xl font-semibold'
          onClick={() => {
            mintNFT();
          }}
        >
          Mint Ticket NFT
        </button>
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchMinted();
      await watchQRcode(ticketId);
    };
    fetchMinted();
  }, [connectedAccount]);
  return (
    <div className='bg-[#2db369] shadow-md rounded  text-white'>
      <div className='flex gap-4 h-48'>
        <div className='flex flex-col gap-2 w-5/12  sm:w-2/5  bg-[#000] justify-center items-center'>
          <FaTicketAlt className='text-5xl' />
          <h4 className='text-sm font-semibold'>
            {category && category} Ticket
          </h4>
        </div>
        <div className=' flex flex-col pb-2 gap-0.5 w-7/12 sm:w-3/5 justify-center'>
          <div className='flex justify-between items-center'>
            <h2 className=' font-semibold text-lg py-0'>
              {eventTitle && eventTitle}
            </h2>
            <p className='mr-4 font-bold'># {Number(ticketId)}</p>
          </div>
          <h2 className='text-sm font-medium'>
            {' '}
            Ticket price{' '}
            <span className='font-bold'>{ticketPrice && ticketPrice} CELO</span>
          </h2>
          <h2 className='text-sm font-medium'>
            Event Date{' '}
            <span className='font-semibold bg-[#fff] px-2 py-1 rounded-xl text-gray-800'>
              {displayData(eventDate && eventDate)}
            </span>
          </h2>
          <h2 className='text-sm font-medium flex items-center'>
            Venue: <HiOutlineLocationMarker className='mx-1' />
            <span className='font-bold'> {eventVenue && eventVenue}</span>
          </h2>
          <div className='flex  justify-between'>
            <button
              className='w-40 my-2 bg-[#fff] text-gray-800 text-base rounded-2xl hover:bg-gray-100 hover:border-none shadow-xl font-semibold'
              onClick={() => {
                setGlobalState('modalQr', 'scale-100');
                watchQRcode(Number(ticketId));
              }}
            >
              Watch QR
            </button>
          </div>
          {renderButton()}

          {completed && !sold ? (
            <button
              type='button'
              className='w-40 bg-[#fff] text-gray-800 text-base py-1.5 px-2 rounded-2xl shadow-xl font-semibold'
              disabled
            >
              Not selling
            </button>
          ) : sold && sold ? null : (
            <>
              {checkOwner ? null : (
                <button
                  type='button'
                  className='w-40 bg-[#fff] text-gray-800 text-base py-1.5 px-2 rounded-2xl hover:bg-gray-100 hover:border-none shadow-xl font-semibold'
                  onClick={() => {
                    handlePurchase(),
                    //@ts-ignore
                      setGlobalState('ticket_id', Number(ticketId));
                  }}
                >
                  Book now
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <ShowRQ qr_code={qr_code} />
    </div>
  );
};

export default TicketCard;
