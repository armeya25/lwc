package com.chart.service;

import com.chart.model.ChartData;
import com.chart.model.CandleData;
import javafx.scene.web.WebView;
import javafx.concurrent.Worker;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Handles all chart-related operations including WebView management and JavaScript communication.
 */
public class ChartService {
    private static final Logger logger = Logger.getLogger(ChartService.class.getName());
    private final WebView webView;
    private final DataService dataService;

    public ChartService(WebView webView, DataService dataService) {
        this.webView = webView;
        this.dataService = dataService;
        initializeWebView();
    }

    private void initializeWebView() {
        webView.getEngine().setJavaScriptEnabled(true);
        setupConsoleLogging();
        setupPageLoadListener();
        
        // Load the HTML page
        String htmlPath = getClass().getResource("/chart/chart.html").toExternalForm();
        webView.getEngine().load(htmlPath);
    }

    public void loadAndDisplayData() {
        try {
            ChartData chartData = dataService.loadChartData();
            String jsonData = convertToJson(chartData);
            injectDataIntoChart(jsonData);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error loading or displaying chart data", e);
        }
    }

    private String convertToJson(ChartData chartData) {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;
        
        for (CandleData candle : chartData.getCandles()) {
            if (!first) {
                json.append(",");
            }
            json.append(String.format(
                "{\"time\":%d,\"open\":%f,\"high\":%f,\"low\":%f,\"close\":%f}",
                candle.getTime(), candle.getOpen(), candle.getHigh(), 
                candle.getLow(), candle.getClose()
            ));
            first = false;
        }
        
        json.append("]");
        return json.toString();
    }

    private void injectDataIntoChart(String jsonData) {
        logger.info("Injecting data into chart...");
        logger.info("JSON Data length: " + jsonData.length());
        
        // Set the chart data
        String setDataScript = "window.chartData = " + jsonData + ";";
        executeJavaScript(setDataScript);
        
        // Update the chart with the new data
        String updateScript = 
            "if (window.updateChartWithData) {\n" +
            "    console.log('Updating chart with initial data...');\n" +
            "    updateChartWithData(window.chartData);\n" +
            "} else {\n" +
            "    console.error('updateChartWithData function not found');\n" +
            "    console.error('Available window properties:', Object.keys(window).join(', '));\n" +
            "}";
            
        executeJavaScript(updateScript);
    }

    private void executeJavaScript(String script) {
        try {
            webView.getEngine().executeScript(script);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error executing JavaScript: " + e.getMessage(), e);
        }
    }

    public void addHorizontalLine(double price, String color, String text, int lineWidth, int lineStyle) {
    String script = String.format(
        "if (window.chartManager && window.chartManager.addHorizontalLine) {" +
        "   window.chartManager.addHorizontalLine(%f, '%s', '%s', %d, %d);" +
        "} else {" +
        "   console.error('chartManager.addHorizontalLine not available');" +
        "}", price, color, text, lineWidth, lineStyle);
    executeJavaScript(script);
}

// Overload with default values for backward compatibility
public void addHorizontalLine(double price, String color, String text) {
    addHorizontalLine(price, color, text, 2, 0); // Default: 2px solid line
}

    private void setupConsoleLogging() {
        webView.getEngine().getLoadWorker().stateProperty().addListener((observable, oldValue, newValue) -> {
            if (newValue == Worker.State.SUCCEEDED) {
                String script = 
                    "var originalLog = console.log;\n" +
                    "var originalError = console.error;\n\n" +
                    "console.log = function(message) {\n" +
                    "    originalLog.call(console, message);\n" +
                    "};\n\n" +
                    "console.error = function(message) {\n" +
                    "    originalError.call(console, message);\n" +
                    "};";
                
                webView.getEngine().executeScript(script);
            }
        });
    }

    private void setupPageLoadListener() {
        webView.getEngine().getLoadWorker().stateProperty().addListener((observable, oldValue, newValue) -> {
            if (newValue == Worker.State.SUCCEEDED) {
                loadAndDisplayData();
            }
        });
    }
}
