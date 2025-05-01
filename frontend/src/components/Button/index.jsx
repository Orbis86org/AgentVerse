import { Icon } from '@iconify/react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({ btnText, btnUrl, variantColor }) {
  return (
    <Link
      to={btnUrl}
      className={`cs_btn cs_style_1 ${variantColor ? variantColor : ''}`}
    >
      {btnText}
      <span>
        <i>
          <Icon icon="fa6-solid:arrow-right" />
        </i>
        <i>
          <Icon icon="fa6-solid:arrow-right" />
        </i>
      </span>
    </Link>
  );
}
