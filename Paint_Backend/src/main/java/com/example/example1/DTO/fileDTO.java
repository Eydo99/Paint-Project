package com.example.example1.DTO;

public class fileDTO {
    
    private String filePath;
    private String fileName;
    
    public fileDTO() {
    }
    
    
    public fileDTO(String filePath, String fileName) {
        this.filePath = filePath.replaceAll("\\","\\\\");
        this.fileName = fileName;
    }
    
    
    public String getFilePath() {
        return filePath;
    }
    
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getFullPath() {
        if (filePath == null || fileName == null) {
            return null;
        }
        // Add separator if not present
        return (this.filePath+"\\"+this.fileName ) ;
    }
}