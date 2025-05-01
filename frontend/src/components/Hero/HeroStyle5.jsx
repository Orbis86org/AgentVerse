import { useState } from 'react';
import Button from '../Button';
import parse from 'html-react-parser';

export default function HeroStyle5({
  highlightTitle,
  title,
  subTitle,
  btnText,
  btnUrl,
  videoSrc,
  videoBtnText,
}) {
  const [iframeSrc, setIframeSrc] = useState('about:blank');
  const [toggle, setToggle] = useState(false);
  const handelClick = () => {
    setIframeSrc(`${videoSrc}`);
    setToggle(!toggle);
  };
  const handelClose = () => {
    setIframeSrc('about:blank');
    setToggle(!toggle);
  };
  return (
    <section
      className="cs_hero cs_style_5 position-relative text-center cs_center cs_ripple_activate cs_bg_filed"
      style={{ backgroundImage: 'url(/images/tech-startup/hero-bg.jpeg)' }}
    >
      <div className="container">
        <div className="cs_hero_text position-relative">
          <p className="cs_hero_top_title">
            <img src="/images/icons/flower.svg" alt="Icon" />
            {highlightTitle}
          </p>
          <h1 className="cs_hero_title cs_fs_68 cs_white_color">
            {parse(title)}
          </h1>
          <p className="cs_hero_subtitle">{parse(subTitle)}</p>
          <div className="cs_hero_btns">
            <Button
              btnText={btnText}
              btnUrl={btnUrl}
              variantColor="cs_btn_accent"
            />
            <span className="cs_play_btn cs_style_1" onClick={handelClick}>
              <img src="/images/icons/play.svg" alt="Icon" />
              {videoBtnText}
            </span>
          </div>
        </div>
      </div>
      <div id="background-wrap">
        <div className="bubble cs_hero_shape_1">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_2">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_3">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_4">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_5">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_6">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_7">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_8">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_9">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
        <div className="bubble cs_hero_shape_10">
          <img
            src="/images/tech-startup/hero_circle_shape_1.png"
            alt="Circle"
          />
        </div>
      </div>
      <div className={toggle ? 'cs_video_popup active' : 'cs_video_popup'}>
        <div className="cs_video_popup_overlay" />
        <div className="cs_video_popup_content">
          <div className="cs_video_popup_layer" />
          <div className="cs_video_popup_container">
            <div className="cs_video_popup_align">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe
                  className="embed-responsive-item"
                  src={iframeSrc}
                  title="video modal"
                />
              </div>
            </div>
            <div className="cs_video_popup_close" onClick={handelClose} />
          </div>
        </div>
      </div>
    </section>
  );
}
