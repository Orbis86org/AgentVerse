import React from 'react';
import Spacing from '../../Spacing';
import SectionHeadingStyle3 from '../../SectionHeading/SectionHeadingStyle3';
import { Link } from 'react-router-dom';
import { pageTitle } from '../../../helpers/PageTitle';

export default function Checkout() {
  pageTitle('Checkout');
  return (
    <>
      <Spacing lg="70" md="70" />
      <Spacing lg="140" md="80" />
      <SectionHeadingStyle3
        title="Checkout page"
        subTitle="Shop"
        variant="text-center"
        href="/agents"
      />
      <Spacing lg="75" md="60" />
      <div className="container">
        <div className="row">
          <div className="col-xl-7">
            <p className="cs_checkout-alert m-0">
              Have a coupon?
              <Link to="/agents/checkout">Click here to enter your code</Link>
            </p>
            <Spacing lg="40" md="40" />
            <h2 className="cs_checkout-title">Billing Details</h2>
            <Spacing lg="40" md="40" />
            <div className="row">
              <div className="col-lg-6">
                <label className="cs_shop-label">First Name *</label>
                <input type="text" className="cs_shop-input" />
              </div>
              <div className="col-lg-6">
                <label className="cs_shop-label">Last Name *</label>
                <input type="text" className="cs_shop-input" />
              </div>
              <div className="col-lg-12">
                <label className="cs_shop-label">Company name (optional)</label>
                <input type="text" className="cs_shop-input" />
              </div>
              <div className="col-lg-12">
                <label className="cs_shop-label">Country / Region *</label>
                <select className="cs_shop-input">
                  <option value="States">United States (US)</option>
                  <option value="Kingdom">United Kingdom</option>
                  <option value="Kanada">Kanada</option>
                </select>
              </div>
              <div className="col-lg-12">
                <label className="cs_shop-label">Street address *</label>
                <input
                  type="text"
                  className="cs_shop-input"
                  placeholder="House number and street name"
                />
                <input
                  type="text"
                  className="cs_shop-input"
                  placeholder="Apartment, suite, unit, etc (optional) "
                />
              </div>
              <div className="col-lg-12">
                <label className="cs_shop-label">Town / City *</label>
                <input type="text" className="cs_shop-input" />
              </div>
              <div className="col-lg-12">
                <label className="cs_shop-label">State *</label>
                <select className="cs_shop-input">
                  <option value="California">California</option>
                  <option value="Gercy">New Gercy</option>
                  <option value="Daiking">Daiking</option>
                </select>
              </div>
              <div className="col-lg-12">
                <label className="cs_shop-label">ZIP Code *</label>
                <input type="text" className="cs_shop-input" />
              </div>
              <div className="col-lg-12">
                <label className="cs_shop-label">Phone *</label>
                <input type="text" className="cs_shop-input" />
              </div>
              <div className="col-lg-12">
                <label className="cs_shop-label">Email address *</label>
                <input type="text" className="cs_shop-input" />
              </div>
            </div>
            <Spacing lg="45" md="45" />
            <h2 className="cs_checkout-title">Additional information</h2>
            <Spacing lg="30" md="30" />
            <label className="cs_shop-label">Order notes (optional)</label>
            <textarea cols={30} rows={6} className="cs_shop-input" />
            <Spacing lg="30" md="30" />
          </div>
          <div className="col-xl-5">
            <div className="cs_shop-side-spacing">
              <div className="cs_shop-card">
                <h2>Your order</h2>
                <table>
                  <tbody>
                    <tr className="cs_semi_bold">
                      <td>Products</td>
                      <td className="text-end">Amount</td>
                    </tr>
                    <tr>
                      <td>Awesome men T-shirt x 1</td>
                      <td className="text-end">$20.00</td>
                    </tr>
                    <tr>
                      <td>Future AI robot toy x 1</td>
                      <td className="text-end">$550.00</td>
                    </tr>
                    <tr>
                      <td>Hemp seed shampoo x 1</td>
                      <td className="text-end">$35.00</td>
                    </tr>
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
                <Spacing lg="30" md="30" />
                <button className="cs_product_btn cs_semi_bold w-100">
                  Confirm order
                </button>
              </div>
              <Spacing lg="50" md="30" />
              <div className="cs_shop-card">
                <h2>Payment</h2>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            defaultValue
                            id="flexCheckDefault"
                            defaultChecked
                          />
                          <label
                            className="form-check-label m-0 cs_semi_bold"
                            htmlFor="flexCheckDefault"
                          >
                            Cash on delivery
                          </label>
                        </div>
                        <p className="m-0 cs_payment_text">
                          Pay with cash upon delivery.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Spacing lg="25" md="25" />
                <p className="m-0 cs_payment_text">
                  Your personal data will be used to process your order, support
                  your experience throughout this website, and for other
                  purposes described in our <a href>privacy policy</a>.
                </p>
                <Spacing lg="20" md="20" />
                <button className="cs_product_btn cs_semi_bold w-100">
                  Payment Method
                </button>
              </div>
              <Spacing lg="30" md="30" />
            </div>
          </div>
        </div>
      </div>
      <Spacing lg="120" md="50" />
    </>
  );
}
