import React from 'react';

export default function Testimonial({
  text,
  avatarName,
  avatarDesignation,
  style2,
}) {
  return (
    <div className={`cs_testimonial cs_style_1 ${style2 ? '' : 'text-center'}`}>
      <div className="cs_testimonial_icon">
        <svg
          width={56}
          height={40}
          viewBox="0 0 56 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 40H16L24 24V0H0V24H12L4 40ZM36 40H48L56 24V0H32V24H44L36 40Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <blockquote
        className={`cs_testimonial_text ${
          style2 ? 'cs_white_color cs_fs_21' : 'cs_primary_color cs_fs_29'
        } cs_medium`}
      >
        {text}
      </blockquote>
      <div className="cs_testimonial_info">
        <h3
          className={`cs_semibold ${
            style2 ? 'cs_white_color cs_fs_21' : 'cs_fs_29'
          }`}
        >
          {avatarName}
        </h3>
        <p className={style2 ? 'cs_gray_color_2' : ''}>{avatarDesignation}</p>
      </div>
    </div>
  );
}
