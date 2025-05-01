import React from 'react';

export default function Marquee({ text }) {
  return (
    <div className="cs_moving_text_wrap cs_style_1 cs_fs_68 text-uppercase cs_bold cs_primary_font">
      <div className="cs_moving_text_in">
        <div className="cs_moving_text">{text}</div>
        <div className="cs_moving_text">{text}</div>
      </div>
    </div>
  );
}
