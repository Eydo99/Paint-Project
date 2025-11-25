package com.example.example1.Exceptions;

import com.example.example1.Model.shape;

public class IllegalShapeTypeException extends Exception {
    public IllegalShapeTypeException(String type){

        super("Shape type: " + type + " is not supported") ;
    }
}