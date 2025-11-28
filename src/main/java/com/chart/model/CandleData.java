package com.chart.model;

/**
 * Represents a single candlestick data point with timestamp and OHLC values.
 */
public class CandleData {
    private final long time;
    private final double open;
    private final double high;
    private final double low;
    private final double close;

    public CandleData(long time, double open, double high, double low, double close) {
        this.time = time;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
    }

    public long getTime() { return time; }
    public double getOpen() { return open; }
    public double getHigh() { return high; }
    public double getLow() { return low; }
    public double getClose() { return close; }

    @Override
    public String toString() {
        return String.format("CandleData{time=%d, open=%.2f, high=%.2f, low=%.2f, close=%.2f}", 
            time, open, high, low, close);
    }
}
