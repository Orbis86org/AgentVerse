import React from 'react';
import Spacing from '../../Spacing';
import SectionHeadingStyle3 from '../../SectionHeading/SectionHeadingStyle3';
import { pageTitle } from '../../../helpers/PageTitle';
export default function Success() {
  pageTitle('Success');
  return (
    <>
      <Spacing lg="70" md="70" />
      <Spacing lg="140" md="80" />
      <SectionHeadingStyle3
        title="Order Success"
        subTitle="Continue shopping"
        variant="text-center"
        href="/agents"
      />
      <Spacing lg="125" md="60" />
      <div className="container">
        <p className="m-0 text-center">
          Thank you! Your order has been received.
        </p>
        <div className="cs_height_95 cs_height_lg_50" />
        <ul className="cs_order-summery">
          <li>
            <p>Order Number:</p>
            <h3>251501</h3>
          </li>
          <li>
            <p>Date:</p>
            <h3>September 11, 2023</h3>
          </li>
          <li>
            <p>Total:</p>
            <h3>$605.00</h3>
          </li>
          <li>
            <p>Payment method:</p>
            <h3>COD</h3>
          </li>
        </ul>
        <div className="cs_height_50 cs_height_lg_30" />
        <div className="cs_shop-card">
          <h2>Order details</h2>
          <table className="border-bottom-0">
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
              <tr>
                <td className="cs_semi_bold">Payment method</td>
                <td className="text-end">Cash on delivery</td>
              </tr>
              <tr className="cs_semi_bold">
                <td className="pb-0">Total</td>
                <td className="text-end pb-0">$605.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Spacing lg="150" md="80" />
    </>
  );
}
