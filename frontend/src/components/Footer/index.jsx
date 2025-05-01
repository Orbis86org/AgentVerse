import { Icon } from '@iconify/react';
import React from 'react';
import { Link } from 'react-router-dom';

const socialBtnList = [
  {
    icon: 'fa6-brands:linkedin-in',
    href: '/',
  },
  {
    icon: 'fa6-brands:twitter',
    href: '/',
  },
  {
    icon: 'fa6-brands:youtube',
    href: '/',
  },
  {
    icon: 'fa6-brands:facebook-f',
    href: '/',
  },
];
export default function Footer() {
  return (
    <footer
      className="cs_fooer cs_bg_filed"
      style={{ backgroundImage: 'url(/images/footer_bg.jpeg)' }}
    >

      <div className="container">
        <div className="cs_bottom_footer">
          <div className="cs_bottom_footer_left">
            <div className="cs_social_btns cs_style_1">
              {socialBtnList.map((item, index) => (
                <Link to={item.href} className="cs_center" key={index}>
                  <Icon icon={item.icon} />
                </Link>
              ))}
            </div>
          </div>
          <div className="cs_copyright">Copyright © 2025 AgentVerse.</div>
          <div className="cs_bottom_footer_right">
            All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
