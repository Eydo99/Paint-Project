package com.example.example1.Commands;

import com.example.example1.Model.shape;

import java.util.HashMap;
import java.util.Map;

public class updateCommand implements Command {
    public final shape shape;
    private final double oldX, oldY, oldCenterX, oldCenterY;
    private final double newX, newY, newCenterX, newCenterY;
    private final Map<String, Object> oldProps, newProps;
    private final double oldAngle, newAngle;

    public updateCommand(shape shape, double newX, double newY, double newCenterX, double newCenterY,double newAngle, Map<String, Object> newProps) {
        this.shape = shape;
        this.newX = newX;
        this.newY = newY;
        this.newCenterX = newCenterX;
        this.newCenterY = newCenterY;
        this.newAngle = newAngle;
        this.newProps = new HashMap<>(newProps);
        this.oldX = shape.getX();
        this.oldY = shape.getY();
        this.oldCenterX = shape.getCenterX();
        this.oldCenterY = shape.getCenterY();
        this.oldAngle = shape.getAngle();
        this.oldProps =new HashMap<>(shape.getProperties());
    }

    @Override
    public void execute() {
        shape.update(newX,newY,newCenterX,newCenterY,newAngle,newProps);
    }

    @Override
    public void undo() {
        shape.update(oldX,oldY,oldCenterX,oldCenterY,oldAngle,oldProps);
    }

    @Override
    public shape getShape() {
        return shape;
    }
}