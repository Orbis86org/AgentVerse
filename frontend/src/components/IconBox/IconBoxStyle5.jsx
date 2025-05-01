import React from 'react';
import { Link } from 'react-router-dom';

export default function IconBoxStyle5({ iconSrc, title, subTitle, href }) {
  return (
    <div className="cs_iconbox cs_style_5 cs_primary_bg text-center cs_radius_15">
      <div className="cs_iconbox_icon cs_center">
        <img src={iconSrc} alt="Icon" />
      </div>
      <h2 className="cs_iconbox_title cs_white_color cs_fs_21">
        <Link to={href}>{title}</Link>
      </h2>
      <p className="cs_iconbox_subtitle cs_gray_color_2">{subTitle}</p>
      <Link to={href} className="cs_iconbox_btn">
        <svg
          width={46}
          height={24}
          viewBox="0 0 46 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M45.0607 13.0616C45.6464 12.4759 45.6464 11.5261 45.0607 10.9403L35.5147 1.39437C34.9289 0.808588 33.9792 0.808588 33.3934 1.39437C32.8076 1.98016 32.8076 2.92991 33.3934 3.5157L41.8787 12.001L33.3934 20.4863C32.8076 21.072 32.8076 22.0218 33.3934 22.6076C33.9792 23.1934 34.9289 23.1934 35.5147 22.6076L45.0607 13.0616ZM0 13.501H44V10.501H0V13.501Z"
            fill="currentColor"
          />
        </svg>
      </Link>
    </div>
  );
}
