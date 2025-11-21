package com.example.example1.Factory;

import com.example.example1.Model.Circle;
import com.example.example1.Model.Rectangle;
import com.example.example1.Model.shape;

public class shapeFactory {
    public shape createShape(String type) {
        switch (type.toLowerCase()) {
            case "circle":
                return new Circle();
            case "rectangle":
                return new Rectangle();
            default:
                return null;
        }
    }
}
