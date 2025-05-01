import React, { useEffect, useState } from 'react';
import SectionHeadingStyle3 from '../../SectionHeading/SectionHeadingStyle3';
import Spacing from '../../Spacing';
import { useWallet } from '../../../contexts/WalletContext';
import AgentFormModal from '../../AgentComponents/AgentFormModal';
import {Bounce, toast} from "react-toastify";

export default function MyAgents() {
    const { dappAccountId, remainingCreditsBalance } = useWallet();

    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editAgent, setEditAgent] = useState(null);

    useEffect(() => {
        fetchAgents();
    }, [dappAccountId]);

    const fetchAgents = async () => {
        if (!dappAccountId) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/my-agents/${dappAccountId}`);
            const data = await res.json();
            setAgents(data);
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewAgent = () => {
        setEditAgent(null);
        setShowModal(true);
    };

    const handleEditAgent = (agent) => {
        setEditAgent(agent);
        setShowModal(true);
    };

    const handleDeleteAgent = async (agentSlug) => {
        if (!window.confirm('Are you sure you want to delete this agent?')) return;

        try {
            await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agents/${agentSlug}`, {
                method: 'DELETE',
            });
            await fetchAgents();

            toast.success('Agent Deleted', {
                position: 'top-right',
                autoClose: 5000,
                theme: 'dark',
                transition: Bounce,
            });

        } catch (error) {
            console.error('Error deleting agent:', error);

            toast.error('Failed To Delete Agent', {
                position: 'top-right',
                autoClose: 5000,
                theme: 'dark',
                transition: Bounce,
            });
        }
    };

    return (
        <>
            <Spacing lg="120" md="80" />
            <SectionHeadingStyle3 title="Manage My Agents" variant="text-center" />
            <Spacing lg="50" md="30" />

            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="text-light">My Agents</h4>
                    <button className={`cs_btn cs_style_1 ${
                        'cs_btn_white'
                    }`} onClick={handleNewAgent}>
                        New Agent
                    </button>
                </div>

                {loading ? (
                    <div className="text-light">Loading...</div>
                ) : agents.length === 0 ? (
                    <div className="text-warning">You haven't submitted any agents yet.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-striped">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Tasks Done</th>
                                <th>Avg. Rating</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Lifetime Value</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {agents.map((agent) => (
                                <tr key={agent.id}>
                                    <td>
                                        <a style={{ color: '#fd6219' }} target="_blank" href={`/agents/${agent.slug}`}>{agent.name}</a>
                                    </td>
                                    <td>{agent.tasksDone || 0}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="me-2">{agent.avgRating?.toFixed(1) || 'N/A'}</span>
                                            <div style={{fontSize: '1rem', color: 'gold'}}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star}> {agent.avgRating >= star ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <small
                                            className="text-warning">{agent._count?.AgentRating || 0} rating{agent._count?.AgentRating === 1 ? '' : 's'}</small>
                                    </td>

                                    <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                                    <td>{new Date(agent.updatedAt).toLocaleDateString()}</td>
                                    <td>{agent.lifetimeValue?.toFixed(2) || 0} credits</td>
                                    <td>
                                        <button className="btn btn-sm btn-primary me-2"
                                                onClick={() => handleEditAgent(agent)}>Edit
                                        </button>
                                        <button className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteAgent(agent.slug)}>Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <AgentFormModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onRefresh={fetchAgents}
                    editAgent={editAgent}
                />
            )}

            <Spacing lg="120" md="50" />
        </>
    );
}
