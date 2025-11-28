class ChartManager {
    constructor() {
        this.chart = null;
        this.candlestickSeries = null;
        
        // Store reference to this for callbacks
        const self = this;
        
        // Make updateChart available on the instance
        this.updateChart = function(data) {
            console.log('updateChart called with data:', data ? data.length : 0, 'items');
            if (self.candlestickSeries && data && data.length > 0) {
                console.log('Setting chart data...');
                // Convert timestamps to milliseconds and ensure proper date handling
                const formattedData = data.map(item => {
                    // If time is a string in format 'YYYY-MM-DD', parse it to timestamp
                    let timestamp = item.time;
                    if (typeof timestamp === 'string' && timestamp.includes('-')) {
                        timestamp = new Date(timestamp).getTime();
                    } else if (typeof timestamp === 'number') {
                        // If it's a number, check if it needs to be converted from seconds to milliseconds
                        timestamp = timestamp < 1e12 ? timestamp * 1000 : timestamp;
                    }
                    
                    return {
                        ...item,
                        time: timestamp,
                        open: Number(item.open),
                        high: Number(item.high),
                        low: Number(item.low),
                        close: Number(item.close)
                    };
                });
                console.log('First data point:', formattedData[0]);
                self.candlestickSeries.setData(formattedData);
                self.chart.timeScale().fitContent();
                console.log('Chart data set successfully');
            } else {
                console.error('Cannot update chart:', {
                    hasCandlestickSeries: !!self.candlestickSeries,
                    hasData: !!(data && data.length > 0)
                });
            }
        };
        
        // Make chartManager globally available
        window.chartManager = this;
        
        // Initialize chart
        this.initializeChart();
    }

    initializeChart() {
        console.log('Initializing chart...');
        const chartContainer = document.getElementById('chart-container');
        
        if (!chartContainer) {
            console.error('Chart container not found!');
            return;
        }
        
        console.log('Chart container found, creating chart...');
        
        // Get CSS variables
        const style = getComputedStyle(document.documentElement);
        const bgColor = style.getPropertyValue('--bg-color').trim();
        const textColor = style.getPropertyValue('--text-color').trim();
        const gridColor = style.getPropertyValue('--grid-color').trim();
        const borderColor = style.getPropertyValue('--border-color').trim();
        const crosshairColor = style.getPropertyValue('--crosshair-color').trim();
        const crosshairBg = style.getPropertyValue('--crosshair-bg').trim();

        // Create the chart with CSS-based theming
        this.chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: {
                background: { type: 'solid', color: bgColor },
                textColor: textColor,
                fontSize: 12,
                fontFamily: 'inherit' // Inherit from CSS
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: crosshairColor,
                    style: 2, // Dashed line
                    labelBackgroundColor: crosshairBg,
                },
                horzLine: {
                    width: 1,
                    color: crosshairColor,
                    style: 2, // Dashed line
                    labelBackgroundColor: crosshairBg,
                },
            },
            rightPriceScale: {
                borderColor: borderColor,
                scaleMargins: { top: 0.1, bottom: 0.2 },
                textColor: textColor,
            },
            timeScale: {
                borderColor: borderColor,
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 1,
                barSpacing: 6,
                minBarSpacing: 0.5,
                fixLeftEdge: false,
                fixRightEdge: true,
                textColor: textColor + 'cc',
                tickMarkFormatter: (time) => {
                    const date = new Date(time);
                    return date.toLocaleDateString();
                },
                timeFormatter: (time) => {
                    return new Date(time).toLocaleString();
                },
                tickMarkTimeVisible: true
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        // Add candlestick series with CSS variable colors
        this.candlestickSeries = this.chart.addCandlestickSeries({
            upColor: style.getPropertyValue('--up-color').trim(),
            downColor: style.getPropertyValue('--down-color').trim(),
            borderDownColor: style.getPropertyValue('--down-color').trim(),
            borderUpColor: style.getPropertyValue('--up-color').trim(),
            wickDownColor: style.getPropertyValue('--down-color').trim(),
            wickUpColor: style.getPropertyValue('--up-color').trim(),
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });

        console.log('Candlestick series created:', this.candlestickSeries);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.chart.applyOptions({
                width: chartContainer.clientWidth,
                height: chartContainer.clientHeight,
            });
        });
        
        console.log('Chart initialization complete');
    }
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating chart manager...');
    window.chartManager = new ChartManager();
    
    // If we have data already, update the chart
    if (window.chartData) {
        console.log('Initial data found, updating chart...');
        window.chartManager.updateChart(window.chartData);
    }
});

// Global function to update chart with new data
window.updateChartWithData = function(data) {
    console.log('Global updateChartWithData called');
    if (window.chartManager && window.chartManager.updateChart) {
        console.log('Calling chartManager.updateChart...');
        window.chartManager.updateChart(data);
    } else {
        console.error('chartManager or updateChart not available');
    }
};