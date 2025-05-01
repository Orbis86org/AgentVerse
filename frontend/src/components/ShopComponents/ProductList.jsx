import React from 'react';
import Product from './Product';

export default function ProductList({ data }) {
  return (
    <div className="row cs_gap_y_45">
      {data.map((item, index) => (
        <div className="col-lg-4 col-sm-6" key={index}>
          <Product
            title={item.title}
            productThumb={item.productThumb}
            price={item.price}
            id={item.id}
            key={index}
          />
        </div>
      ))}
    </div>
  );
}
