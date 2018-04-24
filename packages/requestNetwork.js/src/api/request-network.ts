import Web3PromiEvent = require('web3-core-promievent');
import RequestERC20Service from '../servicesContracts/requestERC20-service';
import RequestEthereumService from '../servicesContracts/requestEthereum-service';
import RequestCoreService from '../servicesCore/requestCore-service';
import Ipfs from '../servicesExternal/ipfs-service';
import { Web3Single } from '../servicesExternal/web3-single';
import * as Types from '../types';
import currencyUtils from '../utils/currency';
import Request from './request';
import SignedRequest from './signed-request';

/**
 * Class serving as entry-point into the requestNetwork.js library.
 * Create an instance to initialize the library and use it to create requests.
 *
 * @class RequestNetwork
 */
export default class RequestNetwork {
    /**
     * RequestCoreService instance to interact directly with the core of the library
     * Not the recommended way to interract with the library.
     *
     * @type {RequestCoreService}
     * @memberof RequestNetwork
     */
    public requestCoreService: RequestCoreService;

    /**
     * RequestERC20Service instance to interact directly with the ERC20 currency contract
     * Not the recommended way to interract with the library.
     *
     * @type {RequestERC20Service}
     * @memberof RequestNetwork
     */
    public requestERC20Service: RequestERC20Service;

    /**
     * RequestEthereumService instance to interact directly with the ethereum currency contract
     * Not the recommended way to interract with the library.
     *
     * @type {RequestEthereumService}
     * @memberof RequestNetwork
     */
    public requestEthereumService: RequestEthereumService;

    /**
     * Creates an instance of RequestNetwork.
     * Recommended usage: new RequestNetwork({ provider, networkId, useIpfsPublic})
     * Supported usage (for backward-compatibility): new RequestNetwork(provider, networkId, useIpfsPublic)
     *
     * @param {object=} options
     * @param {object=} options.provider - The Web3.js Provider instance you would like the requestNetwork.js library to use for interacting with the Ethereum network.
     * @param {number=} options.networkId - the Ethereum network ID.
     * @param {boolean=} options.useIpfsPublic - use public ipfs node if true, private one specified in “src/config.json ipfs.nodeUrlDefault.private” otherwise (default : true)
     * @memberof RequestNetwork
     */
    constructor(options?: { provider?: string, networkId?: number, useIpfsPublic?: boolean } | string, networkId?: number, useIpfsPublic?: boolean) {
        // Parameter handling
        let provider = options;
        if (typeof options === 'object') {
            provider = options.provider;
            networkId = options.networkId;
            useIpfsPublic = options.useIpfsPublic;
        }
        if (typeof useIpfsPublic === 'undefined') {
            useIpfsPublic = true;
        }
        if (provider && ! networkId) {
            throw new Error('if you give provider you have to give the networkId too');
        }

        // init web3 wrapper singleton
        Web3Single.init(provider, networkId);

        // init ipfs wrapper singleton
        Ipfs.init(useIpfsPublic);

        // Initialize the services
        // Let currencyUtils instanciate the currency services
        this.requestCoreService = new RequestCoreService();
        this.requestERC20Service = currencyUtils.serviceForCurrency(Types.Currency.REQ);
        this.requestEthereumService = currencyUtils.serviceForCurrency(Types.Currency.ETH);
    }

    /**
     * Async factory function to create a Request
     *
     * @param {Types.Role} as Who is creating the Request (Payer or Payee)
     * @param {Types.Currency} currency Currency of the Request (ETH, BTC, REQ, etc.)
     * @param {Types.IPayee[]} payees Array of payees
     * @param {Types.IPayer} payer The payer
     * @param {Types.IRequestCreationOptions} [requestOptions={}] Request creation options. Includes request data, extension and ethereum transaction options
     * @returns {PromiseEventEmitter<{request: Request, transaction: any}>} A promiEvent resolving to {request,transaction} and emitting the event 'broadcasted'
     * @memberof RequestNetwork
     */
    public createRequest(
        as: Types.Role,
        currency: Types.Currency,
        payees: Types.IPayee[],
        payer: Types.IPayer,
        requestOptions: Types.IRequestCreationOptions = {},
    ): PromiseEventEmitter<{request: Request, transaction: any}> {
        // new promiEvent to wrap the promiEvent returned by the services. It is necessary, in order to add the Request object in the resolution of the promise
        const promiEvent = Web3PromiEvent();
        let promise;

        // Create an ERC20 Request
        if (currencyUtils.isErc20(currency)) {
            const addressTestToken = currencyUtils.erc20TokenAddress(currency);
            const requestERC20: RequestERC20Service = currencyUtils.serviceForCurrency(currency);

            if (as === Types.Role.Payee) {
                // ERC20 Request as Payee
                promise = requestERC20.createRequestAsPayee(
                    addressTestToken,
                    payees.map(payee => payee.idAddress),
                    payees.map(payee => payee.expectedAmount),
                    payer.idAddress,
                    payees.map(payee => payee.paymentAddress),
                    payer.refundAddress,
                    requestOptions.data && JSON.stringify(requestOptions.data),
                    undefined, // _extension,
                    undefined, // _extensionParams,
                    requestOptions.transactionOptions,
                );
            }

            if (as === Types.Role.Payer) {
                // ERC20 Request as Payer
                promise = requestERC20.createRequestAsPayer(
                    addressTestToken,
                    payees.map(payee => payee.idAddress),
                    payees.map(payee => payee.expectedAmount),
                    payer.refundAddress,
                    payees.map(payee => payee.amountToPayAtCreation),
                    payees.map(payee => payee.additional),
                    requestOptions.data && JSON.stringify(requestOptions.data),
                    undefined, // _extension
                    undefined, // _extensionParams
                    Object.assign({}, requestOptions.transactionOptions, { from: payer.idAddress }),
                );
            }
        }

        // Create an ETH Request
        if (currency === Types.Currency.ETH) {
            const requestEthereumService: RequestEthereumService = currencyUtils.serviceForCurrency(currency);
            if (as === Types.Role.Payee) {
                // Create an ETH Request as Payee
                promise = requestEthereumService.createRequestAsPayee(
                    payees.map(payee => payee.idAddress),
                    payees.map(payee => payee.expectedAmount),
                    payer.idAddress,
                    payees.map(payee => payee.paymentAddress),
                    payer.refundAddress,
                    requestOptions.data && JSON.stringify(requestOptions.data),
                    undefined, // _extension,
                    undefined, // _extensionParams,
                    requestOptions.transactionOptions,
                );
            }

            if (as === Types.Role.Payer) {
                // Create an ETH Request as Payer
                promise = requestEthereumService.createRequestAsPayer(
                    payees.map(payee => payee.idAddress),
                    payees.map(payee => payee.expectedAmount),
                    payer.refundAddress,
                    payees.map(payee => payee.amountToPayAtCreation),
                    payees.map(payee => payee.additional),
                    requestOptions.data && JSON.stringify(requestOptions.data),
                    undefined, // _extension
                    undefined, // _extensionParams
                    Object.assign({}, requestOptions.transactionOptions, { from: payer.idAddress }),
                );
            }
        }

        if (!promise) {
            throw new Error('Currency not implemented');
        }

        // Add the Request in the resolution of the promise
        promise.then(({ request, transaction }: { request: Types.IRequestData, transaction: { hash: string } }) => {
            return promiEvent.resolve({
                // pass requestCoreService as a hack until the services are singletons
                request: new Request(request.requestId, currency, this.requestCoreService),
                transaction,
            });
        });

        promise.on('broadcasted', (param: any) => promiEvent.eventEmitter.emit('broadcasted', param));

        return promiEvent.eventEmitter;
    }

    /**
     * Create a Request instance from an existing Request's ID
     *
     * @param {string} requestId The ID of the Request
     * @returns {Request} The Request
     * @memberof RequestNetwork
     */
    public async fromRequestId(requestId: string): Promise<Request> {
        const requestData = await this.requestCoreService.getRequest(requestId);
        const currency: Types.Currency = currencyUtils.currencyFromContractAddress(requestData.currencyContract.address);
        return new Request(requestId, currency, this.requestCoreService);
    }

    /**
     * Create a signed Request. Refer to the SignedRequest class for the details.
     *
     * @param {Types.Role} as Who is creating the Request (only Payee is implemented for now)
     * @param {Types.Currency} currency Currency of the Request (ETH, BTC, REQ, etc.)
     * @param {Types.IPayee[]} payees Array of payees
     * @param {number} expirationDate Timestamp in second of the date after which the signed request is not broadcastable
     * @param {Types.IRequestCreationOptions} [requestOptions={}] Request creation options. Includes request data, extension and ethereum transaction options
     * @returns {Promise<SignedRequest>} Promise resolving to an instance of SignedRequest
     * @memberof RequestNetwork
     */
    public async createSignedRequest(
        as: Types.Role,
        currency: Types.Currency,
        payees: Types.IPayee[],
        expirationDate: number,
        requestOptions: Types.IRequestCreationOptions = {},
    ): Promise<SignedRequest> {
        if (as !== Types.Role.Payee) {
            throw new Error('Role not implemented');
        }

        let signedRequestData = null;

        if (currencyUtils.isErc20(currency)) {
            const addressTestToken = currencyUtils.erc20TokenAddress(currency);
            const requestERC20: RequestERC20Service = currencyUtils.serviceForCurrency(currency);
            // Create an ERC20 Signed Request as Payer
            signedRequestData = await requestERC20.signRequestAsPayee(
                addressTestToken,
                payees.map(payee => payee.idAddress),
                payees.map(payee => payee.expectedAmount),
                expirationDate,
                payees.map(payee => payee.paymentAddress),
                requestOptions.data && JSON.stringify(requestOptions.data),
                undefined, // _extension,
                undefined, // _extensionParams,
                requestOptions.transactionOptions && requestOptions.transactionOptions.from,
            );
        }
        if (currency === Types.Currency.ETH) {
            const requestEthereumService = currencyUtils.serviceForCurrency(currency);

            // Create an ETH Signed Request as Payer
            signedRequestData = await requestEthereumService.signRequestAsPayee(
                payees.map(payee => payee.idAddress),
                payees.map(payee => payee.expectedAmount),
                expirationDate,
                payees.map(payee => payee.paymentAddress),
                requestOptions.data && JSON.stringify(requestOptions.data),
                undefined, // _extension,
                undefined, // _extensionParams,
                requestOptions.transactionOptions && requestOptions.transactionOptions.from,
            );
        }

        return new SignedRequest(signedRequestData);
    }

    /**
     * Broadcast a Signed Request
     *
     * @param {SignedRequest} signedRequest The previously created Signed Request
     * @param {Types.IPayer} payer The Payer broadcasting the Signed Request
     * @param {Types.Amount[]} [amountsToPayAtCreation=[]] Amounts to pays when creating the broadcasting the Request
     * @param {Types.Amount[]} [additionals=[]] Optionnal additionals to add
     * @param {Types.IRequestCreationOptions} [requestOptions={}] Request creation options. Includes request data, extension and ethereum transaction options
     * @returns {PromiseEventEmitter<{request: Request, transaction: any}>} A promiEvent resolving to {request,transaction} and emitting the event 'broadcasted'
     * @memberof RequestNetwork
     */
    public broadcastSignedRequest(
        signedRequest: SignedRequest,
        payer: Types.IPayer,
        amountsToPayAtCreation: Types.Amount[] = [],
        additionals: Types.Amount[] = [],
        requestOptions: Types.IRequestCreationOptions = {},
    ): PromiseEventEmitter<{request: Request, transaction: any}> {
        if (payer.refundAddress && payer.idAddress !== payer.refundAddress) {
            throw new Error('Different idAddress and paymentAddress for Payer of signed request not yet supported');
        }

        const currency: Types.Currency = currencyUtils.currencyFromContractAddress(
            signedRequest.signedRequestData.currencyContract,
        );

        // new promiEvent to wrap the promiEvent returned by the service. It is necessary, in order to add the Request object in the resolution of the promise
        const promiEvent = Web3PromiEvent();
        const service = currencyUtils.serviceForCurrency(currency);
        const promise = service.broadcastSignedRequestAsPayer(
            signedRequest.signedRequestData,
            amountsToPayAtCreation,
            additionals,
            Object.assign({ from: payer.idAddress }, requestOptions.transactionOptions),
        );

        promise.then(({ request, transaction }: { request: Types.IRequestData, transaction: { hash: string } }) => {
            return promiEvent.resolve({
                request: new Request(request.requestId, currency, this.requestCoreService),
                transaction,
            });
        });

        promise.on('broadcasted', (param: any) => promiEvent.eventEmitter.emit('broadcasted', param));

        return promiEvent.eventEmitter;
    }
}
