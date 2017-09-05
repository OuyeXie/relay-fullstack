import _ from 'lodash'
import moment from 'moment'
import debug from 'debug'
import Crawler from './crawler'
import ProxyCrawler from './proxyCrawler'
import symbolToInfo from './niuguwangsymbol.json'
import fetch from 'node-fetch'


const crawler = new ProxyCrawler({
  rateLimits: 200,
  timeout: 10000,
  retries: 1,
  retryTimeout: 10000
})

const quoteCrawler = new Crawler()

function parseLargeInt(s) {
  if (!s) {
    return NaN
  }
  let factor
  switch (s.replace(/[^千万亿]/g, '')) {
    case '万亿':
      factor = 1000000000000
      break
    case '亿':
      factor = 100000000
      break
    case '万':
      factor = 10000
      break
    default:
      factor = 1
      break
  }
  return Math.round(parseFloat(s) * factor)
}

async function quote(symbol, mute) {
  debug('niuguwang')('request quote symbol', symbol)
  const stockInfo = symbolToInfo[symbol]
  if (!stockInfo) {
    if (mute) {
      console.warn('no symbol in niuguwang: ' + symbol)
      return {}
    } else {
      throw new Error('no symbol in niuguwang: ' + symbol)
    }
  }
  const {code, market} = stockInfo
  let url
  if (market === 1 || market === 2 || market === 12 || market === 13) {
    url = 'http://hq.niuguwang.com/aquote/quotedata/stockshare.ashx'
  } else if (market === 3 || market === 4) {
    url = 'http://hq.niuguwang.com/aquote/quotedata/markshare.ashx'
  } else if (market === 5 || market === 21) {
    url = 'http://hqhk.niuguwang.com/hkquote/quotedata/stockshare.ashx'
  } else if (market === 7) {
    url = 'http://hqus.niuguwang.com/usquote/quotedata/stockshare.ashx'
  } else if (market === 10 || market === 11) {
    url = 'http://hq.niuguwang.com/aquote/quotedata/fundshare.ashx'
  } else if (market === 14) {
    url = 'http://hq.niuguwang.com/squote/quotedata/stockshare.ashx'
  } else if (market === 17 || market === 18) {
    url = 'http://hqhk.niuguwang.com/hkquote/quotedata/warrantquote.ashx'
  }

  let res = await fetch(`${url}?code=${code}&version=3.4.2&packtype=1`, {timeout: 5000})
  res = await res.json()
  const timePriceDiv = market === 10 || market === 11 ? 1000 : 100

  res = {
    symbol: symbol,
    isOpen: !parseInt(res.openstatus, 10),          // 是否开盘
    suspend: Boolean(parseInt(res.suspend, 10)),    // 是否停牌
    suspendClue: res.suspendclue,                   // 停牌原因
    hugangtong: parseInt(res.hugangton, 10),
    lastPrice: parseFloat(res.nowv),
    amplitude: parseFloat(res.amplitude),           // 振幅
    volume: parseLargeInt(res.litotalvolumetrade),  // 成交量
    amount: parseLargeInt(res.litotalvaluetrade),   // 成交金额
    upCount: parseInt(res.upcount, 10),             // 涨家数(指数时有此字段)
    midCount: parseInt(res.midcount, 10),           // 平家数
    downCount: parseInt(res.downcount, 10),         // 跌家数
    high: Math.abs(parseFloat(res.highp)),
    open: Math.abs(parseFloat(res.openp)),
    low: Math.abs(parseFloat(res.lowp)),
    lastClose: parseFloat(res.preclose),
    turnoverRate: parseFloat(res.turnoverrate),     // 换手率
    totalShare: parseLargeInt(res.totalstocknum),   // 总股本
    marketCap: parseLargeInt(res.totalstockvalue),  // 总市值
    floatCap: parseLargeInt(res.earningsrate),      // 流通市值
    perEarning: parseFloat(res.pe || res.cantransactionvalue),  // 市盈率
    marketMakerNum: parseInt(res.zuoshishangnum),   // 做市商数
    yearHigh: parseFloat(res['52high'] || res['52weekhigh']),
    yearLow: parseFloat(res['52low'] || res['52weeklow']),
    lotSize: parseInt(res.lots, 10),                // 每手股数
    netValue: parseFloat(res.pernetvalue),
    discount: parseFloat(res.discount),             // 溢价率
    timeQuotes: res.timedata.map(({times, curp, curvol, curvalue}) => {
      const r = {
        time: times, //YYYYMMDDhhmm
        price: parseFloat(curp) / timePriceDiv,
        volume: parseInt(curvol, 10)
      }
      if (curvalue) {
        r.amout = parseInt(curvalue, 10)
      }
      return r
    })
  }

  const {timeQuotes} = res
  if (timeQuotes.length) {
    const q = timeQuotes[timeQuotes.length - 1]
    res.lastDate = moment(q.time, 'YYYYMMDDhhmm').format('YYYY-MM-DD')
  }

  return _.omit(res, v => !v && isNaN(v))
}

async function getData(resource, qs) {
  debug('niuguwang')('request:', resource, qs)
  let res = await crawler.queue({
    uri: `http://www.niuguwang.com/tr/201411/${resource}.ashx`,
    qs: Object.assign({
      s: 'niuguwang',
      version: '2.8.2',
      packtype: 1
    }, qs),
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: 'www.niuguwang.com',
      'User-Agent': 'Apache-HttpClient/UNAVAILABLE (java 1.4)'
    },
    jQuery: false
  })

  try {
    return JSON.parse(res.response.body)
  } catch (e) {
    debug('niuguwang')('proxy request error', e)
  }
  crawler.proxyShift()
  return await getData(resource, qs)
}

/*
 * 获取某个账户列表下的数据
 * @param {Number} type: 0~7
 */
async function getAccountList(type) {
  let res = await getData('getranke', {
    type: type,
    topn: 20,
    sign: 0
  })
  return res.data.map(account => {
    return {
      accountId: parseInt(account.AccountID, 10),
      userImgUrl: account.LogoPhotoUrl,
      monthlyGain: parseFloat(account.MonthYield),
      userId: parseInt(account.UserID, 10),
      userName: account.UserName,
      winrate: parseFloat(account.WinRatio),
      gain: parseFloat(account.Yield)
    }
  })
}


/*
 * 获取首页上的动态信息
 */
async function getRandedHistor() {
  let res = await getData('rankedhistor', {
    topn: 20,
    sign: 0
  })
  if (res.code) {
    throw new Error(res.message)
  }
  return res.datas.map(data => {
    let reb = {
      accountId: parseInt(data.AccountID, 10),
      time: moment(data.AddTime, 'MM-DD hh:mm').toDate(),
      rebId: data.HistoryID,
      stockSymbol: data.StockCode,
      stockName: data.StockName.replace(/\s/g, ''),
      userId: parseInt(data.UserID, 10)
    }
    if (data.Market === '1') {
      reb.stockSymbol = 'SH' + reb.stockSymbol
    } else if (data.Market === '2') {
      reb.stockSymbol = 'SZ' + reb.stockSymbol
    }

    return reb
  })
}


/*
 * 获取一个账户的信息
 */
async function getAccount(accountId) {
  let account = await getData('account', {aid: accountId})
  if (!account || !account.accountData.length) {
    crawler.proxyShift()
    return await getAccount(accountId)
  }
  let accountData = account.accountData[0]
  return {
    accountId: parseInt(accountData.AccountID, 10),
    userImgUrl: accountData.LogoPhotoUrl,
    monthlyGain: parseFloat(accountData.MonthYield),
    description: accountData.Slogan,
    userId: parseInt(accountData.UserID, 10),
    userName: accountData.UserName,
    winrate: parseFloat(accountData.WinRatio),
    gain: parseFloat(accountData.Yield),
    netValue: parseFloat(accountData.equity),
    rebPeriod: Math.round(3000 / parseFloat(accountData.MonthTradeNumber)) / 100,
    title: accountData.title,
    createTime: moment(accountData.FirstTradeTime, 'YYYY-MM-DD hh:mm:ss').toDate(),
    stockList: account.stockListData.concat(account.clearStockListData.slice(0, 5)).map(s => {
      return s.ListID
    })
  }
}


async function getRebalancing(stockItemId) {
  let res = await getData('stocklistitem', {id: stockItemId})
  if (res.code) {
    throw new Error(res.message)
  }
  let stock = res.stockListData[0]
  let exchange
  if (stock.Market === '1') {
    exchange = 'SH'
  } else if (stock.Market === '2') {
    exchange = 'SZ'
  } else {
    exchange = ''
  }
  let symbol = exchange + stock.StockCode
  let stockName = stock.StockName
  if (/^\d{6}$/.test(symbol)) {
    if (symbol[0] === '0' || symbol[0] === '1' || symbol[0] === '3') {
      symbol = 'SZ' + symbol
    } else if (symbol[0] === '6') {
      symbol = 'SH' + symbol
    }
  }

  return res.historyData.map(h => {
    return {
      stockSymbol: symbol,
      stockName: stockName,
      time: moment(h.AddTime, 'YYYY-MM-DD hh:mm:ss').toDate(),
      rebId: h.HistoryID,
      price: parseFloat(h.TransactionUnitPrice),
      volume: parseInt(h.TransactionAmount, 10),
      amount: parseFloat(h.TotalPrice),
      buy: h.Type === '1'
    }
  })
}


async function getUser(userId) {
  let res = await getData('other', {userid: userId})
  return {
    userId: userId,
    userName: res.userName,
    userImageUrl: res.logoPhotoUrl,
    monthlyGain: parseFloat(res.monthYield),
    followerCount: parseInt(res.followerNumber, 10),
    gain: parseFloat(res.totalYield),
    description: res.slogan,
    winrate: parseFloat(res.winRatio),
    netValue: parseFloat(res.equity)
  }
}


async function user() {
  let accounts = await getRandedHistor()
  for (let type = 0; type <= 7; type++) {
    accounts = accounts.concat(await getAccountList(type))
  }
  accounts = _.uniq(accounts, 'accountId')

  let res = []
  for (let account of accounts) {
    // 获取每支组合的资料
    try {
      let accountData = await getAccount(account.accountId)
      Object.assign(accountData, await getUser(accountData.userId))
      let rebalancing = []
      for (let stockItem of accountData.stockList) {
        rebalancing = rebalancing.concat(await getRebalancing(stockItem))
      }
      accountData.rebalancing = rebalancing
      delete accountData.stockList
      accountData.source = 'niuguwang'
      res.push(accountData)
    } catch (e) {
      console.error(`niuguwang user ${account.accountId} error`, e)
    }
  }
  return res
}


export default { user, quote }
