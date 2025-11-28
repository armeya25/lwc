package com.chart.service;

import com.chart.model.ChartData;
import com.chart.model.CandleData;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;


public class DataService {
    private final String dataFilePath;
    private final DateTimeFormatter isoFormatter = 
        DateTimeFormatter.ISO_LOCAL_DATE_TIME
                       .withZone(ZoneId.of("UTC"));  // Using UTC for consistency

    public DataService(String dataFilePath) {
        this.dataFilePath = dataFilePath;
    }

    public ChartData loadChartData() throws IOException, URISyntaxException {
        String csvData = loadDataFromFile(dataFilePath);
        return parseCsvToChartData(csvData);
    }

    private String loadDataFromFile(String filePath) throws IOException, URISyntaxException {
        URL resource = getClass().getResource(filePath);
        if (resource == null) {
            throw new IOException("Resource not found: " + filePath);
        }
        return new String(Files.readAllBytes(Paths.get(resource.toURI())));
    }

    private ChartData parseCsvToChartData(String csv) {
    ChartData chartData = new ChartData();
    String[] lines = csv.split("\\r?\\n");
    
    // Skip header row if exists
    int startLine = 0;
    if (lines.length > 0 && (lines[0].startsWith("date,") || lines[0].startsWith("time,"))) {
        startLine = 1;
    }

    for (int i = startLine; i < lines.length; i++) {
        try {
            String[] parts = lines[i].split(",");
            if (parts.length < 5) continue; // Skip malformed lines

            long time = parseTimestamp(parts[0].trim());
            double open = Double.parseDouble(parts[1].trim());
            double high = Double.parseDouble(parts[2].trim());
            double low = Double.parseDouble(parts[3].trim());
            double close = Double.parseDouble(parts[4].trim());

            chartData.addCandle(new CandleData(time, open, high, low, close));
        } catch (Exception e) {
            System.err.println("Error parsing line " + (i + 1) + ": " + e.getMessage());
        }
    }
    return chartData;
}
    
    private long parseTimestamp(String timestampStr) {
        try {
            if (timestampStr.matches("\\d+")) {
                // Unix timestamp in seconds
                return Long.parseLong(timestampStr);
            } else {
                // Handle ISO format with nanoseconds
                String cleanTimestamp = timestampStr;
                if (timestampStr.length() > 19) { // If it has nanoseconds
                    cleanTimestamp = timestampStr.substring(0, 19); // Truncate to seconds precision
                }
                return Instant.from(isoFormatter.parse(cleanTimestamp)).getEpochSecond();
            }
        } catch (Exception e) {
            System.err.println("Error parsing timestamp: " + timestampStr);
            e.printStackTrace();
            return 0;
        }
    }
}
