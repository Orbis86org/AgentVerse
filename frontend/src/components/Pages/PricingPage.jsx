import React from 'react';
import Spacing from '../Spacing';
import SectionHeadingStyle3 from '../SectionHeading/SectionHeadingStyle3';
import ServiceStyle2 from '../Service/ServiceStyle2';
import SectionHeading from '../SectionHeading';
import PricingTableList from '../PricingTable/PricingTableList';
import CtaStyle2 from '../Cta/CtaStyle2';
import { pageTitle } from '../../helpers/PageTitle';
import {useWallet} from "../../contexts/WalletContext";

export default function PricingPage() {
    pageTitle('Pricing');

    const { dappAccountId, setDappAccountId } = useWallet();

    return (
        <>
            <Spacing lg="70" md="70"/>
            <Spacing lg="140" md="80"/>
            <SectionHeadingStyle3
                title="Simple Predictable Pricing"
                subTitle="Our Packages"
                shape="shape_2"
            />
            <Spacing lg="140" md="80"/>
            <div className="container">
                <PricingTableList/>
            </div>
            <Spacing lg="150" md="80"/>

            <div className="cs_height_150 cs_height_lg_80"/>
        </>
    );
}
