import React from 'react';
import './spacing.scss';

export default function Spacing({ lg, md }) {
  return <div className={`cs_height_${lg} cs_height_lg_${md}`}></div>;
}
