import React from 'react';
import { Parallax } from 'react-parallax';
import Accordion from '../Accordion';
import Spacing from '../Spacing';

export default function WhyChose({
  sectionTitle,
  sectionSubTitle,
  whyChoseFeatureData,
  thumbnailSrc,
}) {
  return (
    <section>
      <div className="container">
        <div className="row cs_gap_y_40 align-items-center">
          <div className="col-xxl-5 col-lg-6">
            <div className="cs_section_heading cs_style_1">
              <p className="cs_section_subtitle cs_accent_color cs_fs_18 mb-0">
                {sectionSubTitle}
              </p>
              <Spacing lg="10" md="5" />
              <h2 className="cs_section_title cs_fs_50 mb-0">{sectionTitle}</h2>
            </div>
            <Spacing lg="45" md="30" />
            <Accordion data={whyChoseFeatureData} />
          </div>
          <div className="col-lg-6 offset-xxl-1">
            <div className="cs_img_card cs_style_2 cs_bg_filed cs_parallax overflow-hidden">
              <Parallax
                bgImage={thumbnailSrc}
                bgImageAlt="Thumb"
                strength={-200}
              ></Parallax>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
