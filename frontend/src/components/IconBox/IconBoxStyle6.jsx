import React from 'react';

export default function IconBoxStyle6({ bgSrc, iconSrc, title, subTitle }) {
  return (
    <div className="cs_iconbox cs_style_6 text-center cs_center">
      <div
        className="cs_iconbox_bg cs_bg_filed"
        style={{
          backgroundImage: `url(${bgSrc})`,
        }}
      />
      <div className="cs_iconbox_in">
        <div className="cs_iconbox_icon">
          <img src={iconSrc} alt="Icon" />
        </div>
        <h2 className="cs_iconbox_title cs_white_color cs_fs_29">{title}</h2>
        <p className="cs_iconbox_subtitle cs_gray_color_2 mb-0">{subTitle}</p>
      </div>
    </div>
  );
}
