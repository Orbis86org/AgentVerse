import React from 'react';

export default function BrandsStyle2({ data }) {
  return (
    <div className="cs_brands_2_wrap">
      <div className="cs_brands cs_style_2">
        {data?.map((item, index) => (
          <div className="cs_brand" key={index}>
            <div>
              <img src={item.logoSrc} alt={item.logoAlt} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
