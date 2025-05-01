import React, { useEffect, useState } from 'react';
import VideoModal from '../VideoModal';
import TextTransition, { presets } from 'react-text-transition';

export default function Hero({ title, subtitle, videoSrc, bgUrl, hint }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(
      () => setIndex(prevIndex => prevIndex + 1),
      3000, // every 3 seconds
    );

    return () => clearInterval(intervalId); // Use clearInterval here
  }, []);
  return (
      <section className="cs_hero cs_style_1 cs_primary_bg position-relative">
        <div className="container">
          <div className="cs_hero_text text-center position-relative">
            <p className="cs_hero_subtitle cs_accent_color cs_medium cs_fs_18 cs_dancing_animation">
              <TextTransition springConfig={presets.wobbly}>
                {title[index % title.length]}
              </TextTransition>
            </p>
            <h1 className="cs_hero_title cs_white_color cs_fs_68 cs_dancing_animation">
              {subtitle}
            </h1>
          </div>
          <div className="cs_hero_shape position-absolute">
            <svg
                width={220}
                height={220}
                viewBox="0 0 220 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  opacity="0.25"
                  d="M0 98.765C0.630373 98.8223 1.26075 98.8796 1.89112 98.8796C28.3095 98.8796 54.7278 98.8796 81.2034 98.8796C81.7765 98.8796 82.3496 98.8796 82.808 98.8796C63.2092 79.2757 43.6103 59.6717 24.0688 40.1251C29.6275 34.6222 34.7278 29.6352 39.9427 24.4763C59.255 43.7936 78.8539 63.3976 98.9685 83.5175C98.9685 55.2579 98.9685 27.629 98.9685 0C106.418 0 113.639 0 121.032 0C121.032 27.6863 121.032 55.2006 121.032 82.6576C140.63 63.0537 160.229 43.4497 179.656 24.0177C185.215 29.5779 190.258 34.6222 195.415 39.7811C176.103 59.0985 156.504 78.7025 136.905 98.3064C136.963 98.4784 137.077 98.6504 137.135 98.8223C164.699 98.8223 192.321 98.8223 220 98.8223C220 106.274 220 113.497 220 120.948C192.321 120.948 164.756 120.948 136.963 120.948C156.791 140.782 176.332 160.328 195.874 179.875C190.487 185.149 185.444 190.135 180.287 195.237C160.974 175.92 141.375 156.316 121.433 136.311C121.318 137.4 121.203 137.858 121.203 138.317C121.203 165.029 121.203 191.741 121.203 218.51C121.203 219.026 121.318 219.484 121.318 220C113.868 220 106.418 220 98.9685 220C99.0258 219.369 99.0831 218.739 99.0831 218.108C99.0831 191.683 99.0831 165.258 99.0831 138.833C99.0831 138.26 98.9685 137.629 98.9112 136.368C78.7966 156.373 59.1977 175.977 39.8854 195.294C34.7278 190.193 29.6275 185.206 24.0115 179.703C43.553 160.156 63.0946 140.61 82.6934 121.006C82.2923 121.006 81.7192 121.006 81.1461 121.006C54.7278 121.006 28.3095 121.006 1.89112 121.006C1.26075 121.006 0.630373 121.12 0 121.12C0 113.669 0 106.217 0 98.765Z"
                  fill="#4F4747"
              />
            </svg>
          </div>
        </div>

        { hint && (
            <h6 className="cs_accent_color text-center">{hint}</h6>
        )}

        <div className="cs_video_block_wrap position-relative">
          <div className="container">
            <VideoModal videoSrc={videoSrc} bgUrl={bgUrl}/>
          </div>
        </div>

      </section>
  );
}
