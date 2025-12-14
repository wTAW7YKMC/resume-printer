package com.resume.message.controller;

import com.resume.message.model.Message;
import com.resume.message.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resume/message")
@CrossOrigin(origins = "*")
public class MessageController {
    
    private final MessageService messageService;
    
    @Autowired
    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> saveMessage(@Valid @RequestBody Message message) {
        try {
            Message savedMessage = messageService.saveMessage(message);
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("msg", "留言成功");
            response.put("data", savedMessage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("msg", "留言失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllMessages() {
        try {
            List<Message> messages = messageService.getAllMessages();
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("data", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("msg", "获取留言列表失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}