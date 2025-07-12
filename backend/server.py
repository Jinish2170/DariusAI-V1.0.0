from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Chat Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    avatar: str

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SendMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    title: Optional[str] = None

class StreamChatResponse(BaseModel):
    content: str
    is_final: bool = False

# Constants
GEMINI_API_KEY = "AIzaSyBqf1ApgKXO0iRrMCVNrpnJGZaXk5zyMts"
AI_AVATAR = "https://images.unsplash.com/photo-1631882456892-54a30e92fe4f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxyb2JvdCUyMGF2YXRhcnxlbnwwfHx8fDE3NTIzMTY5NDh8MA&ixlib=rb-4.1.0&q=85"
USER_AVATAR = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyfGVufDB8fHx8MTc1MjMxNjk1N3ww&ixlib=rb-4.1.0&q=85"

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Chat Routes
@api_router.get("/conversations", response_model=List[Conversation])
async def get_conversations():
    """Get all conversations for the user"""
    conversations = await db.conversations.find().sort("updated_at", -1).to_list(1000)
    result = []
    for conv in conversations:
        # Convert MongoDB _id to string and remove it
        if '_id' in conv:
            del conv['_id']
        
        # Convert messages
        messages = []
        for msg in conv.get('messages', []):
            if '_id' in msg:
                del msg['_id']
            messages.append(ChatMessage(**msg))
        
        conv['messages'] = messages
        result.append(Conversation(**conv))
    
    return result

@api_router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation"""
    conversation = await db.conversations.find_one({"id": conversation_id})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Convert MongoDB _id to string and remove it
    if '_id' in conversation:
        del conversation['_id']
    
    # Convert messages
    messages = []
    for msg in conversation.get('messages', []):
        if '_id' in msg:
            del msg['_id']
        messages.append(ChatMessage(**msg))
    
    conversation['messages'] = messages
    return Conversation(**conversation)

@api_router.post("/chat/send")
async def send_message(request: SendMessageRequest):
    """Send a message and get AI response"""
    try:
        conversation_id = request.conversation_id
        
        # Create user message
        user_message = ChatMessage(
            role="user",
            content=request.message,
            avatar=USER_AVATAR
        )
        
        if conversation_id:
            # Update existing conversation
            conversation = await db.conversations.find_one({"id": conversation_id})
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            # Add user message to conversation
            await db.conversations.update_one(
                {"id": conversation_id},
                {
                    "$push": {"messages": user_message.dict()},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        else:
            # Create new conversation
            conversation_id = str(uuid.uuid4())
            title = request.title or (request.message[:50] + "..." if len(request.message) > 50 else request.message)
            
            new_conversation = Conversation(
                id=conversation_id,
                title=title,
                messages=[user_message]
            )
            
            await db.conversations.insert_one(new_conversation.dict())
        
        # Generate AI response using Gemini
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=conversation_id,
            system_message="You are a helpful AI assistant. Provide clear, accurate, and helpful responses. Format your responses using markdown when appropriate."
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_msg = UserMessage(text=request.message)
        ai_response = await chat.send_message(user_msg)
        
        # Create AI message
        ai_message = ChatMessage(
            role="assistant",
            content=ai_response,
            avatar=AI_AVATAR
        )
        
        # Add AI message to conversation
        await db.conversations.update_one(
            {"id": conversation_id},
            {
                "$push": {"messages": ai_message.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Update conversation title if it's a new conversation
        if not request.conversation_id:
            # Generate a better title based on the conversation
            title_chat = LlmChat(
                api_key=GEMINI_API_KEY,
                session_id=f"title_{conversation_id}",
                system_message="Generate a short, descriptive title (max 50 characters) for this conversation based on the user's first message. Return only the title, nothing else."
            ).with_model("gemini", "gemini-2.0-flash")
            
            title_msg = UserMessage(text=f"User's message: {request.message}")
            title_response = await title_chat.send_message(title_msg)
            
            if title_response and len(title_response) <= 50:
                await db.conversations.update_one(
                    {"id": conversation_id},
                    {"$set": {"title": title_response.strip()}}
                )
        
        return {
            "conversation_id": conversation_id,
            "user_message": user_message.dict(),
            "ai_message": ai_message.dict()
        }
        
    except Exception as e:
        logger.error(f"Error in send_message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@api_router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    result = await db.conversations.delete_one({"id": conversation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}

@api_router.put("/conversations/{conversation_id}/title")
async def update_conversation_title(conversation_id: str, title: str):
    """Update conversation title"""
    result = await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {"title": title, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Title updated successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
