// pages/AgentsManagePage.jsx

import React, { useEffect, useState } from 'react';
import Spacing from '../../Spacing';
import SectionHeadingStyle3 from '../../SectionHeading/SectionHeadingStyle3';
import { pageTitle } from '../../../helpers/PageTitle';
import { useWallet } from '../../../contexts/WalletContext';
import AgentFormModal from "../../AgentComponents/AgentFormModal";

export default function AgentsManagePage() {
    pageTitle('Manage My Agents');
    const { dappAccountId, remainingCredits, setRemainingCreditsBalance } = useWallet();

    const [userAgents, setUserAgents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingAgent, setEditingAgent] = useState(null);

    useEffect(() => {
        if (dappAccountId) fetchUserAgents();
    }, [dappAccountId]);

    const fetchUserAgents = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agents?walletAddress=${dappAccountId}`);
            const data = await res.json();
            setUserAgents(data);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setEditingAgent(null);
        setShowModal(true);
    };

    const openEditModal = (agent) => {
        setModalMode('edit');
        setEditingAgent(agent);
        setShowModal(true);
    };

    const deleteAgent = async (agentId) => {
        if (!window.confirm('Are you sure you want to delete this agent?')) return;

        try {
            await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agents/${agentId}`, {
                method: 'DELETE',
            });
            fetchUserAgents();
        } catch (error) {
            console.error('Error deleting agent:', error);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

    return (
        <>
            <Spacing lg="120" md="80" />
            <SectionHeadingStyle3 title="Manage My Agents" variant="text-center" />
            <Spacing lg="50" md="30" />

            <div className="container">
                <div className="d-flex justify-content-between mb-4">
                    <h4 className="text-light">My AI Agents</h4>
                    <button className="btn btn-success" onClick={openCreateModal}>➕ New Agent</button>
                </div>

                <div className="table-responsive">
                    <table className="table table-dark table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Tasks Done</th>
                            <th>Avg Rating</th>
                            <th>Created</th>
                            <th>Updated</th>
                            <th>Lifetime Earnings</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userAgents.length > 0 ? userAgents.map(agent => (
                            <tr key={agent.id}>
                                <td>{agent.name}</td>
                                <td>{agent.tasksDone || 0}</td>
                                <td>{agent.avgRating?.toFixed(2) || '-'}</td>
                                <td>{formatDate(agent.createdAt)}</td>
                                <td>{formatDate(agent.updatedAt)}</td>
                                <td>{agent.lifetimeCredits || 0} credits</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => openEditModal(agent)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => deleteAgent(agent.id)}>Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="text-center">No agents found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <AgentFormModal
                        mode={modalMode}
                        agent={editingAgent}
                        onClose={() => setShowModal(false)}
                        onSave={() => { setShowModal(false); fetchUserAgents(); setRemainingCreditsBalance(remainingCredits()); }}
                    />
                )}
            </div>

            <Spacing lg="120" md="80" />
        </>
    );
}
