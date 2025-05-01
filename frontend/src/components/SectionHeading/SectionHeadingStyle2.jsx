import React from 'react';
import parse from 'html-react-parser';
import Button from '../Button';

export default function SectionHeadingStyle2({
  title,
  subTitle,
  btnText,
  btnUrl,
}) {
  return (
    <>
      <div className="cs_section_heading cs_style_1 cs_type_2">
        <div className="cs_section_heading_left">
          <p className="cs_section_subtitle cs_accent_color cs_fs_18 mb-0">
            {subTitle}
          </p>
          <div className="cs_height_10 cs_height_lg_5" />
          <h2 className="cs_section_title cs_fs_50 mb-0 cs_white_color">
            {parse(title)}
          </h2>
        </div>
        <div className="cs_section_heading_right">
          <Button
            btnText={btnText}
            btnUrl={btnText}
            variantColor="cs_btn_white"
          />
        </div>
      </div>
    </>
  );
}
