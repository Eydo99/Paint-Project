package com.example.example1.Commands;

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
    public void undo() {

        if(undoStack.isEmpty()) {
            throw new IllegalStateException("undoStack is empty");
        }

        Command command = undoStack.pop();
        command.undo();
        redoStack.push(command);
    }

    public void redo() {
        if(redoStack.isEmpty()) {
            throw new IllegalStateException("redoStack is empty");
        }
        Command command = redoStack.pop();
        command.execute();
        undoStack.push(command);
    }
}
