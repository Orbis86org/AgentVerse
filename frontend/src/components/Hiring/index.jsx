import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';

export default function Hiring({ thumbnailSrc, data }) {
  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-4">
          <div className="cs_hiring_img position-relative">
            <svg
              width={84}
              height={77}
              viewBox="0 0 84 77"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.5">
                <path
                  d="M18.6372 15.0077C22.4937 17.106 25.7722 20.1709 29.4926 22.4975C33.1402 24.7755 36.5401 27.5247 39.8478 30.235C46.5553 35.7188 52.6799 42.1595 56.8132 49.8047C57.3621 50.8199 56.0216 51.9225 55.1861 51.0579C49.28 44.9038 43.2137 38.9149 37.0453 33.0377C34.0436 30.1687 30.9999 27.3369 27.9141 24.5424C24.6502 21.5941 20.9055 19.1995 17.6853 16.2414C17.015 15.6197 17.8747 14.59 18.6372 15.0077Z"
                  fill="#4F4747"
                />
                <path
                  d="M1.09257 43.7793C5.48281 43.7567 9.83308 44.8596 14.2143 45.1026C18.5083 45.3382 22.8127 46.106 27.0174 46.8843C35.5382 48.4516 44.01 51.1383 51.3187 55.8409C52.2892 56.4653 51.6469 58.0779 50.498 57.7236C42.3559 55.1825 34.153 52.8633 25.9146 50.6913C21.9014 49.6264 17.8692 48.6144 13.8181 47.6554C9.53687 46.6475 5.10154 46.3567 0.853874 45.3192C-0.0331613 45.098 0.223112 43.7813 1.09257 43.7793Z"
                  fill="#4F4747"
                />
                <path
                  d="M51.1755 0.725762C53.289 4.57405 54.3942 8.92393 56.2699 12.891C58.1106 16.7778 59.4884 20.9274 60.8094 24.9946C63.4952 33.2318 65.1738 41.9599 64.5259 50.6268C64.4399 51.7776 62.7163 51.982 62.4798 50.8032C60.8305 42.4344 58.9571 34.1181 56.9375 25.8407C55.9596 21.8052 54.9262 17.7783 53.8373 13.76C52.6815 9.51616 50.822 5.47878 49.7082 1.25032C49.4796 0.365115 50.7591 -0.0375394 51.1755 0.725762Z"
                  fill="#4F4747"
                />
              </g>
            </svg>
            <img src={thumbnailSrc} alt="Thumb" className="w-100" />
          </div>
        </div>
        <div className="col-lg-7 offset-lg-1">
          <div className="cs_height_40 cs_height_lg_40" />
          <ul className="cs_hiring_list cs_mp0">
            {data.map((item, index) => (
              <li className="cs_primary_bg" key={index}>
                <h2 className="mb-0 cs_fs_29 cs_semibold cs_white_color">
                  <span>{item.number}</span>
                  <Link to={item.href}>{item.title}</Link>
                </h2>
                <Button
                  btnText="Apply"
                  btnUrl={item.href}
                  variantColor="cs_btn_white cs_fs_29 cs_semibold"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
