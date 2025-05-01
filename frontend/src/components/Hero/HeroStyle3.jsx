import React from 'react';
import parse from 'html-react-parser';

export default function HeroStyle3({ title, scrollingText, thumbnailSrc }) {
  return (
    <section
      className="cs_hero cs_style_3 cs_bg_filed cs_center"
      style={{ backgroundImage: `url(${thumbnailSrc})` }}
    >
      <div className="container">
        <div className="cs_hero_text position-relative">
          <h1 className="cs_hero_title cs_fs_68 text-uppercase">
            {parse(title)}
          </h1>
          <div className="cs_moving_text_wrap">
            <div className="cs_moving_text_in">
              <div className="cs_moving_text">{scrollingText}</div>
              <div className="cs_moving_text">{scrollingText}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
