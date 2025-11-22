package com.example.example1.Factory;

import com.example.example1.Model.Circle;
import com.example.example1.Model.Rectangle;
import com.example.example1.Model.shape;
import com.example.example1.exceptions.TypeNotFoundException;


public class shapeFactory {
    public shape createShape(String type) throws TypeNotFoundException {
        switch (type.toLowerCase()) {
            case "circle":
                return new Circle();
            case "rectangle":
                return new Rectangle();
            default:
                throw new TypeNotFoundException(type+" is invalid shape");
        }
    }
}
