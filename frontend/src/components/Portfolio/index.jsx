import React from 'react';
import Masonry from 'react-masonry-css';
import { Link } from 'react-router-dom';

export default function Portfolio({ data }) {
  const breakpoints = {
    default: 2,
    991: 1,
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpoints}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {data.map((item, index) => (
          <div key={index} className="masonry-item">
            <div className="cs_portfolio cs_style_1">
              <Link to={item.href} className="cs_portfolio_thumb cs_radius_15">
                <img src={item.imgUrl} alt="Portfolio" />
              </Link>
              <div className="cs_portfolio_info">
                <h2 className="cs_portfolio_title cs_fs_38">
                  <Link to={item.href}>{item.title}</Link>
                </h2>
                <Link to={item.href} className="cs_portfolio_btn">
                  {item.btnText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Masonry>
    </>
  );
}
