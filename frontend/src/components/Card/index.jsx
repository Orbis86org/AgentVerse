import React from 'react';

export default function Card({ thumbnailSrc, title, miniTitle }) {
  return (
    <div
      className="cs_goal cs_radius_15 cs_bg_filed"
      style={{
        backgroundImage: `url(${thumbnailSrc})`,
      }}
    >
      <div className="cs_goal_text">
        <p className="cs_goal_subtitle cs_white_color">{miniTitle}</p>
        <h2 className="cs_goal_title mb-0 cs_fs_29 cs_semibold cs_white_color">
          {title}
        </h2>
      </div>
    </div>
  );
}
