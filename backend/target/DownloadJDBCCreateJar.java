import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import java.util.jar.Manifest;

public class DownloadJDBCCreateJar {
    public static void main(String[] args) throws Exception {
        System.out.println("Creating complete JAR with SQL Server JDBC driver...");
        
        // Download JDBC driver
        System.out.println("Downloading SQL Server JDBC driver...");
        downloadJDBCDriver();
        
        // Create complete JAR
        System.out.println("Creating complete JAR...");
        createCompleteJar();
        
        System.out.println("Complete JAR created successfully: resume-message-complete.jar");
    }
    
    private static void downloadJDBCDriver() throws Exception {
        // Using a known stable version of SQL Server JDBC driver
        String jdbcUrl = "https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/11.2.2.jre17/mssql-jdbc-11.2.2.jre17.jar";
        String jdbcFileName = "mssql-jdbc-11.2.2.jre17.jar";
        
        try {
            System.out.println("Connecting to download JDBC driver...");
            URL url = new URL(jdbcUrl);
            URLConnection connection = url.openConnection();
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(30000);
            
            try (InputStream in = connection.getInputStream()) {
                Files.copy(in, Paths.get(jdbcFileName), StandardCopyOption.REPLACE_EXISTING);
                System.out.println("JDBC driver downloaded successfully: " + jdbcFileName);
            }
        } catch (Exception e) {
            System.err.println("Failed to download JDBC driver: " + e.getMessage());
            System.err.println("Creating a placeholder file instead...");
            
            // Create a placeholder file
            try (PrintWriter out = new PrintWriter(jdbcFileName)) {
                out.println("# Placeholder for SQL Server JDBC driver");
                out.println("# Please download manually from: " + jdbcUrl);
            }
        }
    }
    
    private static void createCompleteJar() throws Exception {
        // Create manifest
        Manifest manifest = new Manifest();
        manifest.getMainAttributes().putValue("Manifest-Version", "1.0");
        manifest.getMainAttributes().putValue("Main-Class", "com.resume.message.StandaloneMessageApplication");
        manifest.getMainAttributes().putValue("Class-Path", "mssql-jdbc-11.2.2.jre17.jar");
        
        // Create JAR file
        try (JarOutputStream jarOut = new JarOutputStream(new FileOutputStream("resume-message-complete.jar"), manifest)) {
            // Add application classes
            addClassToJar(jarOut, "com/resume/message/StandaloneMessageApplication.class");
            
            // Add JDBC driver classes if available
            addJDBCToJar(jarOut);
        }
    }
    
    private static void addClassToJar(JarOutputStream jarOut, String classPath) throws Exception {
        File classFile = new File("classes/" + classPath);
        if (classFile.exists()) {
            JarEntry entry = new JarEntry(classPath);
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
    }
    
    private static void addJDBCToJar(JarOutputStream jarOut) throws Exception {
        File jdbcFile = new File("mssql-jdbc-11.2.2.jre17.jar");
        if (jdbcFile.exists() && jdbcFile.length() > 1000) { // Check if it's a real JAR, not placeholder
            System.out.println("Adding JDBC driver to JAR...");
            
            // Read the JDBC JAR and add its contents to our JAR
            try (java.util.jar.JarFile jdbcJar = new java.util.jar.JarFile(jdbcFile)) {
                java.util.Enumeration<java.util.jar.JarEntry> entries = jdbcJar.entries();
                
                while (entries.hasMoreElements()) {
                    java.util.jar.JarEntry entry = entries.nextElement();
                    if (!entry.isDirectory()) {
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
}