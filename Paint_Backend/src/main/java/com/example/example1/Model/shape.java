package com.example.example1.Model;

import com.example.example1.DTO.moveDTO;

import java.util.Map;

public abstract class shape implements Cloneable {
    protected String type;
    protected int id;
    protected double x;
    protected double y;
    protected double centerX;
    protected double centerY;
    protected String fillColor;
    protected String outlineColor;
    protected int strokeWidth;
    protected double angle;

    public double getAngle() {
        return angle;
    }

    public void setAngle(double angle) {
        this.angle = angle;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getCenterY() {
        return centerY;
    }

    public void setCenterY(double centerY) {
        this.centerY = centerY;
    }

    public double getCenterX() {
        return centerX;
    }

    public void setCenterX(double centerX) {
        this.centerX = centerX;
    }


    public String getType() {
        return type;
    }

    public void setType(String name) {
        this.type = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public abstract void setProperties(Map<String, Object> props);

    public abstract Map<String, Object> getProperties();

    public String getFillColor() {
        return fillColor;
    }

    public void setFillColor(String fillColor) {
        this.fillColor = fillColor;
    }

    public String getOutlineColor() {
        return outlineColor;
    }

    public void setOutlineColor(String outlineColor) {
        this.outlineColor = outlineColor;
    }

    public int getStrokeWidth() {
        return strokeWidth;
    }

    public void setStrokeWidth(int strokeWidth) {
        this.strokeWidth = strokeWidth;
    }

    @Override
    public shape clone() {
        try
        {
            return (shape) super.clone();
        }
        catch (CloneNotSupportedException e)
        {
            throw new RuntimeException("clone not supported");
        }
    }

    public void move(double x, double y,double centerX,double centerY) {
        setX(x);
        setY(y);
        setCenterX(centerX);
        setCenterY(centerY);
    }
    public abstract void resize(double x, double y,double centerX,double centerY,Map<String,Object> props);

}
