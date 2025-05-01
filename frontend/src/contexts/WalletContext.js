// src/contexts/WalletContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    DAppConnector,
    HederaJsonRpcMethod,
    HederaSessionEvent,
    HederaChainId
} from '@hashgraph/hedera-wallet-connect';
import {Hbar, HbarUnit, LedgerId, TransferTransaction} from '@hashgraph/sdk';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
    const [dappAccountId, setDappAccountId] = useState(null);
    const [dAppConnector, setDAppConnector] = useState(null);
    const [remainingCreditsBalance, setRemainingCreditsBalance] = useState(0);

    useEffect(() => {
        const getAccountId = async () => {
            const localStorageAccountId = localStorage.getItem('hederaAccountId');
            if (localStorageAccountId && getSigner() ) {
                await createUser( localStorageAccountId );

                setDappAccountId(localStorageAccountId);
            } else {
                disconnectWallet().then(r => {});
            }
        }

        const initConnector = async () => {
            const connector = new DAppConnector(
                {
                    name: process.env.REACT_APP_PLATFORM_NAME || 'AI Marketplace',
                    description: '',
                    url: 'https://localhost',
                    icons: ['https://avatars.githubusercontent.com/u/37784886'],
                },
                LedgerId.TESTNET,
                process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
                Object.values(HederaJsonRpcMethod),
                [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
                [HederaChainId.Mainnet]
            );

            await connector.init({ logger: 'error' });
            setDAppConnector(connector);
        };

        getAccountId();
        initConnector();
    }, []);

    const connectWallet = async () => {
        if (!dAppConnector) return null;
        const session = await dAppConnector.openModal();

        const sessionAccount = session.namespaces?.hedera?.accounts?.[0];
        const sessionParts = sessionAccount?.split(':');
        const accountId = sessionParts?.pop();
        const network = sessionParts?.pop();
        if (!accountId) return;

        localStorage.setItem('hederaAccountId', accountId);
        localStorage.setItem('hederaNetwork', network);
        setDappAccountId(accountId);

        window.location.reload();
    };

    const createUser = async ( accountId ) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile/${accountId}`);
            if (res.status === 404) {
                // User not found — create new
                await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress: accountId,
                        name: '',
                        email: '',
                    }),
                });
            }
        } catch (error) {
            console.error('Error checking/creating user profile:', error);
        }
    }

    const disconnectWallet = async () => {
        if (!dAppConnector) return null;

        localStorage.removeItem('hederaAccountId')
        setDAppConnector( null );
        setDappAccountId(null);

        window.location.reload();
    }


    const getSigner = async() => {
        if (! dAppConnector || ! dAppConnector.signers || dAppConnector.signers.length === 0) {
            return null;
        }

        return dAppConnector.signers[0];
    }

    const transferHbar = async ( amount: number, ) => {
        if ( ! dappAccountId ) return false;

        const transferHBARTransaction = new TransferTransaction()
            // .setNodeAccountIds(  [ new AccountId(3) ] )
            .addHbarTransfer( dappAccountId, new Hbar(-amount, HbarUnit.Hbar)) // Sender
            .addHbarTransfer( process.env.REACT_APP_HEDERA_ACCOUNT_ID, new Hbar(amount, HbarUnit.Hbar)); // Receiver

        const signer = await getSigner();

        try {
            // Freeze and sign
            await transferHBARTransaction.freezeWithSigner(signer);

            // Execute transaction
            const txResult = await transferHBARTransaction.executeWithSigner(signer);

            return txResult ? txResult.transactionId : null;
        } catch (error) {
            console.error("Error executing transaction:", error);
            return null;
        }

    }

    const remainingCredits = async () => {
        if (!dappAccountId) return 0; // No wallet connected

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile/${dappAccountId}`);
            if (!response.ok) {
                console.error('Failed to fetch credits:', await response.text());
                return 0;
            }

            const user = await response.json();
            return user.credits || 0;
        } catch (error) {
            console.error('Error fetching remaining credits:', error);
            return 0;
        }
    };


    return (
        <WalletContext.Provider value={{ dappAccountId, setDappAccountId, connectWallet, disconnectWallet, transferHbar,  remainingCreditsBalance, setRemainingCreditsBalance, remainingCredits }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
