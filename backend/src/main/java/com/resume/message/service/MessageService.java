package com.resume.message.service;

import com.resume.message.model.Message;
import java.util.List;

public interface MessageService {
    
    Message saveMessage(Message message);
    
    List<Message> getAllMessages();
}