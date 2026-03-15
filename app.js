
let portfolio=[]

function initChart(){

new TradingView.widget({
symbol: "NSE:RELIANCE",
interval: "D",
container_id: "tradingview_chart",
width: "100%",
height: 400,
theme: "light"
})

}

initChart()

async function getPrice(symbol){

let url=`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`

let res=await fetch(url)
let data=await res.json()

return data.quoteResponse.result[0].regularMarketPrice

}

async function addStock(){

let symbol=document.getElementById("symbol").value
let qty=parseFloat(document.getElementById("qty").value)
let price=parseFloat(document.getElementById("price").value)

let current=await getPrice(symbol)

let pnl=(current-price)*qty

portfolio.push({symbol,qty,price,current,pnl})

renderPortfolio()

}

function renderPortfolio(){

let table=document.getElementById("portfolioTable")

table.innerHTML=`
<tr>
<th>Symbol</th>
<th>Qty</th>
<th>Buy</th>
<th>Current</th>
<th>P&L</th>
</tr>
`

portfolio.forEach(p=>{

table.innerHTML+=`
<tr>
<td>${p.symbol}</td>
<td>${p.qty}</td>
<td>${p.price}</td>
<td>${p.current}</td>
<td>${p.pnl.toFixed(2)}</td>
</tr>
`

})

}

async function loadIndex(symbol){

let price=await getPrice(symbol)

document.getElementById("indexValue").innerText="Index Price: "+price

}

async function loadOptions(){

let sym=document.getElementById("optionSymbol").value

let url=`https://query2.finance.yahoo.com/v7/finance/options/${sym}`

let res=await fetch(url)
let data=await res.json()

document.getElementById("optionsData").innerText=JSON.stringify(data.optionChain.result[0].options[0].calls.slice(0,10),null,2)

}
