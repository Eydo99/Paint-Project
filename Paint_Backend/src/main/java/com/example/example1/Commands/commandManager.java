package com.example.example1.Commands;

// com.example.example1.Exceptions.UndoRedoException;
import com.example.example1.Exceptions.UndoRedoException;
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
        command.getShape().setUndoAvailable(canUndo());
        command.getShape().setRedoAvailable(canRedo());
        System.out.println("✅ Command executed: " + command.getAction() + " | Undo stack size: " + undoStack.size());
    }
    public shape undo() throws UndoRedoException {

        if(undoStack.isEmpty()) {
            System.out.println("❌ Undo stack is empty!");
            throw new UndoRedoException("Nothing to undo");
        }

        Command command = undoStack.pop();
        System.out.println("⏮️ Undoing: " + command.getAction() + " | Remaining in undo stack: " + undoStack.size());
        command.undo();
        redoStack.push(command);
        String reverseAction = getInverseAction(command.getAction());
        command.getShape().setAction(reverseAction);
        command.getShape().setUndoAvailable(canUndo());
        command.getShape().setRedoAvailable(canRedo());
        return command.getShape();
    }

    public shape redo() throws UndoRedoException {
        if(redoStack.isEmpty()) {
            System.out.println("❌ Redo stack is empty!");
            throw new UndoRedoException("Nothing to redo");
        }
        Command command = redoStack.pop();
        System.out.println("⏭️ Redoing: " + command.getAction() + " | Remaining in redo stack: " + redoStack.size());
        command.execute();
        undoStack.push(command);
        command.getShape().setAction(command.getAction());
        command.getShape().setUndoAvailable(canUndo());
        command.getShape().setRedoAvailable(canRedo());
        return command.getShape();
    }


    public void clear() {
        undoStack.clear();
        redoStack.clear();
        System.out.println("🗑️ Command history cleared");
    }


    // ✨ Helper: Get inverse action
    private String getInverseAction(String action) {
        return switch (action) {
            case "add" -> "remove";
            case "remove" -> "add";
            case "update" -> "update";
            default -> action;
        };
    }

   private boolean canUndo() {
        return !undoStack.isEmpty();
    }
   private boolean canRedo() {
        return !redoStack.isEmpty();
    }

}