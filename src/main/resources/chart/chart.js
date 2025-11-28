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
                // Convert timestamps from seconds to milliseconds if needed
                const formattedData = data.map(item => ({
                    ...item,
                    time: item.time * 1000 // Convert seconds to milliseconds
                }));
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
        
        // Create the chart
        this.chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: {
                backgroundColor: '#ffffff',
                textColor: 'rgba(0, 0, 0, 0.9)',
            },
            grid: {
                vertLines: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                horzLines: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            timeScale: {
                borderColor: 'rgba(0, 0, 0, 0.1)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Add candlestick series
        this.candlestickSeries = this.chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
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