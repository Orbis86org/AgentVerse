import React from 'react';
import { useState } from 'react';
import WaterWave from 'react-water-wave';
import Spacing from '../Spacing';
import parse from 'html-react-parser';

export default function VideoModal({ videoSrc, bgUrl, title, titleVariant }) {
  const [iframeSrc, setIframeSrc] = useState('about:blank');
  const [toggle, setToggle] = useState(false);
  const handelClick = () => {
    setIframeSrc(`${videoSrc}`);
    setToggle(!toggle);
  };
  const handelClose = () => {
    setIframeSrc('about:blank');
    setToggle(!toggle);
  };
  return (
    <>
      {title ? (
        <>
          <h2
            className={`cs_video_block_1_title cs_fs_68 text-center mb-0 ${
              titleVariant ? titleVariant : 'text-uppercase'
            }`}
          >
            {parse(title)}
          </h2>
          <Spacing lg="80" md="45" />
        </>
      ) : (
        ''
      )}
      <WaterWave
        className="cs_video_block cs_style_1 cs_bg_filed cs_radius_15 position-relative d-flex justify-content-center align-items-center cs_ripple_activate overflow-hidden"
        imageUrl={bgUrl}
      >
        {() => (
          <span className="cs_hero_video_icon" onClick={handelClick}>
            <svg
              width={80}
              height={80}
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx={40} cy={40} r={40} fill="#FD6219" />
              <path
                d="M60.079 39.9998L30.148 57.4394L30.0104 22.7986L60.079 39.9998Z"
                fill="white"
              />
            </svg>
          </span>
        )}
      </WaterWave>

      <div className={toggle ? 'cs_video_popup active' : 'cs_video_popup'}>
        <div className="cs_video_popup_overlay" />
        <div className="cs_video_popup_content">
          <div className="cs_video_popup_layer" />
          <div className="cs_video_popup_container">
            <div className="cs_video_popup_align">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe
                  className="embed-responsive-item"
                  src={iframeSrc}
                  title="video modal"
                />
              </div>
            </div>
            <div className="cs_video_popup_close" onClick={handelClose} />
          </div>
        </div>
      </div>
    </>
  );
}
