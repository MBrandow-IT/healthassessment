import React from 'react';

import background from '@/public/images/mountains-background.jpg';
import Image from 'next/image';

const Loading = () => {

  return (
    <>
      <div className="fullscreen-background">
        <Image src={background} alt="Mountains" layout="fill" objectFit="cover" />
        <div className="gradient-overlay"></div>
      </div>
      <div className="loading-container">
        <div className="load-spinner-container slide-in">
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
          <div className="load-spinner"></div>
        </div>
      </div>
    </>
  )
}

export default Loading;