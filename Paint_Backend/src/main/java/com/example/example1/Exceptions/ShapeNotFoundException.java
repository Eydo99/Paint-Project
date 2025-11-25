package com.example.example1.Exceptions;

public class ShapeNotFoundException extends Exception {
    public ShapeNotFoundException(int id){
        super("Shape {"+id+"} isn't found") ;
    }
}