import React from 'react';

export default function ProgressBar({ title, percentage }) {
  return (
    <>
      <div className="cs_progressbar cs_style_1">
        <div className="cs_progressbar_heading d-flex justify-content-between align-items-center">
          <h3 className="cs_medium m-0 cs_fs_16">{title}</h3>
          <h3 className="cs_medium m-0 cs_fs_16">{percentage}%</h3>
        </div>
        <div className="cs_progress cs_gray_bg_2">
          <div
            className="cs_progress_in cs_accent_bg cs_rounded_8 h-100"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </>
  );
}
