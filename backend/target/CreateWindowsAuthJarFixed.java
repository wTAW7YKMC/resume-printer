import java.io.*;
import java.util.jar.*;
import java.util.zip.*;
import java.net.URL;
import java.nio.file.*;
import java.nio.channels.Channels;
import java.nio.channels.FileChannel;
import javax.net.ssl.*;
import java.security.cert.X509Certificate;

public class CreateWindowsAuthJarFixed {
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
            if (dllFile != null && dllFile.exists() && dllFile.length() > 1000) {
                addFileToJar(jarOut, dllFile, "native/sqljdbc_auth.dll");
                System.out.println("Added sqljdbc_auth.dll to JAR");
            } else {
                System.out.println("Warning: sqljdbc_auth.dll not available, JAR created without embedded DLL");
                System.out.println("You can manually add the DLL later using the AddDllToJar tool");
            }
        }
        
        System.out.println("Windows Authentication JAR created successfully: resume-message-windows-auth.jar");
        
        // Create a tool for adding DLL to existing JAR
        createDllAddTool();
        
        // Update run.bat to use the new JAR
        updateRunBat();
        
        System.out.println("Updated run.bat to use the new JAR");
        System.out.println("If DLL download failed, you can:");
        System.out.println("1. Download sqljdbc_auth.dll manually from Microsoft");
        System.out.println("2. Place it in the same directory as this JAR");
        System.out.println("3. Run: java AddDllToJar sqljdbc_auth.dll resume-message-windows-auth.jar");
    }
    
    private static File downloadAuthDll() throws Exception {
        // Try multiple download sources
        String[] dllUrls = {
            "https://github.com/microsoft/mssql-jdbc/releases/download/v11.2.2/sqljdbc_11.2.2_chi/sqljdbc_auth_11.2.2_x64.dll",
            "https://github.com/microsoft/mssql-jdbc/releases/download/v11.2.2/sqljdbc_11.2.2_enu/sqljdbc_auth_11.2.2_x64.dll",
            "https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/11.2.2.jre17/mssql-jdbc-11.2.2.jre17-auth-x64.dll"
        };
        
        String fileName = "sqljdbc_auth.dll";
        File dllFile = new File(fileName);
        
        // Check if DLL already exists
        if (dllFile.exists() && dllFile.length() > 1000) {
            System.out.println("sqljdbc_auth.dll already exists, skipping download");
            return dllFile;
        }
        
        // Disable SSL certificate validation for download
        disableSSLValidation();
        
        // Try each URL
        for (String dllUrl : dllUrls) {
            System.out.println("Attempting to download sqljdbc_auth.dll from: " + dllUrl);
            
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
                    dllFile.delete();
                }
            } catch (Exception e) {
                System.err.println("Failed to download from " + dllUrl + ": " + e.getMessage());
                if (dllFile.exists()) {
                    dllFile.delete();
                }
            }
        }
        
        // All download attempts failed
        System.err.println("Failed to download sqljdbc_auth.dll from all sources");
        
        // Create a placeholder file with instructions
        System.out.println("Creating placeholder for sqljdbc_auth.dll (user will need to add it manually)");
        try (FileWriter writer = new FileWriter(dllFile)) {
            writer.write("# This is a placeholder for sqljdbc_auth.dll\n");
            writer.write("# Please download the x64 version of sqljdbc_auth.dll from Microsoft\n");
            writer.write("# And replace this file with the actual DLL\n");
            writer.write("# You can download it from: https://docs.microsoft.com/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server\n");
        }
        return null;
    }
    
    private static void disableSSLValidation() throws Exception {
        // Create a trust manager that accepts all certificates
        TrustManager[] trustAllCerts = new TrustManager[] {
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() {
                    return null;
                }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {
                }
                public void checkServerTrusted(X509Certificate[] certs, String authType) {
                }
            }
        };
        
        // Install the all-trusting trust manager
        SSLContext sc = SSLContext.getInstance("SSL");
        sc.init(null, trustAllCerts, new java.security.SecureRandom());
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        
        // Create all-trusting host name verifier
        HostnameVerifier allHostsValid = (hostname, session) -> true;
        
        // Install the all-trusting host verifier
        HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
    }
    
    private static void createDllAddTool() throws Exception {
        String toolCode = 
            "import java.io.*;\n" +
            "import java.util.jar.*;\n" +
            "\n" +
            "public class AddDllToJar {\n" +
            "    public static void main(String[] args) throws Exception {\n" +
            "        if (args.length != 2) {\n" +
            "            System.out.println(\"Usage: java AddDllToJar <dllFilePath> <jarFilePath>\");\n" +
            "            System.out.println(\"Example: java AddDllToJar sqljdbc_auth.dll resume-message-windows-auth.jar\");\n" +
            "            return;\n" +
            "        }\n" +
            "        \n" +
            "        String dllPath = args[0];\n" +
            "        String jarPath = args[1];\n" +
            "        \n" +
            "        File dllFile = new File(dllPath);\n" +
            "        if (!dllFile.exists() || dllFile.length() < 1000) {\n" +
            "            System.err.println(\"Error: Invalid DLL file: \" + dllPath);\n" +
            "            return;\n" +
            "        }\n" +
            "        \n" +
            "        // Read the existing JAR\n" +
            "        File jarFile = new File(jarPath);\n" +
            "        if (!jarFile.exists()) {\n" +
            "            System.err.println(\"Error: JAR file not found: \" + jarPath);\n" +
            "            return;\n" +
            "        }\n" +
            "        \n" +
            "        // Create a temporary JAR file\n" +
            "        File tempJar = new File(jarPath + \".tmp\");\n" +
            "        \n" +
            "        try (JarFile jarIn = new JarFile(jarFile);\n" +
            "             JarOutputStream jarOut = new JarOutputStream(new FileOutputStream(tempJar))) {\n" +
            "            \n" +
            "            // Copy all entries from the original JAR\n" +
            "            java.util.Enumeration<java.util.jar.JarEntry> entries = jarIn.entries();\n" +
            "            while (entries.hasMoreElements()) {\n" +
            "                java.util.jar.JarEntry entry = entries.nextElement();\n" +
            "                jarOut.putNextEntry(new JarEntry(entry.getName()));\n" +
            "                \n" +
            "                try (InputStream is = jarIn.getInputStream(entry)) {\n" +
            "                    byte[] buffer = new byte[1024];\n" +
            "                    int bytesRead;\n" +
            "                    while ((bytesRead = is.read(buffer)) != -1) {\n" +
            "                        jarOut.write(buffer, 0, bytesRead);\n" +
            "                    }\n" +
            "                }\n" +
            "                \n" +
            "                jarOut.closeEntry();\n" +
            "            }\n" +
            "            \n" +
            "            // Add the DLL\n" +
            "            JarEntry dllEntry = new JarEntry(\"native/sqljdbc_auth.dll\");\n" +
            "            jarOut.putNextEntry(dllEntry);\n" +
            "            \n" +
            "            try (FileInputStream fis = new FileInputStream(dllFile)) {\n" +
            "                byte[] buffer = new byte[1024];\n" +
            "                int bytesRead;\n" +
            "                while ((bytesRead = fis.read(buffer)) != -1) {\n" +
            "                    jarOut.write(buffer, 0, bytesRead);\n" +
            "                }\n" +
            "            }\n" +
            "            \n" +
            "            jarOut.closeEntry();\n" +
            "        }\n" +
            "        \n" +
            "        // Replace the original JAR with the temporary one\n" +
            "        if (jarFile.delete()) {\n" +
            "            if (tempJar.renameTo(jarFile)) {\n" +
            "                System.out.println(\"Successfully added DLL to JAR: \" + jarPath);\n" +
            "            } else {\n" +
            "                System.err.println(\"Error: Could not rename temporary JAR file\");\n" +
            "            }\n" +
            "        } else {\n" +
            "            System.err.println(\"Error: Could not delete original JAR file\");\n" +
            "        }\n" +
            "    }\n" +
            "}\n";
        
        try (FileWriter writer = new FileWriter("AddDllToJar.java")) {
            writer.write(toolCode);
        }
        
        // Compile the tool
        Process compileProcess = Runtime.getRuntime().exec("javac AddDllToJar.java");
        compileProcess.waitFor();
        
        if (compileProcess.exitValue() == 0) {
            System.out.println("Created AddDllToJar tool for manual DLL addition");
        } else {
            System.err.println("Failed to compile AddDllToJar tool");
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