package com.example.example1.Commands;

import com.example.example1.Model.shape;

import java.util.HashMap;
import java.util.Map;

public class updateCommand implements Command {
    public final shape shape;
    private final double oldX, oldY, oldCenterX, oldCenterY;
    private final String oldFillColor, oldOutlineColor;
    private final String newOutlineColor,newFillColor;
    private final int oldStrokeWidth,newStrokeWidth;
    private final double newX, newY, newCenterX, newCenterY;
    private final Map<String, Object> oldProps, newProps;
    private final double oldAngle, newAngle;

    public updateCommand(shape shape, double newX, double newY, double newCenterX, double newCenterY,double newAngle, Map<String, Object> newProps,String newFillColor,String newOutlineColor,int newStrokeWidth) {
        this.shape = shape;
        this.newX = newX;
        this.newY = newY;
        this.newCenterX = newCenterX;
        this.newCenterY = newCenterY;
        this.newAngle = newAngle;
        this.newProps = new HashMap<>(newProps);
        this.newFillColor = newFillColor;
        this.newOutlineColor = newOutlineColor;
        this.newStrokeWidth=newStrokeWidth;
        this.oldX = shape.getX();
        this.oldY = shape.getY();
        this.oldCenterX = shape.getCenterX();
        this.oldCenterY = shape.getCenterY();
        this.oldAngle = shape.getAngle();
        this.oldProps =new HashMap<>(shape.getProperties());
        this.oldFillColor = shape.getFillColor();
        this.oldOutlineColor = shape.getOutlineColor();
        this.oldStrokeWidth= shape.getStrokeWidth();
    }

    @Override
    public void execute() {
        shape.updateShape(newX,newY,newCenterX,newCenterY,newAngle);
        shape.updateProperties(newProps);
        shape.updateColor(newFillColor,newOutlineColor,newStrokeWidth);
    }

    @Override
    public void undo() {
        shape.updateShape(oldX,oldY,oldCenterX,oldCenterY,oldAngle);
        shape.updateProperties(oldProps);
        shape.updateColor(oldFillColor,oldOutlineColor,oldStrokeWidth);
    }

    @Override
    public shape getShape() {
        return shape;
    }
}