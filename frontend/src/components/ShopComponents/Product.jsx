import React from 'react';
import { NavLink } from 'react-router-dom';
import FormateNumber from '../../helpers/FormateNumber';
import { Icon } from '@iconify/react';

export default function Product({ title, productThumb, price, id }) {
  return (
    <div className="cs_product_card cs_style_1">
      <div className="cs_product_thumb">
        <img src={productThumb} alt="Product" />
        <div className="cs_product_overlay" />
        <div className="cs_card_btns">
          <button type="button">
            <Icon icon="fa6-solid:cart-shopping" />
          </button>
          <button type="button">
            <Icon icon="fa6-solid:heart" />
          </button>
          <NavLink to={`/shop/${id}`}>
            <Icon icon="fa6-solid:eye" />
          </NavLink>
        </div>
      </div>
      <div className="cs_product_info">
        <h2 className="cs_product_title">
          <NavLink to={`/shop/${id}`}>{title}</NavLink>
        </h2>
        <p className="cs_product_price">
          Price: <FormateNumber number={price} />
        </p>
      </div>
    </div>
  );
}
