import React from 'react';
import VideoModal from '../VideoModal';

export default function HeroStyle4({ videoSrc, bgUrl, thumbnailSrc }) {
  return (
    <section
      className="cs_hero cs_style_4 position-relative"
      style={{
        backgroundImage: `url(${thumbnailSrc})`,
      }}
    >
      <div className="container">
        <div className="cs_hero_text position-relative">
          <h1 className="cs_hero_title cs_fs_68">
            Mastering Digital Realm, Exploring the Dynamic World of Our Digital
            Studio
          </h1>
        </div>
        <div className="row align-items-center">
          <div className="col-lg-5">
            <div className="cs_hero_subtitle">
              <p className="mb-0">
                Our agency offers a comprehensive suite of lots services,
                including Branding, Advertising, Social marketing, Video making,
                and Marketing analysis.
              </p>
              <a
                href="#service"
                className="cs_down_btn cs_center cs_primary_color"
              >
                <svg
                  width={8}
                  height={33}
                  viewBox="0 0 8 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.64645 32.3536C3.84171 32.5488 4.15829 32.5488 4.35355 32.3536L7.53554 29.1716C7.7308 28.9763 7.7308 28.6597 7.53554 28.4645C7.34027 28.2692 7.02369 28.2692 6.82843 28.4645L4 31.2929L1.17157 28.4645C0.976312 28.2692 0.65973 28.2692 0.464467 28.4645C0.269205 28.6597 0.269205 28.9763 0.464467 29.1716L3.64645 32.3536ZM3.5 2.18557e-08L3.5 32L4.5 32L4.5 -2.18557e-08L3.5 2.18557e-08Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="col-lg-7">
            <VideoModal videoSrc={videoSrc} bgUrl={bgUrl} />
          </div>
        </div>
      </div>
      <div className="cs_hero_shape">
        <svg
          width={458}
          height={475}
          viewBox="0 0 458 475"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.3"
            d="M2.35848 153.351L456.103 1.77286L370.156 472.382L2.35848 153.351Z"
            stroke="#A3A3A3"
            strokeWidth={2}
          />
        </svg>
      </div>
    </section>
  );
}
