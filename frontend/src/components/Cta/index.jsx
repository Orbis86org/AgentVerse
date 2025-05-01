import React from 'react';
import Button from '../Button';
import parse from 'html-react-parser';

export default function Cta({
  title,
  btnText,
  btnUrl,
  bgUrl,
  variant,
  noShape,
}) {
  return (
    <div
      className={`cs_cta cs_style_1 ${
        variant ? variant : ''
      } cs_bg_filed position-relative cs_radius_15 overflow-hidden text-center`}
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      {noShape ? (
        ''
      ) : (
        <>
          <div className="cs_cta_shape_1">
            <svg
              width={100}
              height={125}
              viewBox="0 0 100 125"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.75901 123.5C0.925677 116 1.25901 100.6 17.259 99C33.259 97.4 41.5924 103 43.759 106C44.759 108.167 44.059 112.2 33.259 111C22.459 109.8 17.759 96.4998 16.759 89.9998C15.4257 83.3332 17.659 66.0998 37.259 50.4998C56.859 34.8998 71.4257 44.9998 76.259 51.9998C78.9257 55.3332 83.659 63.9 81.259 71.5C78.859 79.1 72.259 80 69.259 79.5C64.9257 78.6667 55.159 74.6 50.759 65C46.359 55.4 46.259 48.3333 46.759 46C48.9257 34.8333 62.159 10.4 97.759 2"
                stroke="#4F4747"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="cs_cta_shape_2">
            <svg
              width={125}
              height={100}
              viewBox="0 0 125 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.00002 2.75901C9.50002 0.925677 24.9 1.25901 26.5 17.259C28.1 33.259 22.5 41.5924 19.5 43.759C17.3334 44.759 13.3002 44.059 14.5002 33.259C15.7002 22.459 29.0002 17.759 35.5002 16.759C42.1669 15.4257 59.4002 17.659 75.0002 37.259C90.6002 56.859 80.5002 71.4257 73.5002 76.259C70.1668 78.9257 61.6 83.659 54 81.259C46.4 78.859 45.5 72.259 46 69.259C46.8333 64.9257 50.9 55.159 60.5 50.759C70.1 46.359 77.1667 46.259 79.5 46.759C90.6667 48.9257 115.1 62.159 123.5 97.759"
                stroke="#4F4747"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </>
      )}

      <div className="cs_cta_in position-relative">
        <h2 className="cs_cta_title cs_fs_50 cs_white_color mb-0">
          {parse(title)}
        </h2>
        <div className="cs_height_45 cs_height_lg_30" />
        <Button btnText={btnText} btnUrl={btnUrl} variantColor="cs_btn_white" />
      </div>
    </div>
  );
}
