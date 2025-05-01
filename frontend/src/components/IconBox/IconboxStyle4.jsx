import React from 'react';
import Button from '../Button';

export default function IconboxStyle4({
  iconSrc,
  title,
  subTitle,
  btnText,
  btnUrl,
}) {
  return (
    <div className="cs_iconbox cs_style_4 cs_radius_15">
      <div className="cs_iconbox_icon">
        <img src={iconSrc} alt="Icon" />
      </div>
      <div className="cs_iconbox_right">
        <h2 className="cs_iconbox_title cs_fs_29">{title}</h2>
        <p className="cs_iconbox_subtitle">{subTitle}</p>
        <Button btnUrl={btnUrl} btnText={btnText} />
      </div>
    </div>
  );
}
