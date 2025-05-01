import React from 'react';
import Spacing from '../Spacing';

export default function Pagination() {
  return (
    <>
      <Spacing lg="45" md="45" />
      <ul className="cs_pagination_box cs_white_color cs_mp0 cs_semi_bold">
        <li>
          <button type="button" className="cs_pagination_item cs_center active">
            1
          </button>
        </li>
        <li>
          <button type="button" className="cs_pagination_item cs_center">
            2
          </button>
        </li>
        <li>
          <button type="button" className="cs_pagination_item cs_center">
            3
          </button>
        </li>
        <li>
          <button type="button" className="cs_pagination_item cs_center">
            <svg
              width={7}
              height={12}
              viewBox="0 0 7 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 1.272L4.55116 6L0 10.728L1.22442 12L7 6L1.22442 0L0 1.272Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </li>
      </ul>
    </>
  );
}
