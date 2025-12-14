import java.io.*;
import java.util.jar.*;

public class CreateJar {
    public static void main(String[] args) throws Exception {
        Manifest manifest = new Manifest();
        Attributes attributes = manifest.getMainAttributes();
        attributes.put(Attributes.Name.MANIFEST_VERSION, "1.0");
        attributes.put(Attributes.Name.MAIN_CLASS, "com.resume.message.StandaloneMessageApplication");
        
        JarOutputStream jar = new JarOutputStream(new FileOutputStream("resume-message-backend.jar"), manifest);
        
        // Add compiled classes
        addClass(jar, "com/resume/message/StandaloneMessageApplication.class");
        
        jar.close();
        System.out.println("JAR file created successfully: resume-message-backend.jar");
    }
    
    private static void addClass(JarOutputStream jar, String path) throws Exception {
        File file = new File("classes/" + path);
        if (file.exists()) {
            JarEntry entry = new JarEntry(path);
            jar.putNextEntry(entry);
            
            FileInputStream fis = new FileInputStream(file);
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                jar.write(buffer, 0, bytesRead);
            }
            
            fis.close();
            jar.closeEntry();
        }
    }
}