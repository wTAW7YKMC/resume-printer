import java.io.*;
import java.util.jar.*;

public class AddDllToJar {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.out.println("Usage: java AddDllToJar <dllFilePath> <jarFilePath>");
            System.out.println("Example: java AddDllToJar sqljdbc_auth.dll resume-message-windows-auth.jar");
            return;
        }
        
        String dllPath = args[0];
        String jarPath = args[1];
        
        File dllFile = new File(dllPath);
        if (!dllFile.exists() || dllFile.length() < 1000) {
            System.err.println("Error: Invalid DLL file: " + dllPath);
            return;
        }
        
        // Read the existing JAR
        File jarFile = new File(jarPath);
        if (!jarFile.exists()) {
            System.err.println("Error: JAR file not found: " + jarPath);
            return;
        }
        
        // Create a temporary JAR file
        File tempJar = new File(jarPath + ".tmp");
        
        try (JarFile jarIn = new JarFile(jarFile);
             JarOutputStream jarOut = new JarOutputStream(new FileOutputStream(tempJar))) {
            
            // Copy all entries from the original JAR
            java.util.Enumeration<java.util.jar.JarEntry> entries = jarIn.entries();
            while (entries.hasMoreElements()) {
                java.util.jar.JarEntry entry = entries.nextElement();
                jarOut.putNextEntry(new JarEntry(entry.getName()));
                
                try (InputStream is = jarIn.getInputStream(entry)) {
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = is.read(buffer)) != -1) {
                        jarOut.write(buffer, 0, bytesRead);
                    }
                }
                
                jarOut.closeEntry();
            }
            
            // Add the DLL
            JarEntry dllEntry = new JarEntry("native/sqljdbc_auth.dll");
            jarOut.putNextEntry(dllEntry);
            
            try (FileInputStream fis = new FileInputStream(dllFile)) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    jarOut.write(buffer, 0, bytesRead);
                }
            }
            
            jarOut.closeEntry();
        }
        
        // Replace the original JAR with the temporary one
        if (jarFile.delete()) {
            if (tempJar.renameTo(jarFile)) {
                System.out.println("Successfully added DLL to JAR: " + jarPath);
            } else {
                System.err.println("Error: Could not rename temporary JAR file");
            }
        } else {
            System.err.println("Error: Could not delete original JAR file");
        }
    }
}
