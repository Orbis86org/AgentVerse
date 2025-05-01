import React, { useEffect, useState } from 'react';
import { pageTitle } from '../../helpers/PageTitle';
import SectionHeadingStyle3 from '../SectionHeading/SectionHeadingStyle3';
import Spacing from '../Spacing';
import { useWallet } from '../../contexts/WalletContext';
import { ToastContainer, toast, Bounce } from 'react-toastify';

export default function MyAccountPage() {
    pageTitle('Profile');
    const { dappAccountId } = useWallet();

    const [activeTab, setActiveTab] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [creditHistory, setCreditHistory] = useState([]);
    const [filter, setFilter] = useState('all');

    const filteredCreditHistory = creditHistory.filter((item) => {
        if (filter === 'all') return true;
        return item.type === filter;
    });

    const exportCsv = () => {
        const headers = ['Credits', 'Type', 'Network', 'Agent', 'Transaction Hash', 'Date'];
        const rows = filteredCreditHistory.map((item) => [
            item.credits,
            item.type,
            item.network,
            item.agent?.name || '-',
            item.txHash || '-',
            new Date(item.createdAt).toLocaleString(),
        ]);

        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += headers.join(',') + '\n';
        rows.forEach((row) => {
            csvContent += row.join(',') + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'credits-history.csv');
        document.body.appendChild(link);
        link.click();
    };


    useEffect(() => {
        if (!dappAccountId) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile/${dappAccountId}`);
                if (res.status === 404) {
                    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ walletAddress: dappAccountId, name: '', email: '' }),
                    });
                } else {
                    const data = await res.json();
                    setFormData({ name: data.name || '', email: data.email || '' });
                }

                const creditsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/credits/history/${dappAccountId}`);
                const creditData = await creditsRes.json();
                setCreditHistory(creditData);
            } catch (err) {
                console.error('Error loading profile or credit history:', err);
            }
        };

        fetchData();
    }, [dappAccountId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dappAccountId) return;

        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile/${dappAccountId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        toast.success('Profile Updated.', {
            position: 'top-right',
            autoClose: 5000,
            theme: 'dark',
            transition: Bounce,
        });
    };

    const calculateTotal = (type) => {
        return creditHistory
            .filter(item => item.type === type)
            .reduce((acc, curr) => acc + parseFloat(curr.credits), 0);
    };

    const calculateNetBalance = () => {
        return calculateTotal('purchase') + calculateTotal('revenue_share') + calculateTotal('usage'); // usage is already negative
    };


    return (
        <>
            <Spacing lg="120" md="80" />
            <SectionHeadingStyle3 title="My Account" variant="text-center" />
            <Spacing lg="50" md="30" />

            <div className="container">
                <div className="cs_tabs cs_style1">
                    <ul className="cs_tab_links cs_product_tab cs_primary_font cs_semi_bold">
                        <li className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
                            <button type="button">Manage Profile</button>
                        </li>
                        <li className={`tab-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
                            <button type="button">Credits History</button>
                        </li>
                    </ul>
                    <Spacing lg="40" md="30" />
                    <div className="cs_tab_body">
                        {activeTab === 1 && (
                            <form onSubmit={handleSubmit}>
                                <h3 className="cs_checkout-title">Profile Details</h3>
                                <Spacing lg="30" md="20" />
                                <div className="row">
                                    <div className="col-lg-6">
                                        <label className="cs_shop-label">Name</label>
                                        <input
                                            type="text"
                                            className="cs_shop-input"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-lg-6">
                                        <label className="cs_shop-label">Email</label>
                                        <input
                                            type="email"
                                            className="cs_shop-input"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <Spacing lg="30" md="30" />
                                <button className="cs_btn cs_style_1" type="submit">Save Profile</button>
                            </form>
                        )}

                        {activeTab === 2 && (
                            <div className="cs_credit_history">
                                <h3 className="cs_checkout-title">Credits History</h3>
                                <Spacing lg="20" md="10" />

                                {/* 🔥 Filters */}
                                <div className="mb-4">
                                    <button
                                        className="btn btn-sm btn-outline-light me-2"
                                        onClick={() => setFilter('all')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-success me-2"
                                        onClick={() => setFilter('purchase')}
                                    >
                                        Purchases
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-info me-2"
                                        onClick={() => setFilter('revenue_share')}
                                    >
                                        Revenue Share
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-warning"
                                        onClick={() => setFilter('usage')}
                                    >
                                        Usages
                                    </button>

                                    <button
                                        className="btn btn-sm btn-outline-info float-end"
                                        onClick={exportCsv}
                                    >
                                        Export CSV
                                    </button>
                                </div>

                                {filteredCreditHistory.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-dark table-striped table-bordered">
                                            <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Credits</th>
                                                <th>Type</th>
                                                <th>Network</th>
                                                <th>Agent</th>
                                                <th>Transaction Hash</th>
                                                <th>Date</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredCreditHistory.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>

                                                    {/* Credits (positive = green) */}
                                                    <td style={{ color: item.credits > 0 ? 'limegreen' : 'red' }}>
                                                        {item.credits > 0 ? `+${item.credits}` : item.credits}
                                                    </td>

                                                    {/* Type badge */}
                                                    <td>
                                                        {item.type === 'purchase' ? (
                                                            <span className="badge bg-success">Purchase</span>
                                                        ) : item.type === 'revenue_share' ? (
                                                            <span className="badge bg-info text-dark">Revenue Share</span>
                                                        ) : (
                                                            <span className="badge bg-warning text-dark">Usage</span>
                                                        )}
                                                    </td>

                                                    <td>{item.network}</td>
                                                    <td>{item.agent?.name || '-'}</td>
                                                    <td className="text-break">{item.txHash || '-'}</td>
                                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <div className="mt-4">
                                            <h5 className="text-light">
                                                Summary:
                                            </h5>
                                            <ul className="list-unstyled">
                                                <li>
                                                    <strong>Total Purchased:</strong>{' '}
                                                    <span className="badge bg-success">
                                                        +{calculateTotal('purchase')}
                                                    </span>{' '}
                                                    credits
                                                </li>
                                                <li>
                                                    <strong>Revenue Share:</strong>{' '}
                                                    <span className="badge bg-info text-dark">
                                                        +{calculateTotal('revenue_share')}
                                                    </span>{' '}
                                                    credits
                                                </li>
                                                <li>
                                                    <strong>Total Used:</strong>{' '}
                                                    <span className="badge bg-warning text-dark">
                                                        {calculateTotal('usage')}
                                                    </span>{' '}
                                                    credits
                                                </li>
                                                <li>
                                                    <strong>Net Balance:</strong>{' '}
                                                    <span style={{color: 'deepskyblue'}}>
                                                        {calculateNetBalance()} credits
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>


                                    </div>
                                ) : (
                                    <p>No credit transactions found.</p>
                                )}
                            </div>
                        )}


                    </div>
                </div>
            </div>

            <ToastContainer/>
            <Spacing lg="120" md="50"/>
        </>
    );
}
