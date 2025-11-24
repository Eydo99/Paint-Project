package com.example.example1.Factory;

import com.example.example1.Model.*;
import org.springframework.stereotype.Service;

@Service
public class shapeFactory {
    public shape createShape(String type) {
        return switch (type.toLowerCase()) {
            case "circle" -> new Circle();
            case "rectangle" -> new Rectangle();
            case "ellipse" -> new Ellipse();
            case "square" -> new Square();
            case "triangle" -> new Triangle();
            case "line" -> new Line();
           // case "text" -> new Text();
            default -> null;
        };
    }
}
