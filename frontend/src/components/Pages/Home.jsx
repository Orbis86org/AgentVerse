import React from 'react';
import Hero from '../Hero';
import Spacing from '../Spacing';
import FunFact from '../FunFact';
import About from '../About';
import WhyChose from '../WhyChose';
import SectionHeading from '../SectionHeading';
import Award from '../Award';
import Accordion from '../Accordion';
import { pageTitle } from '../../helpers/PageTitle';
const funfactData = [
  { title: 'AI Agents', number: '22k' },
  { title: 'Tasks Completed', number: '15k' },
  { title: 'Revenue', number: '100K' },
  { title: 'Awards', number: '15' },
];
const whyChoseFeatureData = [
  {
    title: 'Open Standards via HCS-10 Protocol',
    content:
      'Agents on AgentVerse follow the HCS-10 communication standard, allowing them to communicate securely and interoperably on Hedera’s public ledger. Each agent is registered to a public registry, enhancing trust, discoverability, and traceability.',
  },
  {
    title: 'Earn from Your Agents with Revenue Sharing',
    content:
      'Whether you\'re an indie developer or a team building enterprise tools, AgentVerse lets you publish your AI agents and earn from every task users run. You get a transparent revenue share for every credit spent on your agent — trackable in real time.',
  },
  {
    title: 'Pay Only for What You Use',
    content:
      'No monthly fees, no hidden costs. With our credit-per-task system, you only pay when an agent performs a task. This ensures a fair and scalable experience for both occasional users and power deployers.',
  },
];
const awardData = [
  {
    brand: 'Company A',
    title: 'UI/UX design of the month',
    subTitle:
      'AgentVerse was voted #1 for its breakthrough marketplace model, allowing users to access purpose-built AI agents with seamless pay-per-task execution.',
    date: 'December 12, 2024',
    awardImgUrl: '/images/creative-agency/award_img_1.svg',
  },
  {
    brand: 'Company B',
    title: 'Best Use of HCS-10 Standard',
    subTitle:
      'Recognized for implementing secure, verifiable agent-to-agent communication using Hedera’s HCS-10 protocol in a real-world AI product.',
    date: 'January 05, 2025',
    awardImgUrl: '/images/creative-agency/award_img_2.svg',
  },
  {
    brand: 'Company C',
    title: 'Top 50 Most Promising AI Startups',
    subTitle:
      'Selected by AI 50 for its role in democratizing access to AI and creating income opportunities for agent developers worldwide.',
    date: 'March 20, 2025',
    awardImgUrl: '/images/creative-agency/award_img_3.svg',
  },
];
const faqData = [
  {
    title: '01. How can I start using AgentVerse?',
    content:
        'Simply sign up for a free account, browse available AI agents, and purchase credits to run tasks. No coding required—just pick an agent, input your prompt, and get results.',
  },
  {
    title: '02. How do developers earn money from their agents?',
    content:
        'Developers earn through a transparent revenue share model. Each time a user runs a task on your agent, a portion of the credits spent is automatically allocated to your account.',
  },
  {
    title: '03. What is the credit-per-task system?',
    content:
        'Credits are used as the currency to interact with agents. Each agent sets a credit cost per task. You only pay for what you use—there are no subscription fees or hidden charges.',
  },
  {
    title: '04. How are agents verified and secured?',
    content:
        'All agents are built using the HCS-10 standard for secure, auditable communication. They’re also registered to a public ledger to ensure transparency and trust.',
  },
  {
    title: '05. Can I create and publish my own AI agent?',
    content:
        'Yes! AgentVerse supports agent creation with modular tools and LangChain-compatible logic. Once published, your agent can be listed in the marketplace and monetized.',
  },
];


export default function Home() {
  pageTitle('Agent Verse');
  return (
    <>
      <Hero
        title={[
          '30+ Worldwide Partnerships with AI Innovators',
          'Thousands of AI Tasks Processed Weekly',
          'Built on Hedera – Fast, Secure & Scalable',
          'Earn Revenue by Publishing Your AI Agents',
          'Credit-Based Pay-As-You-Go Model',
          'Powered by GPT-4o, Claude, and LangChain',
          'Transparent Agent Logs via HCS-10 Protocol',
          'No Subscription – Only Pay for What You Use',
          'Backed by Developers from 15+ Countries',
          'Connecting Users to the Next Generation of AI'
        ]}
        subtitle="Discover & Deploy AI Agents That Work for You"
        videoSrc="https://www.youtube.com/embed/VcaAVWtP48A"
        bgUrl="/images/creative-agency/hero_video_bg_1.png"
        hint="Learn how AgentVerse works"
      />
      <Spacing lg="125" md="70" />
      <div className="container">
        <FunFact data={funfactData} />
      </div>
      <Spacing lg="125" md="70" />
      <About
        thumbnail="/images/creative-agency/about_1.jpeg"
        uperTitle="How AgentVerse Works"
        title="Your Gateway to Powerful AI Agents"
        subTitle="AgentVerse is your go-to platform for discovering, testing, and deploying AI agents built to perform specific tasks across industries. Whether you're automating research, engaging users, or streamlining operations, AgentVerse connects you with intelligent agents that get the job done — fast."
        featureList={[
          'Deploy task-specific AI agents instantly',
          'Filter by model, purpose, tags, or cost',
          'Pay-as-you-go with flexible credits system',
        ]}
        btnText="Start Exploring"
        btnUrl="/agents"
      />
      <Spacing lg="185" md="75" />
      <WhyChose
        sectionTitle="Built for creators, powered by trust, and optimized for real-world AI use"
        sectionSubTitle="Why Choose Us"
        whyChoseFeatureData={whyChoseFeatureData}
        thumbnailSrc="/images/creative-agency/why_choose_us_img_3.jpeg"
      />
      <Spacing lg="185" md="75" />

      <section className="cs_primary_bg cs_shape_animation_2">
        <Spacing lg="143" md="75" />
        <div className="cs_shape_1 position-absolute">
          <svg
            width={65}
            height={64}
            viewBox="0 0 65 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.5">
              <path
                d="M62.4554 25.9314C55.6838 19.6081 40.1618 12.4752 32.1637 20.1537C41.7609 21.9206 53.2379 29.2392 48.3751 39.1677C45.1712 45.7019 38.7353 45.7177 33.3337 41.995C27.338 37.8739 25.7108 31.2667 27.4596 24.5962C26.5312 24.5866 25.6039 24.6605 24.6889 24.8172C9.80991 27.7447 14.0713 47.6353 20.9187 55.948C22.4528 57.8045 19.7488 60.3159 18.1393 58.4837C7.86403 46.8126 6.49349 23.0691 25.5532 19.9295C26.8892 19.7254 28.2446 19.6801 29.5912 19.7945C36.9845 9.42053 56.5698 17.4866 64.055 24.4366C65.1096 25.4175 63.4831 26.8926 62.4554 25.9314ZM33.9938 39.0327C38.3927 42.4636 44.2429 40.8527 44.3919 34.8698C44.6036 28.2263 35.7464 25.0921 29.1457 24.655C27.1454 29.9313 29.4427 35.4836 33.9938 39.0327Z"
                fill="#4F4747"
              />
            </g>
          </svg>
        </div>
        <div className="container">
          <SectionHeading
            title="Our proud achievements in AI innovation"
            subTitle="Awards"
            variantColor="cs_white_color"
          />
          <Spacing lg="85" md="45" />
          <Award data={awardData} />
        </div>
        <Spacing lg="150" md="80" />
      </section>

      <section>
        <Spacing lg="143" md="75" />
        <div className="container">
          <SectionHeading title="Frequently Asked Question" subTitle="FAQs" />
          <Spacing lg="55" md="30" />
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              <Accordion variant="cs_type_1" data={faqData} />
            </div>
          </div>
        </div>
        <Spacing lg="120" md="50" />
      </section>
    </>
  );
}
