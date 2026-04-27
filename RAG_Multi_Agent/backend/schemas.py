from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Assistants
class AssistantBase(BaseModel):
    name: str
    instructions: str
    description: Optional[str] = None

class AssistantCreate(AssistantBase):
    pass

class Assistant(AssistantBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Documents
class DocumentBase(BaseModel):
    filename: str

class Document(DocumentBase):
    id: int
    assistant_id: int
    filepath: str
    created_at: datetime

    class Config:
        from_attributes = True

# Messages
class MessageBase(BaseModel):
    role: str
    content: str
    citations: Optional[str] = None

class MessageCreateRequest(BaseModel):
    content: str

class Message(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Conversations
class ConversationBase(BaseModel):
    title: str

class ConversationCreate(BaseModel):
    assistant_id: int
    title: Optional[str] = "New Chat"

class Conversation(ConversationBase):
    id: int
    assistant_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationWithMessages(Conversation):
    messages: List[Message] = []
