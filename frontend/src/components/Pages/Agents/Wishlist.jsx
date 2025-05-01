import React, { useState } from 'react';
import Spacing from '../../Spacing';
import SectionHeadingStyle3 from '../../SectionHeading/SectionHeadingStyle3';
import { Icon } from '@iconify/react';
import { pageTitle } from '../../../helpers/PageTitle';
const wishlistProduct = [
  {
    id: 1,
    title: 'Awesome men T-shirt',
    thumbUrl: '/images/shop/cart-product-1.jpeg',
    price: 300,
    stock: 4,
  },
  {
    id: 2,
    title: 'Fuyure AI robot toy',
    thumbUrl: '/images/shop/cart-product-2.jpeg',
    price: 200,
    stock: 10,
  },
  {
    id: 3,
    title: 'Hemp seed shampoo',
    thumbUrl: '/images/shop/cart-product-3.jpeg',
    price: 50,
    stock: 0,
  },
];

export default function Wishlist() {
  const [data, setData] = useState(wishlistProduct);
  const [selectAll, setSelectAll] = useState(false);

  const handleCheckboxChange = id => {
    setData(prevData =>
      prevData.map(row =>
        row.id === id ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const handleSelectAll = () => {
    const newData = data.map(row => ({
      ...row,
      checked: !selectAll,
    }));
    setData(newData);
    setSelectAll(!selectAll);
  };

  pageTitle('Wishlist');

  return (
    <>
      <Spacing lg="70" md="70" />
      <Spacing lg="140" md="80" />
      <SectionHeadingStyle3
        title="Your Wishlist"
        subTitle="Shop"
        variant="text-center"
        href="/agents"
      />
      <Spacing lg="75" md="60" />
      <div className="container">
        <div className="table-responsive">
          <table className="cs_cart_table cs_size1">
            <thead>
              <tr>
                <th>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkAll"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Remove</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={item.checked || false}
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="cs_cart_table_media">
                      <img src="/images/shop/cart-product-1.jpeg" alt="Thumb" />
                      <h3>Awesome men T-shirt</h3>
                    </div>
                  </td>
                  <td>$300.00</td>
                  <td>In stock</td>
                  <td className="text-center">
                    <button type="button" className="cs_cart-table-close">
                      <Icon icon="ci:close-md" />
                    </button>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="cs_product_btn cs_semi_bold"
                    >
                      Add to Cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cs_height_5 cs_height_lg_5" />
        <div className="cs_cart-offer">
          <div className="cs_cart-offer-col">
            <form action="#" className="cs_coupon-doce-form">
              <select className="cs_shop-input m-0">
                <option value="States">Actions</option>
                <option value="Kingdom">Add to Cart</option>
                <option value="Kanada">Remove</option>
              </select>
              <button className="cs_product_btn cs_color1 cs_semi_bold">
                Apply Action
              </button>
            </form>
          </div>
          <div className="cs_cart-offer-col">
            <button className="cs_product_btn cs_semi_bold">
              Add Selected to Cart
            </button>
            <button className="cs_product_btn cs_semi_bold">
              Add All to Cart
            </button>
          </div>
        </div>
      </div>
      <Spacing lg="150" md="80" />
    </>
  );
}
