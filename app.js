
let portfolio=[]

function initChart(){
new TradingView.widget({
symbol:"NSE:RELIANCE",
interval:"D",
container_id:"tvchart",
width:"100%",
height:400
})
}
initChart()

async function getPrice(symbol){

let url=`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}.NS`

let res=await fetch(url)
let data=await res.json()

return data.quoteResponse.result[0].regularMarketPrice

}

function renderPortfolio(){

let table=document.getElementById("portfolioTable")

table.innerHTML="<tr><th>Symbol</th><th>Qty</th><th>Buy</th><th>Current</th><th>P&L</th></tr>"

portfolio.forEach(p=>{

table.innerHTML+=`

<tr>
<td>${p.symbol}</td>
<td>${p.qty}</td>
<td>${p.price}</td>
<td>${p.current}</td>
<td>${p.pnl}</td>
</tr>

`

})

}

async function importExcel(){

let file=document.getElementById("excelFile").files[0]

let data=await file.arrayBuffer()

let workbook=XLSX.read(data)

let sheet=workbook.Sheets[workbook.SheetNames[0]]

let rows=XLSX.utils.sheet_to_json(sheet)

for(let r of rows){

let price=await getPrice(r["Script name"])

let pnl=(price-r["Price"])*r["Quantity"]

portfolio.push({
symbol:r["Script name"],
qty:r["Quantity"],
price:r["Price"],
current:price,
pnl:pnl
})

}

renderPortfolio()

}

function buildSectorChart(){

let sectors={}

portfolio.forEach(p=>{

let sector="Tech"

if(!sectors[sector]) sectors[sector]=0

sectors[sector]+=p.qty*p.price

})

new Chart(document.getElementById("sectorChart"),{

type:"pie",
data:{
labels:Object.keys(sectors),
datasets:[{data:Object.values(sectors)}]
}

})

}

function runMonteCarlo(){

let simulations=1000

let start=100

let results=[]

for(let i=0;i<simulations;i++){

let price=start

for(let d=0;d<252;d++){

let shock=(Math.random()-0.5)/10

price=price*(1+shock)

}

results.push(price)

}

let avg=results.reduce((a,b)=>a+b)/results.length

document.getElementById("riskOutput").innerText="Expected value: "+avg

}

function runAI(){

let signals=[]

portfolio.forEach(p=>{

let signal=Math.random()>0.5?"BUY":"SELL"

signals.push(p.symbol+" : "+signal)

})

document.getElementById("aiOutput").innerText=signals.join("\n")

}

async function loadScreener(){

let stocks=["RELIANCE","TCS","INFY","HDFCBANK"]

let output=[]

for(let s of stocks){

let price=await getPrice(s)

output.push(s+" : "+price)

}

document.getElementById("screener").innerText=output.join("\n")

}
