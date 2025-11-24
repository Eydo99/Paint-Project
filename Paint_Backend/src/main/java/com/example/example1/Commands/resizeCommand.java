package com.example.example1.Commands;

import com.example.example1.Model.shape;

import java.util.Map;

public class resizeCommand implements Command {
    private shape shape;
    private double oldX, oldY,oldCenterX, oldCenterY;
    private double newX, newY,newCenterX, newCenterY;
    private Map<String,Object> oldProps,newProps;

    public resizeCommand(shape shape, double newX, double newY, double newCenterX, double newCenterY,Map<String,Object> newProps) {
        this.shape = shape;
        this.newX = newX;
        this.newY = newY;
        this.newCenterX = newCenterX;
        this.newCenterY = newCenterY;
        this.newProps = newProps;
        this.oldProps = shape.getProperties();
        this.oldX = shape.getX();
        this.oldY = shape.getY();
        this.oldCenterX = shape.getCenterX();
        this.oldCenterY = shape.getCenterY();
    }

    @Override
    public  void execute() {
        shape.resize(newX, newY, newCenterX, newCenterY, newProps);
    }

    @Override
    public void unExecute() {
        shape.resize(oldX, oldY, oldCenterX, oldCenterY, oldProps);
    }
}