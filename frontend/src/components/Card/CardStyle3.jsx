import React from 'react';

export default function CardStyle3({ number, title, subTitle }) {
  return (
    <div className="cs_number_box cs_style_1">
      <h3 className="cs_number_box_number cs_semibold cs_accent_bg cs_fs_29 cs_center">
        {number}
      </h3>
      <h2 className="cs_number_box_title cs_fs_29 cs_semibold">{title}</h2>
      <p className="mb-0">{subTitle}</p>
    </div>
  );
}
