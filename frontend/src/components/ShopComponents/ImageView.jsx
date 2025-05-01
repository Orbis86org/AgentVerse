import React, { useState } from 'react';
const images = [
  '/images/shop/product_thumb_lg_1.jpeg',
  '/images/shop/product_thumb_lg_2.jpeg',
  '/images/shop/product_thumb_lg_3.jpeg',
  '/images/shop/product_thumb_lg_4.jpeg',
];

export default function ImageView() {
  const [largeThumb, setLargeThumb] = useState(0);
  return (
    <>
      <div className="cs_single_product_thumb_item">
        <img src={images[largeThumb]} alt="Thumb" />
      </div>
      <div className="cs_single_thumb_grid">
        {images?.map((item, index) => (
          <div
            className={`cs_single_product_thumb_item ${
              index === largeThumb ? 'active' : ''
            }`}
            key={index}
            onClick={() => setLargeThumb(index)}
          >
            <img src={item} alt="Thumb" />
          </div>
        ))}
      </div>
    </>
  );
}
