package com.example.example1.Commands;

import com.example.example1.Model.shape;

public class moveCommand implements Command {
    private shape shape;
    private double oldX, oldY,oldCenterX, oldCenterY;
    private double newX, newY,newCenterX, newCenterY;

    public moveCommand(shape shape,double newX, double newY, double newCenterX, double newCenterY) {
        this.shape = shape;
        this.newX = newX;
        this.newY = newY;
        this.newCenterX = newCenterX;
        this.newCenterY = newCenterY;
        this.oldX = shape.getX();
        this.oldY = shape.getY();
        this.oldCenterX = shape.getCenterX();
        this.oldCenterY = shape.getCenterY();
    }

    @Override
    public void execute() {
        shape.move(this.newX, this.newY,this.newCenterX,this.newCenterY);
    }

    @Override
    public void unExecute() {
        shape.move(this.oldX, this.oldY,this.oldCenterX,this.oldCenterY);
    }

}
