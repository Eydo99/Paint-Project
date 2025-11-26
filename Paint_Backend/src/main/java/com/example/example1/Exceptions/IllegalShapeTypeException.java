package com.example.example1.Exceptions;


public class IllegalShapeTypeException extends Exception {
    public IllegalShapeTypeException(String type){

        super("Shape type: " + type + " is not supported") ;
    }
}