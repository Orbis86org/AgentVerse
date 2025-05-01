import React from 'react';
import { Link } from 'react-router-dom';

export default function IconBox({
  iconSrc,
  title,
  subTitle,
  btnText,
  btnUrl,
  shapeClass,
}) {
  return (
    <div className="cs_iconbox cs_style_1 cs_primary_bg cs_radius_15">
      <div className="cs_iconbox_icon position-relative cs_center">
        <img src={iconSrc} alt="Icon" />
        <span
          className={`cs_iconbox_icon_shape ${shapeClass ? shapeClass : ''}`}
        >
          <svg
            width={80}
            height={66}
            viewBox="0 0 80 66"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M52.8669 15.3887C64.6608 21.7434 81.1571 26.2955 79.9359 39.53C78.5761 54.2665 63.0348 62.0797 48.3174 64.6938C32.2972 67.5394 13.9763 66.6458 5.84982 52.6894C-3.43256 36.748 -1.99445 14.7088 12.5113 3.20083C24.6434 -6.42411 39.2106 8.03057 52.8669 15.3887Z"
              fill="#FD6219"
            />
          </svg>
        </span>
      </div>
      <h2 className="cs_iconbox_title cs_fs_29 cs_white_color">{title}</h2>
      <p className="cs_iconbox_subtitle">{subTitle}</p>
      <Link to={btnUrl} className="cs_iconbox_btn cs_white_color">
        {btnText}
        <svg
          width={51}
          height={16}
          viewBox="0 0 51 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50.7071 8.70711C51.0976 8.31658 51.0976 7.68342 50.7071 7.29289L44.3431 0.928932C43.9526 0.538408 43.3195 0.538408 42.9289 0.928932C42.5384 1.31946 42.5384 1.95262 42.9289 2.34315L48.5858 8L42.9289 13.6569C42.5384 14.0474 42.5384 14.6805 42.9289 15.0711C43.3195 15.4616 43.9526 15.4616 44.3431 15.0711L50.7071 8.70711ZM0 9H50V7H0V9Z"
            fill="currentColor"
          />
        </svg>
      </Link>
    </div>
  );
}
