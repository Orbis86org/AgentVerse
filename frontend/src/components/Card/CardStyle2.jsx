import React from 'react';

export default function CardStyle2({ miniTitle, title, subTitle, variant }) {
  return (
    <div className={`${variant} cs_radius_15`}>
      <span className="cs_primary_color cs_radius_15">{miniTitle}</span>
      <h2 className="cs_fs_29 cs_semibold">{title}</h2>
      <p className="mb-0">{subTitle}</p>
    </div>
  );
}
