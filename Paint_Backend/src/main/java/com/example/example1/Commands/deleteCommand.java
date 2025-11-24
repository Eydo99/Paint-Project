package com.example.example1.Commands;

import com.example.example1.Model.shape;

import java.util.List;

public class deleteCommand implements Command {
    private final shape shape;
    private final List<shape> shapes;

    public deleteCommand(List<shape> shapes, shape shape) {
        this.shape = shape;
        this.shapes = shapes;
    }

    public void execute() {
        shapes.remove(shape);
    }

    public void undo() {
        shapes.add(shape);
    }
}