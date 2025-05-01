import React from 'react';
import Button from '../Button';
import Spacing from '../Spacing';

export default function AboutStyle4({
  thumbnailSrc,
  miniTitle,
  title,
  subTitle,
  btnText,
  btnUrl,
}) {
  return (
    <div className="cs_about cs_style_1">
      <div className="container">
        <div className="row align-items-center cs_gap_y_40">
          <div className="col-lg-6">
            <div
              className="cs_about_thumb cs_bg_filed"
              style={{
                backgroundImage: `url(${thumbnailSrc})`,
              }}
            />
          </div>
          <div className="col-lg-5 offset-lg-1">
            <div className="cs_section_heading cs_style_1">
              <p className="cs_section_subtitle cs_accent_color cs_fs_18 mb-0">
                {miniTitle}
              </p>
              <Spacing lg="10" md="5" />
              <h2 className="cs_section_title cs_fs_50 mb-0">{title}</h2>
              <Spacing lg="24" md="24" />
              <p>{subTitle}</p>
              <Spacing lg="20" md="20" />
              <Button btnText={btnText} btnUrl={btnUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
