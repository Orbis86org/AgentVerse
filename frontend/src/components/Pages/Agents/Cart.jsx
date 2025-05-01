import React from 'react';
import Spacing from '../../Spacing';
import SectionHeadingStyle3 from '../../SectionHeading/SectionHeadingStyle3';
import CartAmountToggle from '../../AgentComponents/CartAmountToggle';
import { Link } from 'react-router-dom';
import { pageTitle } from '../../../helpers/PageTitle';

export default function Cart() {
  pageTitle('Cart');
  return (
    <>
      <Spacing lg="70" md="70" />
      <Spacing lg="140" md="80" />
      <SectionHeadingStyle3
        title="Shopping cart"
        subTitle="Shop"
        variant="text-center"
        href="/agents"
      />
      <Spacing lg="75" md="60" />
      <div className="container">
        <div className="row">
          <div className="col-xl-8">
            <div className="table-responsive">
              <table className="cs_cart_table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="cs_cart_table_media">
                        <img
                          src="/images/shop/cart-product-1.jpeg"
                          alt="Thumb"
                        />
                        <h3>Awesome men T-shirt</h3>
                      </div>
                    </td>
                    <td>$300.00</td>
                    <td>
                      <CartAmountToggle quantity={2} />
                    </td>
                    <td>$20.00</td>
                    <td className="text-center">
                      <button className="cs_cart-table-close">
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="cs_cart_table_media">
                        <img
                          src="/images/shop/cart-product-2.jpeg"
                          alt="Thumb"
                        />
                        <h3>Fuyure AI robot toy</h3>
                      </div>
                    </td>
                    <td>$300.00</td>
                    <td>
                      <CartAmountToggle quantity={1} />
                    </td>
                    <td>$20.00</td>
                    <td className="text-center">
                      <button className="cs_cart-table-close">
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="cs_cart_table_media">
                        <img
                          src="/images/shop/cart-product-3.jpeg"
                          alt="Thumb"
                        />
                        <h3>Hemp seed shampoo</h3>
                      </div>
                    </td>
                    <td>$300.00</td>
                    <td>
                      <CartAmountToggle quantity={3} />
                    </td>
                    <td>$20.00</td>
                    <td className="text-center">
                      <button className="cs_cart-table-close">
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="cs_height_5 cs_height_lg_5" />
            <div className="cs_cart-offer">
              <div>
                <div className="cs_coupon-doce-form">
                  <input type="text" placeholder="Coupon Code" />
                  <button
                    className="cs_product_btn cs_color1 cs_semi_bold"
                    type="button"
                  >
                    Update Cart
                  </button>
                </div>
              </div>
              <div>
                <button className="cs_product_btn cs_semi_bold" type="button">
                  Update Cart
                </button>
              </div>
            </div>
            <div className="cs_height_30 cs_height_lg_30" />
          </div>
          <div className="col-xl-4">
            <div className="cs_shop-side-spacing">
              <div className="cs_shop-card">
                <h2>Cart Totals</h2>
                <table className="cs_medium">
                  <tbody>
                    <tr>
                      <td className="cs_semi_bold">Subtotal</td>
                      <td className="text-end">$605.00</td>
                    </tr>
                    <tr className="cs_semi_bold">
                      <td>Total</td>
                      <td className="text-end">$605.00</td>
                    </tr>
                  </tbody>
                </table>
                <div className="cs_height_30 cs_height_lg_30" />
                <Link
                  className="cs_product_btn cs_semi_bold w-100"
                  to="/agents/checkout"
                >
                  Procced To Checkout
                </Link>
              </div>
              <div className="cs_height_30 cs_height_lg_30" />
            </div>
          </div>
        </div>
      </div>
      <Spacing lg="120" md="50" />
    </>
  );
}
