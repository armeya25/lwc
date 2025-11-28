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
        
        // Store reference to the horizontal line
        this.lastHorizontalLine = null;
        
        // Make chartManager globally available
        window.chartManager = this;
        
        // Expose addHorizontalLine method
        window.addHorizontalLine = (price, color, text) => {
            this.addHorizontalLine(price, color, text);
        };
        
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
        
        // Handle chart resizing
        new ResizeObserver(entries => {
            if (entries.length === 0 || !this.horizontalLineSeries) return;
            const { width, height } = entries[0].contentRect;
            this.chart.applyOptions({ width, height });
            
            // Redraw horizontal line on resize
            if (this.lastHorizontalLine) {
                this.addHorizontalLine(
                    this.lastHorizontalLine.price,
                    this.lastHorizontalLine.color,
                    this.lastHorizontalLine.text
                );
            }
        }).observe(chartContainer);

        // Handle time scale changes to keep the line extended
        this.chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
            if (this.lastHorizontalLine) {
                this.addHorizontalLine(
                    this.lastHorizontalLine.price,
                    this.lastHorizontalLine.color,
                    this.lastHorizontalLine.text
                );
            }
        });
    }
    
    addHorizontalLine(price, color = 'rgba(255, 0, 0, 0.7)', text = '', lineWidth = 2, lineStyle = 0) {
    console.log(`Adding horizontal line at: ${price}, width: ${lineWidth}, style: ${lineStyle}`);
    
    if (!this.chart) {
        console.error('Chart not initialized');
        return false;
    }

    try {
        // Store the line properties
        this.lastHorizontalLine = { price, color, text, lineWidth, lineStyle };

        // Create the line series if it doesn't exist
        if (!this.horizontalLineSeries) {
            this.horizontalLineSeries = this.chart.addLineSeries({
                color: color,
                lineWidth: lineWidth,
                lineStyle: lineStyle,  // 0 = solid, 1 = dotted, 2 = dashed
                crosshairMarkerVisible: false,
                lastValueVisible: false,
                priceLineVisible: false,
            });
        } else {
            // Update existing series style
            this.horizontalLineSeries.applyOptions({
                color: color,
                lineWidth: lineWidth,
                lineStyle: lineStyle
            });
            // Clear previous line data
            this.horizontalLineSeries.setData([]);
        }

        // Get the visible range
        const timeScale = this.chart.timeScale();
        const visibleRange = timeScale.getVisibleLogicalRange() || { from: 0, to: 100 };
        
        // Add two points to create a line across the visible range
        const data = [
            { time: visibleRange.from, value: price },
            { time: visibleRange.to, value: price }
        ];
        
        this.horizontalLineSeries.setData(data);

        // Add price label
        if (text) {
            this.horizontalLineSeries.createPriceLine({
                price: price,
                color: color,
                lineWidth: lineWidth,
                lineStyle: lineStyle,
                axisLabelVisible: true,
                title: text,
                lineVisible: true
            });
        }
        
        // Force a redraw
        this.chart.timeScale().fitContent();
        return true;
    } catch (error) {
        console.error('Error adding horizontal line:', error);
        return false;
    }
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