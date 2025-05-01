import React from 'react';
import ProgressBar from '../ProgressBar';
import Spacing from '../Spacing';

export default function AboutStyle5({
  variant,
  videoSrc,
  thumbnailSrc,
  miniTitle,
  title,
  subTitle,
  progressBarList,
  salesTitle,
  groth,
}) {
  return (
    <div className={`cs_about cs_style_2 ${variant ? variant : ''}`}>
      <div className="container">
        <div className="row align-items-center cs_gap_y_40">
          <div className="col-lg-5">
            <div className="cs_section_heading cs_style_1">
              <svg
                width={84}
                height={77}
                viewBox="0 0 84 77"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.5">
                  <path
                    d="M18.6368 15.0076C22.4932 17.1059 25.7717 20.1708 29.4921 22.4974C33.1398 24.7754 36.5397 27.5246 39.8473 30.2349C46.5548 35.7187 52.6795 42.1594 56.8128 49.8046C57.3616 50.8198 56.0211 51.9223 55.1857 51.0578C49.2796 44.9037 43.2132 38.9147 37.0448 33.0375C34.0432 30.1685 30.9994 27.3368 27.9136 24.5423C24.6497 21.594 20.905 19.1994 17.6848 16.2413C17.0145 15.6196 17.8742 14.5899 18.6368 15.0076Z"
                    fill="#4F4747"
                  />
                  <path
                    d="M1.09208 43.7783C5.48233 43.7557 9.8326 44.8586 14.2139 45.1016C18.5079 45.3372 22.8122 46.105 27.0169 46.8833C35.5377 48.4507 44.0096 51.1374 51.3182 55.84C52.2887 56.4644 51.6464 58.0769 50.4975 57.7226C42.3554 55.1815 34.1525 52.8624 25.9141 50.6903C21.9009 49.6254 17.8687 48.6134 13.8176 47.6544C9.53638 46.6465 5.10105 46.3557 0.853385 45.3183C-0.0336496 45.097 0.222624 43.7803 1.09208 43.7783Z"
                    fill="#4F4747"
                  />
                  <path
                    d="M51.175 0.725762C53.2885 4.57405 54.3937 8.92393 56.2694 12.891C58.1101 16.7778 59.4879 20.9274 60.809 24.9946C63.4947 33.2318 65.1734 41.9599 64.5255 50.6268C64.4394 51.7776 62.7158 51.982 62.4793 50.8032C60.83 42.4344 58.9566 34.1181 56.937 25.8407C55.9591 21.8052 54.9257 17.7783 53.8368 13.76C52.681 9.51616 50.8215 5.47878 49.7077 1.25032C49.4791 0.365115 50.7587 -0.0375394 51.175 0.725762Z"
                    fill="#4F4747"
                  />
                </g>
              </svg>
              <p className="cs_section_subtitle cs_accent_color cs_fs_18 mb-0">
                {miniTitle}
              </p>
              <Spacing lg="10" md="5" />
              <h2 className="cs_section_title cs_fs_50 mb-0">{title}</h2>
              <div className="cs_height_24 cs_height_lg_24" />
              <p>{subTitle}</p>
              <Spacing lg="30" md="30" />
              {progressBarList.map((item, index) => (
                <ProgressBar
                  key={index}
                  title={item.title}
                  percentage={item.percentage}
                />
              ))}
            </div>
          </div>
          <div className="col-lg-6 offset-lg-1">
            <div className="cs_about_thumb">
              {videoSrc && (
                <div className="cs_mini_video">
                  <video autoPlay loop muted>
                    <source src={videoSrc} type="video/mp4" />
                    {/* You can add multiple source elements for different video formats */}
                    {/* <source src="your_video.webm" type="video/webm"> */}
                    {/* <source src="your_video.ogv" type="video/ogg"> */}
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              {salesTitle && (
                <div className="cs_sales_card text-center">
                  <h3 className="cs_fs_21 cs_semibold">{salesTitle}</h3>
                  <h2 className="cs_fs_50 cs_accent_color">{groth}%</h2>
                  <svg
                    width={151}
                    height={45}
                    viewBox="0 0 151 45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 44C5.42105 35.1111 19.2 18.321 38.9474 22.2716C63.6316 27.2099 59.9474 41.0371 72.8421 36.0988C85.7368 31.1605 86.1053 9.92598 96.4211 6.96302C104.674 4.59266 115.825 8.60911 120.368 10.9136L131.789 16.3457C137.193 18.8148 148 19.8025 148 4"
                      stroke="#121212"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={148}
                      cy={3}
                      r="2.5"
                      fill="#121212"
                      stroke="#121212"
                    />
                  </svg>
                </div>
              )}
              <div
                className="cs_about_thumb_in cs_bg_filed"
                style={{ backgroundImage: `url(${thumbnailSrc})` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
