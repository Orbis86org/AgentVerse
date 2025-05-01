import React from 'react';
import { Link } from 'react-router-dom';

export default function RecentPost({ title, data }) {
  return (
    <>
      <h4 className="cs-sidebar_widget_title">{title}</h4>
      <ul className="cs-recent_posts">
        {data?.map((item, index) => (
          <li key={index}>
            <div className="cs-recent_post">
              <Link to={item.href} className="cs-recent_post_thumb">
                <div
                  className="cs-recent_post_thumb_in cs-bg"
                  style={{ backgroundImage: `url(${item.thumb})` }}
                />
              </Link>
              <div className="cs-recent_post_info">
                <h3 className="cs-recent_post_title">
                  <Link to={item.href}>{item.title}</Link>
                </h3>
                <div className="cs-recent_post_date cs-primary_40_color">
                  {item.date}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
