package com.chart.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents the complete dataset for the chart, containing multiple CandleData points.
 */
public class ChartData {
    private final List<CandleData> candles;

    public ChartData() {
        this.candles = new ArrayList<>();
    }

    public void addCandle(CandleData candle) {
        this.candles.add(candle);
    }

    public List<CandleData> getCandles() {
        return Collections.unmodifiableList(candles);
    }

    public int size() {
        return candles.size();
    }

    public boolean isEmpty() {
        return candles.isEmpty();
    }

    @Override
    public String toString() {
        return String.format("ChartData{%d candles}", candles.size());
    }
}
