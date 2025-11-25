package com.example.example1.shapeService;

import com.example.example1.Model.shape;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class JSONService {

    private final ObjectMapper objectMapper;

    public JSONService() {
        this.objectMapper = new ObjectMapper();
        // Enable pretty printing (formatted JSON)
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    /**
     * Save shapes to JSON file
     */
    public void saveShapesToJSON(List<shape> shapes, String filePath) throws IOException {
        
        // Validate input
        if (shapes == null || shapes.isEmpty()) {
            throw new IllegalArgumentException("Cannot save empty shape list");
        }
        
        if (filePath == null || filePath.trim().isEmpty()) {
            throw new IllegalArgumentException("File path cannot be empty");
        }

        try {
            File file = new File(filePath);
            
            // Check if directory exists, create if needed
            File parentDir = file.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                boolean created = parentDir.mkdirs();
                if (!created) {
                    throw new IOException("Failed to create directory: " + parentDir.getAbsolutePath());
                }
            }

            // Write shapes as JSON array
            objectMapper.writeValue(file, shapes);
            
            System.out.println("✓ Successfully saved " + shapes.size() + " shapes to: " + file.getAbsolutePath());
            
        } catch (IOException e) {
            throw new IOException("Failed to save JSON file: " + e.getMessage(), e);
        }
    }

    /**
     * Load shapes from JSON file
     */
    public List<shape> loadShapesFromJSON(String filePath) throws IOException {
        try {
            File file = new File(filePath);
            
            if (!file.exists()) {
                throw new IOException("File not found: " + filePath);
            }

            // Read JSON array into List<shape>
            List<shape> shapes = objectMapper.readValue(
                file, 
                objectMapper.getTypeFactory().constructCollectionType(List.class, shape.class)
            );
            
            System.out.println("✓ Successfully loaded " + shapes.size() + " shapes from: " + filePath);
            
            return shapes;
            
        } catch (IOException e) {
            throw new IOException("Failed to load JSON file: " + e.getMessage(), e);
        }
    }
}