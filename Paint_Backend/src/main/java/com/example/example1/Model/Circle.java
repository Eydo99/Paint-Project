package com.example.example1.Model;

import java.util.Map;

public class Circle extends shape {
    private double radius;

    @Override
    public void setprops(Map<String, Double> props) {
        this.x = props.get("x");
        this.y = props.get("y");
        this.radius=props.get("radius");
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }
}
