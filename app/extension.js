const vscode = require('vscode');
const si = require('systeminformation');

/**
 * Fetch the list of YieldMax ETF tickers from a free GitHub hosted CSV file.
 * The dataset is maintained publicly and does not require any API key.
 *
 * @returns {Promise<string[]>} array of ticker symbols
 */
async function fetchYieldmaxTickers() {
    const url = 'https://raw.githubusercontent.com/michaelpointek/yield_max_etf_analysis/main/reference.csv';
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
        }
        const text = await res.text();
        return text
            .split('\n')
            .slice(1)
            .map(line => line.split(',')[0].trim())
            .filter(Boolean);
    } catch (err) {
        console.error('Failed to fetch YieldMax tickers', err);
        return [];
    }
}

function activate(context) {
    let statusBarMemory = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000);
    statusBarMemory.command = undefined;
    statusBarMemory.color = 'yellow';
    context.subscriptions.push(statusBarMemory);
    statusBarMemory.show();

    // Retrieve YieldMax tickers on activation and print them to the console
    fetchYieldmaxTickers().then(tickers => {
        console.log('YieldMax tickers:', tickers.join(', '));
    });

    setInterval(async () => {
        let memData = await si.mem();
        let currentLoad = await si.currentLoad();
        let cpuData = await si.cpu();

        let totalMemory = memData.total;
        let freeMemory = memData.free;
        let usedMemory = totalMemory - freeMemory;
        let memoryUsage = (usedMemory / totalMemory) * 100;

        let cpuUsage = currentLoad.currentLoad;
        let cores = cpuData.cores;
        let threads = cpuData.cores * 2; // Assuming each core has 2 threads

        statusBarMemory.text = `Memory: ${(usedMemory / 1024 / 1024 / 1024).toFixed(2)}GB (${memoryUsage.toFixed(2)}%) / ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB, CPU: ${cpuUsage.toFixed(2)}%, Cores: ${cores}, Threads: ${threads}`;
    }, 1000);
}

exports.activate = activate;
exports.fetchYieldmaxTickers = fetchYieldmaxTickers;
