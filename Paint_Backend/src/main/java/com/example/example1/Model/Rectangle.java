package com.example.example1.Model;

import java.util.Map;

public class Rectangle extends shape {

    private double length;
    private double width;

    @Override
    public void setprops(Map<String,Double> props) {
        this.length = props.get("length");
        this.width = props.get("width");
        this.x = props.get("x");
        this.y = props.get("y");
    }

    public double getLength() {
        return length;
    }

    public void setLength(double length) {
        this.length = length;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }
}
