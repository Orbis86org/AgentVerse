import React from 'react';
import Spacing from '../Spacing';

export default function AboutStyle7({
  title,
  subTitle,
  featureList,
  thumbnailSrc,
}) {
  return (
    <div className="cs_about cs_style_2 cs_type_3">
      <div className="container">
        <div className="row align-items-center cs_gap_y_35">
          <div className="col-lg-6">
            <div className="cs_section_heading cs_style_1">
              <h2 className="cs_section_title cs_fs_50 mb-0">{title}</h2>
              <Spacing lg="24" md="24" />
              <p>{subTitle}</p>
              <Spacing lg="30" md="30" />
              <ul className="cs_list cs_style_2 cs_fs_21 cs_semibold cs_primary_color cs_mp0">
                {featureList?.map((item, index) => (
                  <li>
                    <span className="cs_list_number cs_accent_bg cs_center">
                      {item.number}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="cs_about_thumb">
              <div
                className="cs_about_thumb_in cs_bg_filed w-100"
                style={{
                  backgroundImage: `url(${thumbnailSrc})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
