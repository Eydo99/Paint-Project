package com.example.example1.Commands;

import com.example.example1.Model.shape;

import java.util.ArrayList;
import java.util.List;

public class addCommand implements Command {
    private final shape shape;
    private final List<shape> shapes;

    public addCommand(List<shape> shapes, shape shape) {
        this.shape = shape;
        this.shapes=shapes;
    }

    @Override
    public void execute() {
        shapes.add(shape);
    }
    public void undo() {
        shapes.remove(shape);
    }


}