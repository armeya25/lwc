package com.chart;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
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
    }

    public static void main(String[] args) {
        launch(args);
    }
}