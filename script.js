async function getStockData() {
    let ticker = document.getElementById("stockTicker").value.toUpperCase().trim();
    
    if (!ticker) {
        alert("Please enter a stock ticker!");
        return;
    }

    const apiKey = "8a5a6d83aemshc1932fb3028c609p117effjsn769029e7fd22"; // Replace with your actual API key
    const newsApiKey = "ba8186f17c2b4545869eebe25700a2db"; // Replace with your actual NewsAPI key

    // API URLs
    const priceUrl = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes?symbols=${ticker}&region=US`;
    const statsUrl = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v4/get-statistics?symbols=${ticker}&region=US`;
    const newsUrl = `https://newsapi.org/v2/everything?q=${ticker}&sortBy=publishedAt&apiKey=${newsApiKey}`;

    const options = {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
        }
    };

    try {
        // Fetch stock price, statistics, and news
        const [priceResponse, statsResponse, newsResponse] = await Promise.all([
            fetch(priceUrl, options),
            fetch(statsUrl, options),
            fetch(newsUrl)
        ]);

        const priceData = await priceResponse.json();
        const statsData = await statsResponse.json();
        const newsData = await newsResponse.json();

        // Process stock data
        if (priceData.quoteResponse && priceData.quoteResponse.result.length > 0) {
            let stock = priceData.quoteResponse.result[0];
            let price = stock.regularMarketPrice;
            let change = stock.regularMarketChangePercent.toFixed(2);
            
            let fiftyLow = stock.fiftyTwoWeekLow.toFixed(2);
            let fiftyHigh = stock.fiftyTwoWeekHigh.toFixed(2);
            let fiftyAvg = stock.fiftyDayAverage.toFixed(2);

            // Determine if the stock is a good investment
            let investmentAdvice = analyzeInvestment(price, change, fiftyLow, fiftyHigh, fiftyAvg);

            document.getElementById("result").innerHTML = 
                ` 
                <b>Stock:</b> ${ticker} <br>
                💲 <b>Price:</b> $${price} (${change}%) <br>
                <b>50-Day Moving Avg:</b> $${fiftyAvg} <br>
                <b>50-Day High:</b> $${fiftyHigh} <br>
                <b>50-Day Low:</b> $${fiftyLow} <br>
                🧠 <b>FOX AI Advice:</b> ${investmentAdvice} <br>             
                `;
        } else {
            document.getElementById("result").innerHTML = "❌ Invalid stock ticker.";
            return;
        }

        // Process stock-specific news data
        let newsHtml = "<h3>📰 Latest News on " + ticker + ":</h3>";
        if (newsData.articles && newsData.articles.length > 0) {
            newsData.articles.slice(0, 3).forEach(article => {
                newsHtml += `<p><a href="${article.url}" target="_blank">🔗 ${article.title}</a></p>`;
            });
        } else {
            newsHtml += "<p>❌ No relevant news found.</p>";
        }
        document.getElementById("news").innerHTML = newsHtml;

    } catch (error) {
        console.error("Error fetching stock data:", error);
        document.getElementById("result").innerHTML = "❌ Could not fetch stock data.";
        document.getElementById("news").innerHTML = "";
    }
}

// Function to determine if a stock is a good investment
function analyzeInvestment(price, change, fiftyLow, fiftyHigh, fiftyAvg) {
    if (price < fiftyLow) {
        return "⚠️ High Risk! Stock is trading near its lowest 50-day range.";
    } else if (price > fiftyHigh) {
        return "🚀 Bullish! Stock is trading at a 50-day high, indicating strong momentum.";
    } else if (change < -5) {
        return "📉 Market Downtrend! Significant negative movement; proceed with caution.";
    } else if (change > 5) {
        return "📈 Strong Growth! Stock is gaining momentum, consider investing.";
    } else if (price > fiftyAvg) {
        return "✅ Stable Investment! Stock is above its moving average, indicating growth potential.";
    } else {
        return "⚠️ Neutral Outlook. Stock movement is within the average range, consider external factors.";
    }
}
