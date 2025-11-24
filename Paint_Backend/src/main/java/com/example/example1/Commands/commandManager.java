package com.example.example1.Commands;

import com.example.example1.Model.shape;
import org.springframework.stereotype.Service;

import java.util.Stack;

@Service
public class commandManager {

    private final Stack<Command>undoStack = new Stack<>();
    private final Stack<Command>redoStack = new Stack<>();

    public void execute(Command command) {
        command.execute();
        undoStack.push(command);
    }
    public shape undo() {

        if(undoStack.isEmpty()) {
            throw new IllegalStateException("undoStack is empty");
        }

        Command command = undoStack.pop();
        command.undo();
        redoStack.push(command);
        return command.getShape();
    }

    public shape redo() {
        if(redoStack.isEmpty()) {
            throw new IllegalStateException("redoStack is empty");
        }
        Command command = redoStack.pop();
        command.execute();
        undoStack.push(command);
        return command.getShape();
    }


    public void clear() {
        undoStack.clear();
        redoStack.clear();
    }
}