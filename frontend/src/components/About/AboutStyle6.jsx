import { Icon } from '@iconify/react';
import React from 'react';
import Button from '../Button';
import Spacing from '../Spacing';

export default function AboutStyle6({
  thumbnailSrc,
  title,
  subTitle,
  featureList,
  btnText,
  btnUrl,
}) {
  return (
    <div className="cs_about cs_style_2 cs_type_2">
      <div className="container">
        <div className="row align-items-center cs_gap_y_40">
          <div className="col-lg-6">
            <div className="cs_section_heading cs_style_1">
              <h2 className="cs_section_title cs_fs_50 mb-0">{title}</h2>
              <div className="cs_height_30 cs_height_lg_30" />
              <p className="m-0">{subTitle}</p>
            </div>
            <div className="cs_height_40 cs_height_lg_30" />
            <ul className="cs_list cs_style_1 cs_primary_font cs_primary_color cs_semibold cs_mp0 cs_fs_21">
              {featureList?.map((item, index) => (
                <li key={index}>
                  <i className="d-flex">
                    <Icon icon="fa6-regular:circle-check" />
                  </i>
                  {item}
                </li>
              ))}
            </ul>
            <Spacing lg="40" md="30" />
            <Button btnText={btnText} btnUrl={btnUrl} />
          </div>
          <div className="col-lg-6">
            <div className="cs_about_thumb">
              <div
                className="cs_about_thumb_in cs_bg_filed"
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
