import React from 'react';

export default function Award({ data }) {
  return (
    <div className="cs_awaard_1_list">
      {data?.map((item, index) => (
        <div className="cs_awaard cs_style_1" key={index}>
          <h3 className="cs_awaard_brand mb-0 cs_fs_29 cs_semibold cs_accent_color">
            {item.brand}
          </h3>
          <div className="cs_awaard_info">
            <h2 className="cs_awaard_title cs_fs_29 cs_white_color cs_semibold">
              {item.title}
            </h2>
            <p className="cs_awaard_subtitle mb-0">{item.subTitle}</p>
          </div>
          <h3 className="cs_awaard_time cs_white_color cs_semibold mb-0 cs_fs_29">
            {item.date}
          </h3>
          <div className="cs_award_img">
            <img src={item.awardImgUrl} alt="Award" />
          </div>
        </div>
      ))}
    </div>
  );
}
