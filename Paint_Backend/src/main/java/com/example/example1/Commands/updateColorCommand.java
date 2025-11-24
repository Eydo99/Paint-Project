package com.example.example1.Commands;

import com.example.example1.Model.shape;

public class updateColorCommand implements Command {

    public final shape shape;
    private final String oldFillColor, oldOutlineColor,newFillColor,newOutlineColor;
    private final int newStrokeWidth,oldStrokeWidth;

    public updateColorCommand(shape shape, String newFillColor, String newOutlineColor,int newStrokeWidth) {
        this.shape = shape;
        this.newFillColor = newFillColor;
        this.newOutlineColor = newOutlineColor;
        this.newStrokeWidth=newStrokeWidth;
        this.oldFillColor=shape.getFillColor();
        this.oldOutlineColor=shape.getOutlineColor();
        this.oldStrokeWidth= shape.getStrokeWidth();
    }

    public void execute() {
        shape.upadteColor(newFillColor,newOutlineColor,newStrokeWidth);
    }
    public void undo() {
        shape.upadteColor(oldFillColor,oldOutlineColor,oldStrokeWidth);
    }

    @Override
    public shape getShape() {
        return shape;
    }

}