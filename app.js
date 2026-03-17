let portfolio=[]
let sectorChart=null

function initChart(){
new TradingView.widget({
symbol:"NSE:RELIANCE",
interval:"D",
container_id:"chart1",
width:"100%",
height:400
})
}
initChart()

async function getPrice(symbol){
try{
let url=`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}.NS`
let res=await fetch(url)
let data=await res.json()
return data.chart.result[0].meta.regularMarketPrice
}catch(e){
return 0
}
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
<th>Delete</th>
</tr>
`

portfolio.forEach((p,index)=>{

table.innerHTML+=`
<tr>
<td>${p.symbol}</td>
<td>${p.qty}</td>
<td>${p.buy}</td>
<td>${p.current}</td>
<td>${p.pnl}</td>
<td><button class="deleteBtn" onclick="deleteStock(${index})">Delete</button></td>
</tr>
`

})

updateSector()

}

function deleteStock(index){
portfolio.splice(index,1)
renderPortfolio()
}

async function importExcel(){

let file=document.getElementById("excelFile").files[0]

let data=await file.arrayBuffer()

let workbook=XLSX.read(data)

let sheet=workbook.Sheets[workbook.SheetNames[0]]

let rows=XLSX.utils.sheet_to_json(sheet)

for(let r of rows){

let symbol=r["Script name"]
let qty=Number(r["Quantity"])
let buy=Number(r["Price"])

let current=await getPrice(symbol)

let pnl=(current-buy)*qty

portfolio.push({symbol,qty,buy,current,pnl})

}

renderPortfolio()

}

function updateSector(){

let sectors={}

portfolio.forEach(p=>{

let sec="Stocks"

if(!sectors[sec]) sectors[sec]=0

sectors[sec]+=p.qty*p.buy

})

let labels=Object.keys(sectors)
let values=Object.values(sectors)

if(sectorChart) sectorChart.destroy()

sectorChart=new Chart(
document.getElementById("sectorChart"),
{
type:"pie",
data:{
labels:labels,
datasets:[{data:values}]
}
})
}

async function runScreener(){

let stocks=[
"RELIANCE","TCS","INFY","HDFCBANK","ICICIBANK","SBIN","LT","ITC"
]

let out=[]

for(let s of stocks){

let p=await getPrice(s)

out.push(s+" : "+p)

}

document.getElementById("screenerOutput").innerText=out.join("\\n")

}

async function loadIndex(symbol){

let url=`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`

let res=await fetch(url)

let data=await res.json()

let price=data.quoteResponse.result[0].regularMarketPrice

document.getElementById("indexOutput").innerText="Index Price: "+price

}

async function loadOptions(){

let sym=document.getElementById("optionSymbol").value

let url=`https://query2.finance.yahoo.com/v7/finance/options/${sym}.NS`

let res=await fetch(url)

let data=await res.json()

let calls=data.optionChain.result[0].options[0].calls.slice(0,10)

document.getElementById("optionsOutput").innerText=JSON.stringify(calls,null,2)

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

document.getElementById("riskOutput").innerText="Expected Value "+avg

}

function runAI(){

let output=[]

portfolio.forEach(p=>{

let score=Math.random()

let signal=score>0.6?"BUY":score<0.4?"SELL":"HOLD"

output.push(p.symbol+" : "+signal)

})

document.getElementById("aiOutput").innerText=output.join("\\n")

}
""")
