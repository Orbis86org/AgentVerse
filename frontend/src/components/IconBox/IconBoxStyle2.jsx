import React from 'react';

export default function IconBoxStyle2({ features, iconSrc, title, subTitle }) {
  return (
    <div className="cs_iconbox cs_style_2">
      <div className="cs_iconbox_icon">
        <img src={iconSrc} alt="Icon" />
      </div>
      <h2 className="cs_iconbox_title cs_white_color cs_medium cs_fs_29">
        {title}
      </h2>
      <p className="cs_iconbox_subtitle cs_gray_color_2">{subTitle}</p>
      <ul className="cs_iconbox_features cs_mp0 cs_white_color cs_medium">
        {features?.map((item, index) => (
          <li key={index}>– {item}</li>
        ))}
      </ul>
    </div>
  );
}
