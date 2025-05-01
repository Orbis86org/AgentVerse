import { Icon } from '@iconify/react';
import React from 'react';

export default function AuthorWidget() {
  return (
    <div className="cs_author_card text-center">
      <img src="/images/others/avatar_1.png" alt="Author" />
      <h3 className="cs_fs_29">Anthony Kuber</h3>
      <p>
        Hi, my name is Anthony kuber. I am digital marketer and <br />
        seo expert. I love to travel and writing blogging.
      </p>
      <div className="cs_social_btns cs_style_1">
        <a href="/" className="cs_center">
          <Icon icon="fa6-brands:linkedin-in" />
        </a>
        <a href="/" className="cs_center">
          <Icon icon="fa6-brands:twitter" />
        </a>
        <a href="/" className="cs_center">
          <Icon icon="fa6-brands:facebook-f" />
        </a>
      </div>
    </div>
  );
}
