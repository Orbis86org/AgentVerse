import React from 'react';
import { Parallax } from 'react-parallax';

export default function HeroStyle2({
  miniTitle,
  title,
  subTitle,
  thumbnailSrc,
  mikeIcon,
}) {
  return (
    <section className="cs_hero cs_style_2 cs_gray_bg position-relative">
      <div className="container">
        <div className="cs_hero_text position-relative">
          <p className="cs_hero_top_title cs_medium cs_fs_18 cs_accent_color">
            <span className="cs_hero_mike">
              <img src={mikeIcon} alt="Mike" />
            </span>
            <span className="cs_hero_arrow cs_accent_color">
              <i className="fa-solid fa-chevron-right" />
            </span>
            <span className>{miniTitle}</span>
          </p>
          <h1 className="cs_hero_title cs_fs_68">{title}</h1>
        </div>
        <div className="row cs_gap_y_40 align-items-center">
          <div className="col-lg-7">
            <div className="cs_hero_img cs_parallax">
              <Parallax
                bgImage={thumbnailSrc}
                bgImageAlt="Thumb"
                strength={-100}
                className="h-100"
              ></Parallax>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="cs_hero_subtitle">
              <p className="mb-0">{subTitle}</p>
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
        </div>
      </div>
    </section>
  );
}
