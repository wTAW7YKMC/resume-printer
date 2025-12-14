import java.io.*;
import java.util.jar.*;
import java.util.zip.*;

public class CreateSqlServerAuthJar {
    public static void main(String[] args) throws Exception {
        System.out.println("Creating SQL Server Authentication JAR (no DLL required)...");
        
        // Create manifest
        Manifest manifest = new Manifest();
        manifest.getMainAttributes().putValue("Manifest-Version", "1.0");
        manifest.getMainAttributes().putValue("Main-Class", "com.resume.message.StandaloneMessageApplication");
        manifest.getMainAttributes().putValue("Class-Path", ".");
        
        // Create JAR file
        try (JarOutputStream jarOut = new JarOutputStream(new FileOutputStream("resume-message-sqlserver-auth.jar"), manifest)) {
            // Add application classes from current directory
            addClassToJar(jarOut, "StandaloneMessageApplication.class");
            addClassToJar(jarOut, "StandaloneMessageApplication$MessageHandler.class");
            addClassToJar(jarOut, "StandaloneMessageApplication$MessageListHandler.class");
            addClassToJar(jarOut, "StandaloneMessageApplication$HomeHandler.class");
            
            // Add JDBC driver classes if available
            addJDBCToJar(jarOut);
            
            // Add service files for JDBC driver
            addServiceFiles(jarOut);
        }
        
        System.out.println("SQL Server Authentication JAR created successfully: resume-message-sqlserver-auth.jar");
        
        // Update run.bat to use the new JAR
        updateRunBat();
        
        System.out.println("Updated run.bat to use the new JAR");
    }
    
    private static void addClassToJar(JarOutputStream jarOut, String className) throws Exception {
        File classFile = new File(className);
        if (classFile.exists()) {
            JarEntry entry = new JarEntry("com/resume/message/" + className);
            jarOut.putNextEntry(entry);
            
            try (FileInputStream fis = new FileInputStream(classFile)) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    jarOut.write(buffer, 0, bytesRead);
                }
            }
            
            jarOut.closeEntry();
            System.out.println("Added class: " + className);
        } else {
            System.err.println("Class file not found: " + className);
        }
    }
    
    private static void addJDBCToJar(JarOutputStream jarOut) throws Exception {
        File jdbcFile = new File("mssql-jdbc-11.2.2.jre17.jar");
        if (jdbcFile.exists() && jdbcFile.length() > 1000) { 
            System.out.println("Adding JDBC driver to JAR...");
            
            try (JarFile jdbcJar = new JarFile(jdbcFile)) {
                java.util.Enumeration<java.util.jar.JarEntry> entries = jdbcJar.entries();
                
                while (entries.hasMoreElements()) {
                    java.util.jar.JarEntry entry = entries.nextElement();
                    if (!entry.isDirectory() && !entry.getName().startsWith("META-INF/")) {
                        jarOut.putNextEntry(new JarEntry(entry.getName()));
                        
                        try (InputStream is = jdbcJar.getInputStream(entry)) {
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
            
            System.out.println("JDBC driver added to JAR successfully");
        } else {
            System.out.println("JDBC driver not available, creating JAR without embedded driver");
        }
    }
    
    private static void addServiceFiles(JarOutputStream jarOut) throws Exception {
        // Add service files for SQL Server driver
        String serviceContent = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
        
        JarEntry serviceEntry = new JarEntry("META-INF/services/java.sql.Driver");
        jarOut.putNextEntry(serviceEntry);
        jarOut.write(serviceContent.getBytes());
        jarOut.closeEntry();
        
        System.out.println("Added service file for JDBC driver");
    }
    
    private static void updateRunBat() throws Exception {
        String batContent = "@echo off\n" +
                           "chcp 65001 >nul\n" +
                           "echo Starting Resume Message Backend with SQL Server Authentication...\n" +
                           "echo.\n" +
                           "\n" +
                           "cd /d \"f:\\数智编程\\resume printer\\backend\\target\"\n" +
                           "\n" +
                           "echo Starting application...\n" +
                           "java -jar resume-message-sqlserver-auth.jar\n" +
                           "\n" +
                           "echo.\n" +
                           "echo Application stopped.\n" +
                           "pause\n";
        
        try (FileWriter writer = new FileWriter("run.bat")) {
            writer.write(batContent);
        }
    }
}