import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Spacing from '../../Spacing';
import SectionHeadingStyle3 from '../../SectionHeading/SectionHeadingStyle3';
import { pageTitle } from '../../../helpers/PageTitle';
import ChatAgent from '../../AgentComponents/ChatAgent';
import { useWallet } from "../../../contexts/WalletContext";
import { Bounce, toast } from "react-toastify";

export default function AgentDetails() {
  const { slug } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0, myRating: null });
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const { dappAccountId, remainingCredits, setRemainingCreditsBalance } = useWallet();


  pageTitle('Agent Details');

  // Fetch agent details
  useEffect(() => {
    async function fetchAgent() {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agents/${slug}`);
        const data = await res.json();
        setAgent(data);
      } catch (error) {
        console.error('Error loading agent:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
    if (dappAccountId) fetchRating();
  }, [slug, dappAccountId]);

  // Fetch rating details (made separate)
  const fetchRating = async () => {
    if (!dappAccountId) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agent/ratings/${slug}?walletAddress=${dappAccountId}`);
      const data = await res.json();
      setRatingData({
        average: data.averageRating || 0,
        count: data.totalRatings || 0,
        myRating: data.myRating || null,
      });
      setSelectedRating(data.myRating || 0);
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!dappAccountId) {
      toast.error('Please connect your wallet first.');
      return;
    }

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agent/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: parseInt(agent.id, 10),
          walletAddress: dappAccountId,
          rating,
          comment: '',
        }),
      });

      toast.success('Rating submitted!', { theme: "dark", transition: Bounce });
      await fetchRating(); // 🔥 Auto-refresh
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error('Error submitting rating.');
    }
  };

  const handleRemoveRating = async () => {
    if (!dappAccountId) return;

    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agent/feedback/${agent.id}/${dappAccountId}`, {
        method: 'DELETE',
      });

      toast.success('Rating removed.', { theme: "dark", transition: Bounce });
      await fetchRating(); // 🔥 Auto-refresh
    } catch (err) {
      console.error('Error removing rating:', err);
      toast.error('Error removing rating.');
    }
  };

  if (loading) return <div className="text-center text-light py-5">Loading...</div>;
  if (!agent) return <div className="text-center text-danger py-5">Agent not found</div>;

  return (
      <>
        <Spacing lg="70" md="70" />
        <Spacing lg="100" md="60" />
        <SectionHeadingStyle3
            title={agent?.name || 'Loading Agent'}
            subTitle="Go Back To Marketplace"
            variant="text-center"
            href="/agents"
        />
        <Spacing lg="75" md="60" />

        <div className="container">
          <div className="card bg-dark text-white border-light mb-5">
            <div className="row g-0">
              <div className="col-md-4">
                <img
                    src={agent.imageUrl || '/images/agents/agent.png'}
                    className="img-fluid rounded-start"
                    alt={agent.name}
                />
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h2 className="card-title">{agent.name}</h2>
                  <p className="card-text">{agent.description}</p>

                  <div className="mb-2"><strong>Model:</strong> {agent.model}</div>
                  <div className="mb-2"><strong>Account ID:</strong> <a className="cs_accent_color" href={`https://hashscan.io/${process.env.REACT_APP_HEDERA_NETWORK}/account/${agent.accountId}`} target="_blank">{agent.accountId}</a> </div>
                  <div className="mb-2"><strong>Purpose:</strong> {agent.purpose}</div>
                  <div className="mb-2"><strong>Price:</strong> {agent.creditsPerTask} credits per task</div>

                  {agent.tags?.length > 0 && (
                      <div className="mb-3">
                        <strong>Tags:</strong>{' '}
                        {agent.tags.map(tag => (
                            <span key={tag.id} className="badge bg-primary me-2">
                        {tag.value}
                      </span>
                        ))}
                      </div>
                  )}

                  {/* ⭐ Rating Section */}
                  <div className="mb-3">
                    <strong>Rating:</strong> {ratingData.average.toFixed(1)} / 5 ⭐
                    ({ratingData.count} {ratingData.count === 1 ? 'rating' : 'ratings'})
                  </div>

                  <div className="mb-3">
                    {dappAccountId ? (
                        <>
                          <div className="d-flex align-items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    onClick={() => handleRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    style={{
                                      fontSize: '2rem',
                                      color: (hoverRating || selectedRating) >= star ? 'gold' : 'gray',
                                      cursor: 'pointer',
                                      marginRight: '5px',
                                      transition: 'color 0.3s',
                                    }}
                                >
                            ★
                          </span>
                            ))}
                          </div>

                          {selectedRating > 0 && (
                              <button
                                  className="btn btn-sm btn-outline-danger mt-2"
                                  onClick={handleRemoveRating}
                              >
                                Remove Rating
                              </button>
                          )}
                        </>
                    ) : (
                        <p className="text-warning">Connect your wallet to rate this agent.</p>
                    )}
                  </div>

                  {/* Button to Start Chat */}
                  {!showChat && (
                      <button className="btn btn-success mt-3" onClick={() => setShowModal(true)}>
                        Start Chat
                      </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🗣️ Chat Area */}
          {showChat && (
              <>
                <h4 className="text-light mb-3">Talk to {agent.name}</h4>
                <ChatAgent agentSlug={agent.slug} walletAddress={dappAccountId} />
              </>
          )}
        </div>

        {/* 🛑 Modal for Payment */}
        {showModal && (
            <div className="modal d-block fade show" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-dark text-white">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Payment</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    { dappAccountId === agent.walletAddress ? (
                        <p>
                          This agent requires <strong>{agent.creditsPerTask} credits</strong> per task. <br/><br/>
                          You developed this agent, so you won't be charged. <br/><br/>
                          Would you like to continue?
                        </p>
                    ) : (
                        <p>
                          This agent requires <strong>{agent.creditsPerTask} credits</strong> per task. <br/><br/>
                          Would you like to continue?
                        </p>
                    )}

                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={async () => {
                          try {
                            if (dappAccountId === agent.walletAddress) {
                              setShowChat(true);
                              setShowModal(false);
                              toast.success('You can start chatting. No credits deducted.', {
                                theme: "dark",
                                transition: Bounce
                              });
                              return;
                            }

                            // 🛒 Otherwise, proceed to payment API
                            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agent/pay`, {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json'},
                              body: JSON.stringify({
                                walletAddress: dappAccountId,
                                agentId: agent.id,
                              }),
                            });

                            if (!res.ok) {
                              const data = await res.json();
                              toast.error(data.error || 'Error starting chat.', {theme: "dark", transition: Bounce});
                              return;
                            }

                            // Refresh credits if payment was made
                            const updatedCredits = await remainingCredits();
                            setRemainingCreditsBalance(updatedCredits);

                            setShowChat(true);
                            setShowModal(false);
                            toast.success('Payment successful. You can now chat!', {theme: "dark", transition: Bounce});
                          } catch (error) {
                            console.error('Payment error:', error);
                            toast.error('Server error. Try again.', {theme: "dark", transition: Bounce});
                          }
                        }}
                    >
                      Continue
                    </button>


                  </div>
                </div>
              </div>
            </div>
        )}

        <Spacing lg="150" md="80"/>
      </>
  );
}
