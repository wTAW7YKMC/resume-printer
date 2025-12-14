import java.io.*;
import java.net.URL;
import java.nio.file.*;
import java.util.*;
import java.util.jar.*;
import java.util.zip.ZipEntry;

public class CreateJsonMessageJar {
    private static final String GSON_VERSION = "2.9.0";
    private static final String GSON_JAR_URL = "https://repo1.maven.org/maven2/com/google/code/gson/gson/" + GSON_VERSION + "/gson-" + GSON_VERSION + ".jar";
    
    public static void main(String[] args) throws Exception {
        System.out.println("Creating JSON Message Application JAR...");
        
        // 下载Gson库
        System.out.println("Downloading Gson library...");
        downloadGsonLibrary();
        
        // 创建manifest
        Manifest manifest = new Manifest();
        manifest.getMainAttributes().putValue("Manifest-Version", "1.0");
        manifest.getMainAttributes().putValue("Main-Class", "com.resume.message.JsonMessageApplication");
        manifest.getMainAttributes().putValue("Class-Path", ".");
        
        // 创建JAR文件
        try (JarOutputStream jarOut = new JarOutputStream(new FileOutputStream("resume-message-json.jar"), manifest)) {
            // 添加应用程序类
            addClassToJar(jarOut, "com/resume/message/JsonMessageApplication.class");
            addClassToJar(jarOut, "com/resume/message/JsonMessageApplication$Message.class");
            addClassToJar(jarOut, "com/resume/message/JsonMessageApplication$ApiResponse.class");
            addClassToJar(jarOut, "com/resume/message/JsonMessageApplication$MessageHandler.class");
            addClassToJar(jarOut, "com/resume/message/JsonMessageApplication$MessageListHandler.class");
            addClassToJar(jarOut, "com/resume/message/JsonMessageApplication$HomeHandler.class");
            
            // 添加Gson库
            addGsonToJar(jarOut);
            
            // 添加Gson服务文件
            addGsonServiceFiles(jarOut);
        }
        
        System.out.println("JSON Message Application JAR created successfully: resume-message-json.jar");
        
        // 更新run.bat
        updateRunBat();
        
        System.out.println("Updated run.bat to use the new JAR");
    }
    
    // 下载Gson库
    private static void downloadGsonLibrary() throws Exception {
        Path gsonJar = Paths.get("gson-" + GSON_VERSION + ".jar");
        if (Files.exists(gsonJar)) {
            System.out.println("Gson library already exists, skipping download");
            return;
        }
        
        System.out.println("Downloading from: " + GSON_JAR_URL);
        try (InputStream in = new URL(GSON_JAR_URL).openStream()) {
            Files.copy(in, gsonJar, StandardCopyOption.REPLACE_EXISTING);
        }
        System.out.println("Downloaded: " + gsonJar.getFileName());
    }
    
    // 添加类到JAR
    private static void addClassToJar(JarOutputStream jarOut, String className) throws IOException {
        File classFile = new File(className);
        if (!classFile.exists()) {
            System.out.println("Warning: " + className + " not found, skipping");
            return;
        }
        
        JarEntry entry = new JarEntry(className);
        jarOut.putNextEntry(entry);
        
        try (FileInputStream fis = new FileInputStream(classFile)) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                jarOut.write(buffer, 0, bytesRead);
            }
        }
        
        jarOut.closeEntry();
    }
    
    // 添加Gson库到JAR
    private static void addGsonToJar(JarOutputStream jarOut) throws IOException {
        Path gsonJar = Paths.get("gson-" + GSON_VERSION + ".jar");
        if (!Files.exists(gsonJar)) {
            System.out.println("Warning: gson-" + GSON_VERSION + ".jar not found, skipping");
            return;
        }
        
        try (java.util.zip.ZipFile zipFile = new java.util.zip.ZipFile(gsonJar.toFile())) {
            Enumeration<? extends java.util.zip.ZipEntry> entries = zipFile.entries();
            
            while (entries.hasMoreElements()) {
                java.util.zip.ZipEntry entry = entries.nextElement();
                
                // 跳过META-INF/MANIFEST.MF，避免冲突
                if (entry.getName().equals("META-INF/MANIFEST.MF")) {
                    continue;
                }
                
                JarEntry jarEntry = new JarEntry(entry.getName());
                jarOut.putNextEntry(jarEntry);
                
                try (InputStream is = zipFile.getInputStream(entry)) {
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = is.read(buffer)) != -1) {
                        jarOut.write(buffer, 0, bytesRead);
                    }
                }
                
                jarOut.closeEntry();
            }
        }
    }
    
    // 添加Gson服务文件
    private static void addGsonServiceFiles(JarOutputStream jarOut) throws IOException {
        // 添加TypeAdapter服务文件
        String serviceContent = "com.google.gson.TypeAdapterFactory\n";
        addServiceFile(jarOut, "META-INF/services/com.google.gson.TypeAdapterFactory", serviceContent);
    }
    
    // 添加服务文件到JAR
    private static void addServiceFile(JarOutputStream jarOut, String path, String content) throws IOException {
        JarEntry entry = new JarEntry(path);
        jarOut.putNextEntry(entry);
        jarOut.write(content.getBytes());
        jarOut.closeEntry();
    }
    
    // 更新run.bat
    private static void updateRunBat() throws IOException {
        String runBatContent = "@echo off\n" +
                "chcp 65001 >nul\n" +
                "echo Starting Resume Message Backend (JSON Storage)...\n" +
                "echo.\n" +
                "\n" +
                "cd /d \"f:\\数智编程\\resume printer\\backend\\target\"\n" +
                "\n" +
                "echo Starting application...\n" +
                "java -jar resume-message-json.jar\n" +
                "\n" +
                "echo.\n" +
                "echo Application stopped.\n" +
                "pause\n";
        
        try (FileWriter writer = new FileWriter("run.bat")) {
            writer.write(runBatContent);
        }
    }
}