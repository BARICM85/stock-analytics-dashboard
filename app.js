
let portfolio=[]
let chart

function initChart(){
new TradingView.widget({
symbol:"NSE:RELIANCE",
interval:"D",
container_id:"chart",
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

render()
}

function render(){
let table=document.getElementById("portfolioTable")
table.innerHTML="<tr><th>Symbol</th><th>P&L</th><th>Delete</th></tr>"
portfolio.forEach((p,i)=>{
table.innerHTML+=`<tr><td>${p.symbol}</td><td>${p.pnl}</td><td><button class="deleteBtn" onclick="deleteStock(${i})">Delete</button></td></tr>`
})
updateSector()
}

function deleteStock(i){
portfolio.splice(i,1)
render()
}

function updateSector(){
let ctx=document.getElementById("sectorChart")
let total=portfolio.map(p=>p.qty*p.buy)
new Chart(ctx,{type:"pie",data:{labels:portfolio.map(p=>p.symbol),datasets:[{data:total}]}})
}

async function runScreener(){
let stocks=["RELIANCE","TCS","INFY","HDFCBANK","ICICIBANK"]
let out=[]
for(let s of stocks){
let p=await getPrice(s)
out.push(s+" : "+p)
}
document.getElementById("screener").innerText=out.join("\n")
}

function runMonteCarlo(){
let sims=1000
let results=[]
for(let i=0;i<sims;i++){
let val=100
for(let j=0;j<252;j++){
val*=1+(Math.random()-0.5)/10
}
results.push(val)
}
let avg=results.reduce((a,b)=>a+b)/sims
document.getElementById("risk").innerText="Expected "+avg
}

function runAI(){
let out=[]
portfolio.forEach(p=>{
let r=Math.random()
out.push(p.symbol+" : "+(r>0.6?"BUY":r<0.4?"SELL":"HOLD"))
})
document.getElementById("ai").innerText=out.join("\n")
}
