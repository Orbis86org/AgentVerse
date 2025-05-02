import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import {Bounce, toast} from "react-toastify";

export default function AgentFormModal({ show, onClose, onRefresh, editAgent }) {
    const { dappAccountId, remainingCredits, setRemainingCreditsBalance } = useWallet();

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        purpose: '',
        model: 'gpt-4o-mini',
        instructions: '',
        creditsPerTask: 1,
        imageUrl: '',
        network: 'testnet',
        apiKey: '',
        tags: '',
    });
    const [slugValid, setSlugValid] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (editAgent) {
            console.log('Edit agent', editAgent);
            setFormData({
                name: editAgent.name ?? '',
                slug: editAgent.slug ?? '',
                description: editAgent.description ?? '',
                purpose: editAgent.purpose ?? '',
                model: editAgent.model ?? 'gpt-4o-mini',
                instructions: editAgent.instructions ?? '',
                creditsPerTask: editAgent.creditsPerTask ?? 1,
                imageUrl: editAgent.imageUrl ?? '',
                network: editAgent.network ?? 'testnet',
                apiKey: '', // never prefill sensitive fields
                tags: editAgent.tags ? editAgent.tags.map(tag => tag.value).join(', ') : '',
            });

            setSlugValid(true);
        } else {
            resetForm();
        }
    }, [editAgent]);


    const resetForm = () => {
        setFormData({
            name: '', slug: '', description: '', purpose: '',
            model: 'gpt-4o-mini', instructions: '', creditsPerTask: 1,
            imageUrl: '', network: 'testnet', apiKey: '', tags: '',
        });
        setSlugValid(null);
        setMessage(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'slug') setSlugValid(null);
    };

    const validateSlug = async () => {
        if (!formData.slug.trim()) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/agents/${formData.slug}`);
            if (editAgent) {
                setSlugValid(true); // allow when editing
            } else {
                setSlugValid(res.status === 404); // valid if not found
            }
        } catch {
            setSlugValid(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dappAccountId) return alert('Connect your wallet.');
        if (!slugValid) return alert('Please choose a unique slug.');

        const body = {
            ...formData,
            creditsPerTask: parseInt(formData.creditsPerTask),
            tags: formData.tags.split(',').map(tag => tag.trim()),
            walletAddress: dappAccountId,
        };

        setLoading(true);
        setMessage(null);

        try {
            const endpoint = editAgent
                ? `${process.env.REACT_APP_BACKEND_URL}/api/agents/${editAgent.slug}`
                : `${process.env.REACT_APP_BACKEND_URL}/api/agents`;

            const method = editAgent ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save agent.');

            setMessage('✅ Agent saved successfully!');

            toast.success('Agent saved successfully!', {
                position: 'top-right',
                autoClose: 5000,
                theme: 'dark',
                transition: Bounce,
            });


            if (!editAgent) {
                const updatedCredits = await remainingCredits();
                setRemainingCreditsBalance(updatedCredits);
            }

            onRefresh();
            onClose();
        } catch (err) {
            console.error('Error submitting agent:', err);
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block fade show" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content bg-dark text-white">
                    <div className="modal-header">
                        <h5 className="modal-title">{editAgent ? 'Edit Agent' : 'Create New Agent'}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit} className="modal-body">
                        <div className="row">
                            <div className="col-md-6">
                                <label className="cs_shop-label">Name *</label>
                                <input className="cs_shop-input" name="name" value={formData.name}
                                       onChange={handleChange} required/>
                            </div>
                            <div className="col-md-6">
                                <label className="cs_shop-label">Slug *</label>
                                <input className="cs_shop-input" name="slug" value={formData.slug}
                                       onChange={handleChange} onBlur={validateSlug} required/>
                                {slugValid === false && <span style={{color: 'red'}}>❌ Slug is already taken</span>}
                                {slugValid === true && <span style={{color: 'green'}}>✅ Slug is available</span>}
                            </div>

                            <div className="col-lg-12">
                                <label className="cs_shop-label">Description *</label>
                                <textarea name="description" value={formData.description} onChange={handleChange}
                                          required
                                          className="cs_shop-input" rows="3"/>
                            </div>

                            <div className="col-md-12">
                                <label className="cs_shop-label">Purpose *</label>
                                <input className="cs_shop-input" name="purpose" value={formData.purpose}
                                       onChange={handleChange} required/>
                                <p>Example: Marketing, Web3 Education etc.</p>
                            </div>

                            <div className="col-md-12">
                                <label className="cs_shop-label">Instructions *</label>
                                <textarea className="cs_shop-input" name="instructions" value={formData.instructions}
                                          onChange={handleChange} required rows="3"/>
                                <p>Example: You are a Hedera blockchain expert. Respond to questions about HBAR, smart
                                    contracts, Hedera Consensus Service, and other ecosystem components with clear,
                                    technical explanations. If the user asks something unrelated, politely guide them
                                    back to Hedera topics.</p>
                            </div>

                            <div className="col-md-6">
                                <label className="cs_shop-label">Credits per Task *</label>
                                <input className="cs_shop-input" name="creditsPerTask" type="number"
                                       value={formData.creditsPerTask} onChange={handleChange} required/>
                            </div>
                            <div className="col-md-6">
                                <label className="cs_shop-label">Model *</label>
                                <select
                                    className="cs_shop-input"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                >
                                    <option style={{color: '#000'}} value="gpt-4o-mini">gpt-4o-mini</option>
                                    <option style={{color: '#000'}} value="gpt-4o">gpt-4o</option>
                                    <option style={{color: '#000'}} value="dall-e">dall-e</option>
                                </select>
                            </div>

                            <div className="col-md-12">
                                <label className="cs_shop-label">Network *</label>
                                <select
                                    className="cs_shop-input"
                                    name="network"
                                    value={formData.network}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="testnet">Testnet</option>
                                </select>
                            </div>


                            <div className="col-12">
                                <label className="cs_shop-label">Tags (comma separated)</label>
                                <input className="cs_shop-input" name="tags" value={formData.tags}
                                       onChange={handleChange}/>
                                <p>Example: Blockchain, Finance etc.</p>
                            </div>

                        </div>

                        {message && <p className="mt-3">{message}</p>}

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">
                                {loading ? 'This may take a moment. Saving...' : editAgent ? 'Save Changes' : 'Create Agent'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
