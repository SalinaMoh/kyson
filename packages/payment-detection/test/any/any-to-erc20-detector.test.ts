// import { ethers } from 'ethers';
import {
  AdvancedLogicTypes,
  ExtensionTypes,
  // ExtensionTypes,
  // IdentityTypes,
  PaymentTypes,
  RequestLogicTypes,
} from '@requestnetwork/types';
import { CurrencyManager } from '@requestnetwork/currency';
// import { ERC20__factory } from '@requestnetwork/smart-contracts/types';
import AnyToErc20Proxy from '../../src/any/any-to-erc20-proxy-detector';

let anyToErc20Proxy: AnyToErc20Proxy;
const currencyManager = CurrencyManager.getDefault();
const mockAdvancedLogic: AdvancedLogicTypes.IAdvancedLogic = {
  applyActionToExtensions(): any {
    return;
  },
  extensions: {
  },
};

/* eslint-disable @typescript-eslint/no-unused-expressions */
describe('api/any/conversion-fee-proxy-contract', () => {
  beforeEach(() => {
    anyToErc20Proxy = new AnyToErc20Proxy({ advancedLogic: mockAdvancedLogic, currencyManager });
  });

  it('should not throw when getBalance fail', async () => {
    expect(
      await anyToErc20Proxy.getBalance({ extensions: {} } as RequestLogicTypes.IRequest),
    ).toEqual({
      balance: null,
      error: {
        code: PaymentTypes.BALANCE_ERROR_CODE.WRONG_EXTENSION,
        message: 'The request does not have the extension : pn-any-to-erc20-proxy',
      },
      events: [],
    });
  });
/* TODO TODO TODO
  it('can get the fees out of payment events', async () => {
    const mockRequest: RequestLogicTypes.IRequest = {
      creator: { type: IdentityTypes.TYPE.ETHEREUM_ADDRESS, value: '0x2' },
      currency: {
        type: RequestLogicTypes.CURRENCY.ISO4217,
        value: 'EUR',
      },
      events: [],
      expectedAmount: '1000',
      extensions: {
        [ExtensionTypes.ID.PAYMENT_NETWORK_ANY_TO_ERC20_PROXY]: {
          events: [],
          id: ExtensionTypes.ID.PAYMENT_NETWORK_ANY_TO_ERC20_PROXY,
          type: ExtensionTypes.TYPE.PAYMENT_NETWORK,
          values: {
            feeAddress: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
            feeAmount: '5',
            paymentAddress: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
            refundAddress: '0x666666151EbEF6C7334FAD080c5704D77216b732',
            acceptedTokens: ['0x9FBDa871d559710256a2502A2517b794B482Db40'],
            network: 'rinkeby',
          },
          version: '0',
        },
      },
      extensionsData: [],
      requestId: '0x1',
      state: RequestLogicTypes.STATE.CREATED,
      timestamp: 0,
      version: '0.2',
    };

    const mockExtractBalanceAndEvents = (
      _request: RequestLogicTypes.IRequest,
      _salt: string,
      _toAddress: string,
      eventName: PaymentTypes.EVENTS_NAMES,
    ) => {
      if (eventName === PaymentTypes.EVENTS_NAMES.PAYMENT) {
        return Promise.resolve({
          balance: '1000',
          events: [
            // Wrong fee address
            {
              amount: '100',
              name: PaymentTypes.EVENTS_NAMES.PAYMENT,
              parameters: {
                block: 1,
                feeAddress: 'fee address',
                feeAmount: '5',
                to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABC',
              },
              timestamp: 10,
            },
            // Correct fee address and a fee value
            {
              amount: '500',
              name: PaymentTypes.EVENTS_NAMES.PAYMENT,
              parameters: {
                block: 1,
                feeAddress: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
                feeAmount: '5',
                to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABCD',
              },
              timestamp: 11,
            },
            // No fee
            {
              amount: '500',
              name: PaymentTypes.EVENTS_NAMES.PAYMENT,
              parameters: {
                block: 1,
                feeAddress: '',
                feeAmount: '0',
                to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABCDE',
              },
              timestamp: 12,
            },
            // Payment token not accepted
            {
              amount: '500',
              name: PaymentTypes.EVENTS_NAMES.PAYMENT,
              parameters: {
                block: 1,
                feeAddress: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
                feeAmount: '5',
                to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                txHash: '0xABCD',
                //tokenAddress: ['ethereum address2'],
              },
              timestamp: 11,
            },
          ],
        });
      }
      //if (eventName === PaymentTypes.EVENTS_NAMES.REFUND) {
      return Promise.resolve({
        balance: '200',
        events: [
          // Wrong fee address
          {
            amount: '1000',
            name: PaymentTypes.EVENTS_NAMES.REFUND,
            parameters: {
              block: 1,
              feeAddress: 'fee address',
              feeAmount: '5',
              to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
              txHash: '0xABC',
            },
            timestamp: 10,
          },
          // Correct fee address and a fee value
          {
            amount: '100',
            name: PaymentTypes.EVENTS_NAMES.REFUND,
            parameters: {
              block: 1,
              feeAddress: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
              feeAmount: '5',
              to: '0x666666151EbEF6C7334FAD080c5704D77216b732',
              txHash: '0xABCD',
            },
            timestamp: 11,
          },
          // No fee
          {
            amount: '100',
            name: PaymentTypes.EVENTS_NAMES.REFUND,
            parameters: {
              block: 1,
              feeAddress: '',
              feeAmount: '0',
              to: '0x666666151EbEF6C7334FAD080c5704D77216b732',
              txHash: '0xABCDE',
            },
            timestamp: 12,
          },
        ],
      });
      //}
    };
    anyToErc20Proxy = new AnyToErc20Proxy({ advancedLogic: mockAdvancedLogic, currencyManager });
    anyToErc20Proxy.extractBalanceAndEvents = mockExtractBalanceAndEvents;

    const balance = await anyToErc20Proxy.getBalance(mockRequest);
    expect(balance.balance).toBe('800');
    expect(
      mockRequest.extensions[ExtensionTypes.ID.PAYMENT_NETWORK_ANY_TO_ERC20_PROXY].values.feeBalance
        .balance,
    ).toBe('15');
  });
  it('can retrieve the decimals from a contract if unknown', async () => {
    const anyToErc20Proxy = new AnyToErc20Proxy({
      advancedLogic: mockAdvancedLogic,
      currencyManager,
    }) as any;

    const spy = jest.spyOn(ERC20__factory, 'connect').mockImplementation(() => {
      return {
        decimals: () => Promise.resolve(42),
        symbol: () => Promise.resolve('FAKE'),
      } as any;
    });

    expect(
      await anyToErc20Proxy.getCurrency({
        type: 'ERC20',
        network: 'mainnet',
        value: ethers.constants.AddressZero,
      }),
    ).toMatchObject({
      decimals: 42,
      symbol: 'FAKE',
    });

    expect(spy).toHaveBeenCalledWith(ethers.constants.AddressZero, expect.anything());
  });
*/
});