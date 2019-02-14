# @requestnetwork/request-client.js

`@requestnetwork/request-client.js` is a typescript library part of the [Request Network protocol](https://github.com/RequestNetwork/requestNetwork).
This package allows you to interact with the Request blockchain through [Request nodes](https://github.com/RequestNetwork/requestNetwork/tree/master/packages/request-node). This client side library uses Request nodes as servers, connected in HTTP. See the Request node documentation for more details on their API.
It ships both as a commonjs and a UMD module. This means you can use it in node application and in web pages.

## Installation

```bash
npm install @requestnetwork/request-client.js
```

## Usage

### Usage as commonjs module

```javascript
import * as RequestNetwork from '@requestnetwork/request-client.js';
import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';
// payee information
const payeeSignatureInfo = {
  method: RequestNetwork.Types.Signature.REQUEST_SIGNATURE_METHOD.ECDSA,
  privateKey: '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
};
const payeeIdentity = {
  type: RequestNetwork.Types.Identity.REQUEST_IDENTITY_TYPE.ETHEREUM_ADDRESS,
  value: '0x627306090abab3a6e1400e9345bc60c78a8bef57',
};

// Signature providers
const signatureProvider = new EthereumPrivateKeySignatureProvider(payeeSignatureInfo);

const requestInfo: RequestNetwork.Types.RequestLogic.IRequestLogicCreateParameters = {
  currency: RequestNetwork.Types.RequestLogic.REQUEST_LOGIC_CURRENCY.BTC,
  expectedAmount: '100000000000',
  payee: payeeIdentity,
  payer: {
    type: RequestNetwork.Types.Identity.REQUEST_IDENTITY_TYPE.ETHEREUM_ADDRESS,
    value: '0x740fc87Bd3f41d07d23A01DEc90623eBC5fed9D6',
  },
};

const topics = [
  '0x627306090abab3a6e1400e9345bc60c78a8bef57',
  '0x740fc87Bd3f41d07d23A01DEc90623eBC5fed9D6',
];

const paymentNetwork: RequestNetwork.Types.IPaymentNetworkCreateParameters = {
  id: RequestNetwork.Types.PAYMENT_NETWORK_ID.BITCOIN_ADDRESS_BASED,
  parameters: {
    paymentAddress: 'mgPKDuVmuS9oeE2D9VPiCQriyU14wxWS1v',
  },
};

(async (): Promise<void> => {
  const requestNetwork = new RequestNetwork.RequestNetwork({
    signatureProvider,
  });

  const request = await requestNetwork.createRequest({
    paymentNetwork,
    requestInfo,
    signer: payeeIdentity,
    topics,
  });

  console.log(request);
})();
```

### Usage as UMD module

A global `RequestNetwork` is exposed:

```html
<script src="requestnetwork.min.js"></script>

<script>
  const requestNetwork = new RequestNetwork.RequestNetwork();

  const request = await requestNetwork.createRequest({
    requestInfo,
    signer,
    paymentNetwork,
    topics,
  });
</script>
```

A full example is available in `packages\request-client.js\test\index.html`

### Configure which Request node to use

```javascript
const requestNetwork = new RequestNetwork({
  nodeConnectionConfig: { baseURL: 'http://super-request-node.com/api' },
});
```

It can be further configured with option from [Axios](https://github.com/axios/axios#request-config).

By default, it uses a local node, on http://localhost:3000.

### Use in development, without a node

When the option `useMockStorage` is `true`, the library will use a mock storage in memory instead of a Request node. It is meant to simplify local development and should never be used in production.
Nothing will be persisted on the Ethereum blockchain and IPFS, it will all stay in memory until your program stops.

```javascript
const requestNetwork = new RequestNetwork({ useMockStorage: true });
```

## Guide

We are currently writing the full API reference and more detailed guides. This section will be updated. If you need help in the meantime, [join the Request Hub Slack](https://request-slack.herokuapp.com/) and come chat with us.

### Create a request

```javascript
const request = await requestNetwork.createRequest({
  requestInfo,
  signer,
  paymentNetwork,
  topics,
});
```

`requestInfo`: [RequestLogicTypes.IRequestLogicCreateParameters](https://github.com/RequestNetwork/requestNetwork/blob/master/packages/types/src/request-logic-types.ts#L119)
`signatureInfo`: [SignatureTypes.ISignatureParameters](https://github.com/RequestNetwork/requestNetwork/blob/master/packages/types/src/signature-types.ts#L2)
`topics`: string[]
`paymentNetwork`: IPaymentNetworkCreateParameters

### Get a request from its ID

```javascript
const requestFromId = requestNetwork.fromRequestId(requestId);
```

`requestId`: string

### Accept a request

```javascript
await request.accept(signatureInfo);
```

`signatureInfo`: [SignatureTypes.ISignatureParameters](https://github.com/RequestNetwork/requestNetwork/blob/master/packages/types/src/signature-types.ts#L2)

### Cancel a request

```javascript
await request.cancel(signatureInfo);
```

`signatureInfo`: [SignatureTypes.ISignatureParameters](https://github.com/RequestNetwork/requestNetwork/blob/master/packages/types/src/signature-types.ts#L2)

### Increase the expected amount of a request

```javascript
await request.increaseExpectedAmountRequest(amount, signatureInfo);
```

`signatureInfo`: [SignatureTypes.ISignatureParameters](https://github.com/RequestNetwork/requestNetwork/blob/master/packages/types/src/signature-types.ts#L2)
`amount`: string

### Reduce the expected amount of a request

```javascript
await request.reduceExpectedAmountRequest(amount, signatureInfo);
```

`signatureInfo`: [SignatureTypes.ISignatureParameters](https://github.com/RequestNetwork/requestNetwork/blob/master/packages/types/src/signature-types.ts#L2)
`amount`: string

### Get a request data

```javascript
const requestData = await request.getData();
/*
{ 
  requestId,
  currency,
  expectedAmount,
  payee,
  payer,
  timestamp,
  extensions,
  version,
  events,
  state,
  creator,
  meta,
  balance,
  contentData,
}
*/
```

`result.request`: [IRequestLogicRequest](https://github.com/RequestNetwork/requestNetwork/blob/master/packages/types/src/request-logic-types.ts#L70)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
[Read the contributing guide](https://github.com/RequestNetwork/requestNetwork/blob/master/CONTRIBUTING.md)

## License

[MIT](https://github.com/RequestNetwork/requestNetwork/blob/master/LICENSE)