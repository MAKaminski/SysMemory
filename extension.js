const vscode = require('vscode');
const si = require('systeminformation');

function activate(context) {
    let statusBarMemory = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000);
    statusBarMemory.command = undefined;
    statusBarMemory.color = 'yellow';
    context.subscriptions.push(statusBarMemory);
    statusBarMemory.show();

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