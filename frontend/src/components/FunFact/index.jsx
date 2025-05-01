import React from 'react';

export default function FunFact({ data, colorVariant }) {
  return (
    <div className="cs_counter_1_wrap">
      {data.map((item, index) => (
        <div
          className={`cs_counter cs_style_1 position-relative d-flex align-items-center ${
            colorVariant ? colorVariant : ''
          }`}
          key={index}
        >
          <div
            className={`cs_counter_nmber mb-0 cs_fs_68 d-flex align-items-center cs_bold cs_primary_color`}
          >
            {item.number}
          </div>
          <p className="cs_counter_title mb-0">{item.title}</p>
        </div>
      ))}
    </div>
  );
}
