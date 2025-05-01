import React from 'react';

export default function AboutStyle8({
  thumbnailSrc,
  title,
  subTitle,
  grothData,
}) {
  return (
    <div className="cs_about cs_style_1 cs_type_1">
      <div className="container">
        <div className="row align-items-center cs_gap_y_35">
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
          <div className="col-lg-6">
            <div className="cs_section_heading cs_style_1">
              <h2 className="cs_section_title cs_fs_50 mb-0">{title}</h2>
              <div className="cs_height_24 cs_height_lg_24" />
              <p>{subTitle}</p>
              <div className="cs_height_50 cs_height_lg_25" />
              <ul className="cs_round_progress_list text-center cs_mp0">
                {grothData?.map((item, index) => (
                  <li key={index}>
                    <div className="cs_round_progress_wrap cs_accent_color">
                      <div className="cs_round_progress_in">
                        <div className="cs_round_progress_number mb-0 cs_semibold cs_fs_21 cs_primary_color">
                          {item.percentage}%
                        </div>
                      </div>
                    </div>
                    <h2 className="cs_round_progress_title cs_fs_16 cs_semibold mb-0">
                      {item.title}
                    </h2>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
