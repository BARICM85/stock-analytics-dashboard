/* ===============================
   GLOBAL DATA
================================ */

let portfolio = []

let sectorChart = null


/* ===============================
   PRICE FETCH FUNCTION
   (NSE STOCKS)
================================ */

async function getPrice(symbol){

    try{

        symbol = symbol.trim().toUpperCase()

        let url =
        `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}.NS`

        let res = await fetch(url)

        let data = await res.json()

        return data.chart.result[0].meta.regularMarketPrice

    }

    catch(e){

        console.log("Price fetch failed", e)

        return 0

    }

}


/* ===============================
   ADD STOCK MANUALLY
================================ */

async function addStock(){

    let symbol =
    document.getElementById("symbol").value

    let qty =
    parseFloat(document.getElementById("qty").value)

    let buyPrice =
    parseFloat(document.getElementById("price").value)

    let current = await getPrice(symbol)

    let pnl = (current - buyPrice) * qty

    portfolio.push({

        symbol,
        qty,
        buyPrice,
        current,
        pnl

    })

    renderPortfolio()

}


/* ===============================
   PORTFOLIO TABLE
================================ */

function renderPortfolio(){

    let table =
    document.getElementById("portfolioTable")

    table.innerHTML = `

    <tr>
        <th>Symbol</th>
        <th>Qty</th>
        <th>Buy Price</th>
        <th>Current</th>
        <th>P&L</th>
    </tr>

    `

    portfolio.forEach(p => {

        table.innerHTML += `

        <tr>
            <td>${p.symbol}</td>
            <td>${p.qty}</td>
            <td>${p.buyPrice}</td>
            <td>${p.current}</td>
            <td>${p.pnl.toFixed(2)}</td>
        </tr>

        `

    })

    updateSectorChart()

}


/* ===============================
   EXCEL IMPORT
================================ */

async function importExcel(){

    let file =
    document.getElementById("excelFile").files[0]

    if(!file){

        alert("Select Excel file")

        return

    }

    let data = await file.arrayBuffer()

    let workbook = XLSX.read(data)

    let sheet =
    workbook.Sheets[workbook.SheetNames[0]]

    let rows =
    XLSX.utils.sheet_to_json(sheet)

    for(let r of rows){

        let symbol =
        r["Script name"]

        let qty =
        Number(r["Quantity"])

        let price =
        Number(r["Price"])

        let current =
        await getPrice(symbol)

        let pnl =
        (current - price) * qty

        portfolio.push({

            symbol,
            qty,
            buyPrice: price,
            current,
            pnl

        })

    }

    renderPortfolio()

}


/* ===============================
   SECTOR ALLOCATION
================================ */

function updateSectorChart(){

    let sectorMap = {}

    portfolio.forEach(p => {

        let sector = "Stocks"

        if(!sectorMap[sector])
            sectorMap[sector] = 0

        sectorMap[sector] +=
        p.qty * p.buyPrice

    })

    let labels =
    Object.keys(sectorMap)

    let values =
    Object.values(sectorMap)

    if(sectorChart){

        sectorChart.destroy()

    }

    sectorChart = new Chart(

        document.getElementById("sectorChart"),

        {

            type:"pie",

            data:{

                labels:labels,

                datasets:[{

                    data:values

                }]

            }

        }

    )

}


/* ===============================
   NSE SCREENER
================================ */

async function loadScreener(){

    let stocks = [

        "RELIANCE",
        "TCS",
        "INFY",
        "HDFCBANK",
        "ICICIBANK",
        "ITC"

    ]

    let output = []

    for(let s of stocks){

        let price =
        await getPrice(s)

        output.push(

            `${s} : ₹${price}`

        )

    }

    document.getElementById("screener")
    .innerText = output.join("\\n")

}


/* ===============================
   MONTE CARLO RISK
================================ */

function runMonteCarlo(){

    let simulations = 1000

    let start = 100

    let results = []

    for(let i=0;i<simulations;i++){

        let price = start

        for(let d=0; d<252; d++){

            let shock =
            (Math.random() - 0.5) / 10

            price = price * (1 + shock)

        }

        results.push(price)

    }

    let avg =
    results.reduce((a,b)=>a+b)
    / results.length

    document.getElementById("riskOutput")
    .innerText =
    "Expected Portfolio Value: "
    + avg.toFixed(2)

}


/* ===============================
   AI SIGNAL GENERATOR
================================ */

function runAI(){

    let signals = []

    portfolio.forEach(p => {

        let score =
        Math.random()

        let signal =
        score > 0.6
        ? "BUY"
        : score < 0.4
        ? "SELL"
        : "HOLD"

        signals.push(

            `${p.symbol} : ${signal}`

        )

    })

    document.getElementById("aiOutput")
    .innerText =
    signals.join("\\n")

}


/* ===============================
   CLEAR PORTFOLIO
================================ */

function clearPortfolio(){

    portfolio = []

    renderPortfolio()

}
