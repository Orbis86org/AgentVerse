import React from 'react';
import SideMenuWidget from '../Widget/SideMenuWidget';
import RecentPost from '../Widget/RecentPost';
import TagWidget from '../Widget/TagWidget';
import SearchWidget from '../Widget/SearchWidget';
const tagData = [
  {
    title: 'Business',
    url: '/',
  },
  {
    title: 'Agency',
    url: '/',
  },
  {
    title: 'Artwork',
    url: '/',
  },
  {
    title: 'Marketing',
    url: '/',
  },
  {
    title: 'Information',
    url: '/',
  },
  {
    title: 'Design',
    url: '/',
  },
  {
    title: 'Wordpress',
    url: '/',
  },
];
const archiveData = [
  {
    title: 'Archives',
    url: '/',
  },
  {
    title: '15 Aug 2023',
    url: '/',
  },
  {
    title: '20 Sep 2022',
    url: '/',
  },
  {
    title: '11 Dec 2021',
    url: '/',
  },
  {
    title: '25 jun 2020',
    url: '/',
  },
];
const categoryData = [
  {
    title: 'Corporate',
    url: '/',
  },
  {
    title: 'Company',
    url: '/',
  },
  {
    title: 'Search Engine',
    url: '/',
  },
  {
    title: 'Information',
    url: '/',
  },
  {
    title: 'Painting',
    url: '/',
  },
];
const recentPostData = [
  {
    title: 'How to studio setup...',
    thumb: '/images/blog/post_1.jpeg',
    href: '/blog/blog-details',
    date: '15 Aug 2023',
  },
  {
    title: 'Creative people mind...',
    thumb: '/images/blog/post_2.jpeg',
    href: '/blog/blog-details',
    date: '14 Aug 2023',
  },
  {
    title: 'AI take over human...',
    thumb: '/images/blog/post_3.jpeg',
    href: '/blog/blog-details',
    date: '13 Aug 2023',
  },
  {
    title: 'You should now add...',
    thumb: '/images/blog/post_4.jpeg',
    href: '/blog/blog-details',
    date: '12 Aug 2023',
  },
];

export default function Sidebar() {
  return (
    <div className="cs-sidebar cs-right_sidebar cs-accent_5_bg_2">
      <div className="cs-sidebar_item">
        <SearchWidget title="Search" />
      </div>
      <div className="cs-sidebar_item widget_categories">
        <SideMenuWidget title="Categories" data={categoryData} />
      </div>
      <div className="cs-sidebar_item">
        <RecentPost title="Recent Posts" data={recentPostData} />
      </div>
      <div className="cs-sidebar_item widget_archive">
        <SideMenuWidget title="Archives" data={archiveData} />
      </div>
      <div className="cs-sidebar_item widget_archive">
        <TagWidget title="Tags" data={tagData} />
      </div>
    </div>
  );
}
