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
                videoSrc="https://www.youtube.com/embed/xgFdDBX_1qM"
                bgUrl="/images/video-thumbnail.jpg"
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
