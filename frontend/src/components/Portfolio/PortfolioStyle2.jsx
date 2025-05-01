import React from 'react';
import parse from 'html-react-parser';
import { Link } from 'react-router-dom';

export default function PortfolioStyle2({
  thumbnailSrc,
  miniTitle,
  title,
  subTitle,
  href,
}) {
  return (
    <div className="cs_portfolio cs_style_2">
      <div
        className="cs_portfolio_thumb cs_bg_filed"
        style={{
          backgroundImage: `url(${thumbnailSrc})`,
        }}
      />
      <div className="cs_portfolio_text">
        <h3 className="cs_portfolio_minititle cs_fs_16 cs_secondary_color cs_medium">
          {miniTitle}
        </h3>
        <h2 className="cs_portfolio_title cs_fs_68">
          <Link to={href}>{parse(title)}</Link>
        </h2>
        <p className="cs_portfolio_subtitle">{parse(subTitle)}</p>
        <Link to={href} className="cs_portfolio_btn cs_primary_color">
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
    </div>
  );
}
