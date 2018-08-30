'use strict';

//  ---------------------------------------------------------------------------

const bitfinex = require ('./bitfinex.js');

const {ZeroEx} = require('0x.js')
//  ---------------------------------------------------------------------------

module.exports = class ethfinex extends bitfinex {
  describe () {
    return this.deepExtend (super.describe (), {
        'id': 'ethfinex',
        'name': 'Ethfinex',
        'countries': [ 'VG' ],
        'version': 'v1',
        'rateLimit': 1500,
        // new metainfo interface
        'certified': false,
        'has': {
            'CORS': false,
            'createDepositAddress': true,
            'deposit': true,
            'fetchClosedOrders': true,
            'fetchDepositAddress': true,
            'fetchFees': true,
            'fetchFundingFees': true,
            'fetchMyTrades': true,
            'fetchOHLCV': true,
            'fetchOpenOrders': true,
            'fetchOrder': true,
            'fetchTickers': true,
            'fetchTradingFees': true,
            'withdraw': true,
        },
        'timeframes': {
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '30m': '30m',
            '1h': '1h',
            '3h': '3h',
            '6h': '6h',
            '12h': '12h',
            '1d': '1D',
            '1w': '7D',
            '2w': '14D',
            '1M': '1M',
        },
        'urls': {
            'logo': 'https://user-images.githubusercontent.com/1294454/37555526-7018a77c-29f9-11e8-8835-8e415c038a18.jpg',
            'api': {
                'bitfinex-v2': 'https://api.bitfinex.com/v2',
                'ethfinex-v1': 'https://test.ethfinex.com/trustless/v1',
            },
            'www': 'https://www.ethfinex.com',
            'doc': [
                'https://bitfinex.readme.io/v1/docs',
                'https://github.com/bitfinexcom/bitfinex-api-node',
                'https://www.ethfinex.com/api_docs',
            ],
        },
    });
  };

  async getCurrencies() {

    // NOTE: in the future this must come from the HTTP API
    return {
      // ropsten network
      ETH: {
        decimals: 18,
        tokenAddress: '0x0',
        lockerAddress: '0x965808e7f815cfffd4c018ef2ba4c5a65eba087e'
      },
      USD: {
        decimals: 6,
        tokenAddress: '0x0736d0c130b2ead47476cc262dbed90d7c4eeabd',
        lockerAddress: '0x83e42e6d1ac009285376340ef64bac1c7d106c89'
      },
      ZRX: {
        decimals: 18,
        tokenAddress: '0xa8e9fa8f91e5ae138c74648c9c304f1c75003a8d',
        lockerAddress: '0x39d738870db939dce5184557ce286589e62c983e'
      }
    }
  }

  async createOrder (symbol, type, side, amount, price = undefined, params = {}) {

    // ~~~~~~~~~~~~~~~ CREATING AN ORDER

    type = 'EXCHANGE LIMIT'

    validFor = params.validFor

    // TODO: fix this, i bet this isn't exactly how it's supposed to be?
    side = amount < 0 ? 'sell' : buy

    const web3 // TODO: must come fro ccxt, we are using "web3": "^1.0.0-beta.34"
    const config = {
      defaultExpiry: 60,
      ethfinexAddress: '0x',
      exchangeContractAddress: '0x'
    }// TODO: must come from ccxt

    const currencies = await this.getCurrencies()

    // symbols are always 3 letters
    const symbolOne = symbol.substr(0, symbol.length - 3)
    const symbolTwo = symbol.substr(-3)

    const buySymbol = amount > 0 ? symbolOne : symbolTwo
    const sellSymbol = amount > 0 ? symbolTwo : symbolOne

    const sellCurrency = currencies[sellSymbol]
    const buyCurrency = currencies[buySymbol]

    let buyAmount, sellAmount

    if (amount > 0) {
      buyAmount = amount
      sellAmount = amount * price

      // console.log( "Buying " + amount + ' ' + buySymbol + " for: " + price + ' ' + sellSymbol )
    }

    if (amount < 0) {
      buyAmount = Math.abs(amount * price)
      sellAmount = Math.abs(amount)

      // console.log( "Selling " + Math.abs(amount) + ' ' + sellSymbol + " for: " + price + ' ' + buySymbol )
    }

    // console.log( "   buy amount: " + buyAmount + " " + buySymbol )
    // console.log( "  sell amount: " + sellAmount + " " + sellSymbol )

    let expiration
    expiration = Math.round((new Date()).getTime() / 1000)
    expiration += validFor || config.defaultExpiry

    // create order object
    const order = {
      expirationUnixTimestampSec: web3.utils.toBN(expiration).toString(10),
      feeRecipient: config.ethfinexAddress.toLowerCase(),

      maker: efx.get('account').toLowerCase(),
      makerFee: web3.utils.toBN('0'),
      makerTokenAddress: sellCurrency.lockerAddress.toLowerCase(),
      makerTokenAmount: web3.utils.toBN(
        Math.trunc(10 ** sellCurrency.decimals * sellAmount)
      ).toString(10),

      salt: ZeroEx.generatePseudoRandomSalt(),
      taker: config.ethfinexAddress.toLowerCase(),
      takerFee: web3.utils.toBN('0'),
      takerTokenAddress: buyCurrency.lockerAddress.toLowerCase(),
      takerTokenAmount: web3.utils.toBN(
        Math.trunc(10 ** buyCurrency.decimals * buyAmount)
      ).toString(10),

      exchangeContractAddress: config.exchangeContractAddress.toLowerCase()
    }

    // ~~~~~~~~~~~~~~~~ SUBMITTING AN ORDER

    // TODO: actually sign the order, must sign using ccxt sign command
    const signedOrder = await this.web3Sign(order)

    const meta = signedOrder

    const protocol = '0x'

    symbol = 't' + symbol

    const data = {
      params.gid,
      params.cid,
      type,
      symbol,
      amount,
      price,
      meta,
      protocol
    }

    // TODO: check how to actually get the url
    const url = this.urls('ethfinex-v1') + '/w/on'

    // TODO: actually post and parse response

    const response = post(url, {json: data})

    // TODO: actually parse the response
    const parsed = response

    return parsed
  }

}
