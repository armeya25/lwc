package com.chart;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import javafx.application.Platform;
import com.chart.service.ChartService;
import com.chart.service.DataService;

public class ChartApplication extends Application {
    private WebView webView;
    @SuppressWarnings("unused")
    private ChartService chartService;
    private static final String DATA_FILE_PATH = "/data/1d.csv";

    @Override
    public void start(Stage primaryStage) {
        initializeUI(primaryStage);
        initializeServices();
    }

    private void initializeUI(Stage primaryStage) {
        webView = new WebView();
        StackPane root = new StackPane(webView);
        Scene scene = new Scene(root, 1200, 800);
        
        primaryStage.setTitle("Lightweight Charts in JavaFX");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    private void initializeServices() {
        DataService dataService = new DataService(DATA_FILE_PATH);
        chartService = new ChartService(webView, dataService);
        
        // Add a horizontal line at 1200 after a short delay to ensure chart is loaded
        new Thread(() -> {
            try {
                Thread.sleep(1000); // Wait for chart to initialize
                Platform.runLater(() -> {
                    chartService.addHorizontalLine(12000, "rgba(255, 0, 0, 0.7)", "1200 Level");
                });
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }

    public static void main(String[] args) {
        launch(args);
    }
}