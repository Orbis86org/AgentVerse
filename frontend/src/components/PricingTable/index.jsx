import React from 'react';
import { Link } from 'react-router-dom';
import {useWallet} from "../../contexts/WalletContext";
import {Bounce, toast} from "react-toastify";

export default function PricingTable({
  title,
  subTitle,
  price,
  currency,
  features,
  btnLink,
  btnText,
  timeline,
  popular,
    credits
}) {

    const { dappAccountId, connectWallet, transferHbar, setRemainingCreditsBalance, remainingCredits } = useWallet();

  return (
    <div className="cs_pricing_table cs_style1 cs_radius_15">
      <h2 className="cs_pricing_title cs_fs_29 cs_semibold">
        {title} {popular && <span>Popular</span>}
      </h2>
      <div className="cs_pricing_info">
        <div className="cs_price">
          <h3 className="cs_accent_color cs_fs_50">
            {price}  {currency}
          </h3>
          <span className="cs_accent_color cs_medium">
            {timeline && `/${timeline}`}
          </span>
        </div>
        <div className="cs_price_text cs_gray_color_2">{subTitle}</div>
      </div>
      <ul className="cs_pricing_feature cs_mp0 cs_primary_font cs_fs_21">
        {features?.map((item, index) => (
          <li key={index}>
            <span className="cs_feature_icon cs_accent_color">
              <img src="/images/icons/check.svg" alt="Icon" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="cs_pricing_btn_wrap">
          {dappAccountId ? (
              <div
                  className="cs_btn cs_style_1 cs_white_color"
                  onClick={async () => {
                      const transferred = await transferHbar( price );
                      if( ! transferred ) {
                          toast.error('Error purchasing credits', {
                              position: "top-right",
                              autoClose: 5000,
                              hideProgressBar: false,
                              closeOnClick: false,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              theme: "dark",
                              transition: Bounce,
                          });

                          return;
                      }

                      const network = process.env.REACT_APP_HEDERA_NETWORK;

                      // Transfer credits
                      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/credits/purchase`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                              walletAddress: dappAccountId,
                              credits,
                              network,
                              txHash: transferred.toString(),
                          }),
                      });

                      const data = await res.json();
                      if (res.ok) {
                          toast.success("Credits purchased successfully!");

                          // Refresh credits immediately after successful payment
                          const updatedCredits = await remainingCredits();
                          setRemainingCreditsBalance(updatedCredits);
                      } else {
                          toast.error(data.error || "Something went wrong");
                      }


                  }}
              >
                  {btnText}
              </div>
          ) : (
              <div
                  className="cs_btn cs_style_1 cs_white_color"
                  onClick={async () => {
                      await connectWallet();
                  }}
              >
                  Connect Wallet
              </div>
          )}
      </div>
    </div>
  );
}
