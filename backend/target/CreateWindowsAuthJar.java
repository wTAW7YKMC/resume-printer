import java.io.*;
import java.util.jar.*;
import java.util.zip.*;
import java.net.URL;
import java.nio.file.*;
import java.nio.channels.Channels;
import java.nio.channels.FileChannel;

public class CreateWindowsAuthJar {
    public static void main(String[] args) throws Exception {
        System.out.println("Creating Windows Authentication JAR with embedded DLL...");
        
        // Download sqljdbc_auth.dll if not present
        File dllFile = downloadAuthDll();
        
        // Create manifest
        Manifest manifest = new Manifest();
        manifest.getMainAttributes().putValue("Manifest-Version", "1.0");
        manifest.getMainAttributes().putValue("Main-Class", "com.resume.message.StandaloneMessageApplication");
        manifest.getMainAttributes().putValue("Class-Path", ".");
        
        // Create JAR file
        try (JarOutputStream jarOut = new JarOutputStream(new FileOutputStream("resume-message-windows-auth.jar"), manifest)) {
            // Add application classes from current directory
            addClassToJar(jarOut, "StandaloneMessageApplication.class");
            addClassToJar(jarOut, "StandaloneMessageApplication$MessageHandler.class");
            addClassToJar(jarOut, "StandaloneMessageApplication$MessageListHandler.class");
            addClassToJar(jarOut, "StandaloneMessageApplication$HomeHandler.class");
            
            // Add JDBC driver classes if available
            addJDBCToJar(jarOut);
            
            // Add service files for JDBC driver
            addServiceFiles(jarOut);
            
            // Add sqljdbc_auth.dll to JAR
            if (dllFile != null && dllFile.exists()) {
                addFileToJar(jarOut, dllFile, "native/sqljdbc_auth.dll");
                System.out.println("Added sqljdbc_auth.dll to JAR");
            } else {
                System.out.println("Warning: sqljdbc_auth.dll not available, JAR created without embedded DLL");
            }
        }
        
        System.out.println("Windows Authentication JAR created successfully: resume-message-windows-auth.jar");
        
        // Update run.bat to use the new JAR
        updateRunBat();
        
        System.out.println("Updated run.bat to use the new JAR");
    }
    
    private static File downloadAuthDll() throws Exception {
        String dllUrl = "https://github.com/microsoft/mssql-jdbc/releases/download/v11.2.2/sqljdbc_11.2.2_chi/sqljdbc_auth_11.2.2_x64.dll";
        String fileName = "sqljdbc_auth.dll";
        File dllFile = new File(fileName);
        
        // Check if DLL already exists
        if (dllFile.exists() && dllFile.length() > 1000) {
            System.out.println("sqljdbc_auth.dll already exists, skipping download");
            return dllFile;
        }
        
        System.out.println("Downloading sqljdbc_auth.dll...");
        
        try {
            URL url = new URL(dllUrl);
            try (InputStream in = url.openStream();
                 FileOutputStream out = new FileOutputStream(dllFile)) {
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }
            
            if (dllFile.exists() && dllFile.length() > 1000) {
                System.out.println("sqljdbc_auth.dll downloaded successfully");
                return dllFile;
            } else {
                System.err.println("Downloaded sqljdbc_auth.dll is invalid");
                return null;
            }
        } catch (Exception e) {
            System.err.println("Failed to download sqljdbc_auth.dll: " + e.getMessage());
            
            // Try alternative approach - create a placeholder file
            System.out.println("Creating placeholder for sqljdbc_auth.dll (user will need to add it manually)");
            try (FileWriter writer = new FileWriter(dllFile)) {
                writer.write("# This is a placeholder for sqljdbc_auth.dll\n");
                writer.write("# Please download the x64 version of sqljdbc_auth.dll from Microsoft\n");
                writer.write("# And replace this file with the actual DLL\n");
            }
            return null;
        }
    }
    
    private static void addFileToJar(JarOutputStream jarOut, File file, String jarPath) throws Exception {
        JarEntry entry = new JarEntry(jarPath);
        jarOut.putNextEntry(entry);
        
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                jarOut.write(buffer, 0, bytesRead);
            }
        }
        
        jarOut.closeEntry();
        System.out.println("Added file to JAR: " + jarPath);
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
                           "echo Starting Resume Message Backend with Windows Authentication...\n" +
                           "echo.\n" +
                           "\n" +
                           "cd /d \"f:\\数智编程\\resume printer\\backend\\target\"\n" +
                           "\n" +
                           "echo Starting application...\n" +
                           "java -jar resume-message-windows-auth.jar\n" +
                           "\n" +
                           "echo.\n" +
                           "echo Application stopped.\n" +
                           "pause\n";
        
        try (FileWriter writer = new FileWriter("run.bat")) {
            writer.write(batContent);
        }
    }
}