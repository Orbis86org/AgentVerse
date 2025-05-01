import React from 'react';
import parse from 'html-react-parser';
import Spacing from '../Spacing';
import { Link } from 'react-router-dom';

export default function SectionHeadingStyle3({
  title,
  subTitle,
  variant,
  date,
  avatar,
  avatarLink,
  shape,
  category,
  href,
}) {
  return (
    <div
      className={`cs_section_heading cs_style_1 cs_type_3 ${
        variant ? variant : ''
      }`}
    >
      <div className="container">
        {subTitle && (
          <p className="cs_section_subtitle cs_accent_color cs_fs_21 mb-0">
            {href ? <Link to={href}>{subTitle}</Link> : subTitle}
          </p>
        )}
        {category && <span className="cs_category">{category}</span>}
        <Spacing lg="20" md="10" />
        <h2 className="cs_section_title cs_fs_68 mb-0">{parse(title)}</h2>
        {date && (
          <div className="cs-post_meta cs-style1 cs-ternary_color">
            <span className="cs-posted_by">{date}</span>
            <Link to={avatarLink} className="cs-post_avatar">
              {avatar}
            </Link>
          </div>
        )}
      </div>
      {shape === 'shape_1' && <div className="cs_shape_1" />}
      {shape === 'shape_2' && <div className="cs_shape_2" />}
      {shape === 'shape_3' && <div className="cs_shape_3" />}
      {shape === 'shape_4' && (
        <div className="cs_shape_4">
          <img src="/images/icons/team_shape.svg" alt="Shape" />
        </div>
      )}
      {shape === 'shape_5' && (
        <div className="cs_shape_5">
          <img src="/images/icons/blog.svg" alt="Icon" />
        </div>
      )}
      {shape === 'shape_6' && (
        <div className="cs_shape_4">
          <img src="/images/icons/mail.svg" alt="Mail" />
        </div>
      )}
    </div>
  );
}
