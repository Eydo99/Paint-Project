package com.example.example1.Commands;

import com.example.example1.Model.shape;

public interface Command {
    void execute();
    void undo();
    shape getShape();
}
