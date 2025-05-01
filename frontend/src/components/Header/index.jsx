import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DropDown from './DropDown';
import {useWallet} from "../../contexts/WalletContext";

export default function Header({
                                 logoUrl,
                                 colorVariant,
                                 cart,
                                 actionBtnText,
                                 actionBtnUrl,
                               }) {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileToggle, setMobileToggle] = useState(false);
  const [dAppConnector, setDAppConnector] = useState(null);
  const { dappAccountId, connectWallet, disconnectWallet, remainingCreditsBalance, setRemainingCreditsBalance, remainingCredits } = useWallet();

  useEffect(() => {

    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let intervalId: any;

    async function fetchBalances() {
      if (!dappAccountId) return;

      const credits = await remainingCredits();
      setRemainingCreditsBalance(credits);
    }

    if (dappAccountId) {
      fetchBalances(); // Initial fetch when wallet is ready

      intervalId = setInterval(() => {
        fetchBalances(); // Refresh every 1 minute
      }, 60000); // 60000ms = 1 minute
    }

    return () => clearInterval(intervalId); // Cleanup when component unmounts
  }, [dappAccountId]);


  return (
      <header
          className={`cs_site_header cs_style_1 cs_sticky_header ${
              colorVariant || 'cs_primary_color'
          } ${isSticky ? 'cs_gescout_show' : ''}`}
      >
        <div className="cs_main_header">
          <div className="container">
            <div className="cs_main_header_in">
              <div className="cs_main_header_left">
                <Link className="cs_site_branding" to="/">
                  <h3><span style={{ color: '#fd6219'}}>Agent</span>Verse</h3>
                </Link>
              </div>
              <div className="cs_main_header_center">
                <div className="cs_nav cs_medium cs_primary_font">
                  <ul
                      className={`${
                          mobileToggle ? 'cs_nav_list cs_active' : 'cs_nav_list'
                      }`}
                  >
                    <li>
                      <Link to="/">Home</Link>
                    </li>

                    <li className="menu-item-has-children">
                      <Link to="agents">Agents</Link>
                      <DropDown>
                        <ul>
                          <li>
                            <Link to="agents">Agents Marketplace</Link>
                          </li>
                          { dappAccountId && (
                              <li>
                                <Link to="agents/my-agents">My Agents</Link>
                              </li>
                          )}
                        </ul>
                      </DropDown>
                    </li>

                    <li>
                      <Link to="pricing">Pricing</Link>
                    </li>

                    {dappAccountId && (
                        <li>
                          <Link to="my-account">My Account</Link>
                        </li>
                    )
                    }

                    <li>
                      <Link to="contact">Contact</Link>
                    </li>
                  </ul>
                  <span
                      className={
                        mobileToggle
                            ? 'cs_menu_toggle cs_teggle_active'
                            : 'cs_menu_toggle'
                      }
                      onClick={() => setMobileToggle(!mobileToggle)}
                  >
                  <span></span>
                </span>
                </div>
              </div>
              <div className="cs_main_header_right">
                {cart && (
                    <a href="shop-cart" className="cs_header_cart" style={{display: 'none'}}>
                      <svg
                          width={22}
                          height={22}
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* cart svg path */}
                        <path
                            d="M19.25 5.5H16.5C16.5 4.04131 ..."
                            fill="currentColor"
                        />
                      </svg>
                      <span className="cs_header_cart_label">0</span>
                    </a>
                )}

                <div
                    className={`cs_btn cs_style_1 ${
                        colorVariant ? 'cs_btn_white' : ''
                    }`}
                    onClick={async () => {
                      if( ! dappAccountId ) {
                        await connectWallet();

                        const credits = await remainingCredits();
                        setRemainingCreditsBalance(credits);

                        return;
                      }

                      await disconnectWallet();


                    }}
                >
                  { dappAccountId && (
                      <div style={{fontSize: '11px', color: '#ccc'}}>
                        { remainingCreditsBalance } Credits
                      </div>
                  )}

                  { /* actionBtnText */}
                  {dappAccountId ? dappAccountId : 'Connect Wallet'}

                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
  );
}
