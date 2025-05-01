import React from 'react';
import { useState } from 'react';
import PricingTable from '.';
import {useWallet} from "../../contexts/WalletContext";

export default function PricingTableList() {

  const { dappAccountId, setDappAccountId } = useWallet();

  return (
    <div className="cs_tabs cs_style1">
      <div className="row cs_gap_y_30">
        <div className="col-lg-4">
          <PricingTable
              title="Silver"
              subTitle="Get 20 credits"
              credits='20'
              price="20"
              currency="HBAR"
              timeline=""
              features={[
                  'Use On Unlimited AI Agents',
                  'No Expiry'
              ]}
              btnText="Choose Package"
              btnLink="/"
          />
        </div>

        <div className="col-lg-4">
          <PricingTable
              title="Gold"
              subTitle="Get 100 credits"
              credits='100'
              price="100"
              currency="HBAR"
              timeline=""
              features={[
                  'Use On Unlimited AI Agents',
                  'No Expiry'
              ]}
              btnText="Choose Package"
              btnLink="/"
              popular
          />
        </div>

        <div className="col-lg-4">
          <PricingTable
              title="Platinum"
              subTitle="Get 200 credits"
              credits='200'
              price="200"
              currency="HBAR"
              timeline=""
              features={[
                  'Use On Unlimited AI Agents',
                  'No Expiry'
              ]}
              btnText="Choose Package"
              btnLink="/"
          />
        </div>
      </div>
    </div>
  );
}
