import React from 'react';
import parse from 'html-react-parser';

export default function SectionHeading({
  title,
  subTitle,
  variantColor,
  variant,
}) {
  return (
    <div
      className={`cs_section_heading cs_style_1 ${
        variant ? variant : ''
      } text-center`}
    >
      <p className="cs_section_subtitle cs_accent_color cs_fs_18 mb-0">
        {parse(subTitle)}
      </p>
      <div className="cs_height_10 cs_height_lg_5" />
      <h2
        className={`cs_section_title cs_fs_50 mb-0 ${
          variantColor ? variantColor : ''
        }`}
      >
        {parse(title)}
      </h2>
    </div>
  );
}
