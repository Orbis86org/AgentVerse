import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import {AccountBalanceQuery, Client} from '@hashgraph/sdk';
import { HCS10Client } from '../../hcs10/HCS10Client'; // reuse existing client
import { Logger } from '@hashgraphonline/standards-sdk';

export class HbarBalanceTool extends StructuredTool {
    name = 'check_hbar_balance';
    description = 'Checks the HBAR balance of a given Hedera account ID.';
    private client: HCS10Client;
    private logger: Logger;

    constructor(client: HCS10Client) {
        super();
        this.client = client;
        this.logger = Logger.getInstance({ module: 'HbarBalanceTool' });
    }

    schema = z.object({
        accountId: z.string().describe('The Hedera account ID to check balance for'),
    });

    async _call(input: { accountId: string }): Promise<string> {
        try {
            const query = new AccountBalanceQuery().setAccountId(input.accountId);

            /**
             * Setup Client
             */
            const operatorPrivateKey = process.env.HEDERA_OPERATOR_KEY;
            const client = Client.forName( this.client.getNetwork() );
            client.setOperator( this.client.getOperatorId(), operatorPrivateKey );

            const result = await query.execute( client );

            const balanceHBAR = result.hbars.toString();
            this.logger.info(`Balance for ${input.accountId} is ${balanceHBAR}`);
            return `The HBAR balance of ${input.accountId} is ${balanceHBAR}`;
        } catch (err) {
            this.logger.error(`Error fetching balance: ${err}`);
            return `Failed to fetch balance: ${err instanceof Error ? err.message : err}`;
        }
    }
}
