import React from 'react';

export default function Brands({ data }) {
  return (
    <div className="cs_brands cs_style_1">
      {data.map((item, index) => (
        <div className="cs_brand" key={index}>
          <img src={item.logoSrc} alt={item.logoAlt} />
        </div>
      ))}
    </div>
  );
}
