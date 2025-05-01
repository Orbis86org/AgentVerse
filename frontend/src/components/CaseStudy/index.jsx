import { Icon } from '@iconify/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CaseStudy({ data }) {
  const [activeLink, setActiveLink] = useState(0);
  const handleIconHover = index => {
    setActiveLink(index);
  };
  return (
    <div className="cs_case_study_1_list">
      {data.map((item, index) => (
        <div
          className={`cs_case_study cs_style_1 cs_hover_active ${
            index === activeLink ? 'active' : ''
          }`}
          onMouseEnter={() => handleIconHover(index)}
          key={index}
        >
          <Link
            to="case-study-details"
            className="cs_case_study_thumb cs_bg_filed"
            style={{
              backgroundImage: `url(${item.thumbnailSrc})`,
            }}
          />
          <span className="cs_case_study_number cs_primary_font cs_accent_color cs_fs_38 cs_semibold position-absolute">
            {item.number}
          </span>
          <span className="cs_case_study_icon cs_center rounded-circle position-absolute">
            <Icon icon="fa6-solid:arrow-right" />
          </span>
          <div className="cs_case_study_in">
            <div className="cs_case_study_category cs_white_color cs_fs_18 cs_medium">
              <Link to="/">{item.category}</Link>
            </div>
            <h2 className="cs_case_study_title cs_fs_38 cs_white_color mb-0">
              <Link to="/case-study-details">{item.title}</Link>
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
}
