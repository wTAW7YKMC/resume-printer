package com.resume.message.service;

import com.resume.message.model.Message;
import com.resume.message.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {
    
    private final MessageRepository messageRepository;
    
    @Autowired
    public MessageServiceImpl(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }
    
    @Override
    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }
    
    @Override
    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByCreateTimeDesc();
    }
}