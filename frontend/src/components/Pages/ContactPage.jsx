import React from 'react';
import Spacing from '../Spacing';
import SectionHeadingStyle3 from '../SectionHeading/SectionHeadingStyle3';
import { pageTitle } from '../../helpers/PageTitle';
import { Icon } from '@iconify/react';

export default function ContactPage() {
  pageTitle('Contact');
  return (
    <>
      <Spacing lg="70" md="70" />
      <Spacing lg="140" md="80" />
      <SectionHeadingStyle3
        title="Get in touch for more <br/>information and support"
        subTitle="Contact"
        shape="shape_6"
      />
      <Spacing lg="75" md="60" />
      <section>
        <div className="container">
          <div className="row align-items-center cs_gap_y_45">
            <div className="col-lg-6">
              <h2 className="cs_fs_50">
                Come & visit <br />
                our place!
              </h2>
              <div className="cs_height_55 cs_height_lg_30" />
              <ul className="cs_mp0 cs_contact_info">
                <li>
                  <h3 className="cs_fs_29 cs_semibold">Email:</h3>
                  <p className="mb-0">info@example.com</p>
                </li>
                <li>
                  <h3 className="cs_fs_29 cs_semibold">Phone:</h3>
                  <p className="mb-0">+54 45 454 78 23</p>
                </li>
                <li>
                  <h3 className="cs_fs_29 cs_semibold">Address:</h3>
                  <p className="mb-0">New York, USA</p>
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="cs_contact_form_wrap">
                <div className="cs_gray_bg_3 cs_contact_form_bg" />
                <form className="cs_contact_form">
                  <label className="cs_fs_21 cs_semibold cs_primary_color">
                    Name
                  </label>
                  <input
                    placeholder="Type your name"
                    type="text"
                    className="cs_form_field"
                  />
                  <div className="cs_height_38 cs_height_lg_25" />
                  <label className="cs_fs_21 cs_semibold cs_primary_color">
                    Email Address
                  </label>
                  <input
                    placeholder="Type your email address"
                    type="text"
                    className="cs_form_field"
                  />
                  <div className="cs_height_38 cs_height_lg_25" />
                  <label className="cs_fs_21 cs_semibold cs_primary_color">
                    Phone Number
                  </label>
                  <input
                    placeholder="Type your phone number"
                    type="text"
                    className="cs_form_field"
                  />
                  <div className="cs_height_38 cs_height_lg_25" />
                  <label className="cs_fs_21 cs_semibold cs_primary_color">
                    Message
                  </label>
                  <textarea cols={30} rows={5} className="cs_form_field" />
                  <div className="cs_height_38 cs_height_lg_25" />
                  <button className="cs_btn cs_style_1">
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="cs_height_0 cs_height_lg_80" />
      </section>
    </>
  );
}
