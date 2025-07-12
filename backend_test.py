#!/usr/bin/env python3
"""
Backend API Testing for AI Chat Application
Tests all backend endpoints with real Gemini AI integration
"""

import requests
import json
import time
import sys
from datetime import datetime

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"Testing backend at: {API_URL}")

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.conversation_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data,
            'timestamp': datetime.now().isoformat()
        })
        
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def test_root_endpoint(self):
        """Test 1: Root endpoint connectivity"""
        try:
            response = self.session.get(f"{API_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Hello World':
                    self.log_test("Root Endpoint", True, "Basic connectivity working")
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_conversations_empty(self):
        """Test 2: Get conversations (should be empty initially)"""
        try:
            response = self.session.get(f"{API_URL}/conversations")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Conversations (Empty)", True, f"Returned {len(data)} conversations")
                    return True
                else:
                    self.log_test("Get Conversations (Empty)", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Get Conversations (Empty)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Conversations (Empty)", False, f"Error: {str(e)}")
            return False
    
    def test_send_message_new_conversation(self):
        """Test 3: Send message to create new conversation with real Gemini AI"""
        try:
            payload = {
                "message": "Hello, can you help me with React development?"
            }
            
            response = self.session.post(
                f"{API_URL}/chat/send",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ['conversation_id', 'user_message', 'ai_message']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Send Message (New)", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                # Store conversation ID for later tests
                self.conversation_id = data['conversation_id']
                
                # Verify user message
                user_msg = data['user_message']
                if user_msg['role'] != 'user' or user_msg['content'] != payload['message']:
                    self.log_test("Send Message (New)", False, "User message mismatch", data)
                    return False
                
                # Verify AI message
                ai_msg = data['ai_message']
                if ai_msg['role'] != 'assistant' or not ai_msg['content']:
                    self.log_test("Send Message (New)", False, "AI message invalid", data)
                    return False
                
                # Check if response looks like real AI (not mocked)
                ai_content = ai_msg['content'].lower()
                if len(ai_content) < 20:  # Real AI responses are usually longer
                    self.log_test("Send Message (New)", False, "AI response too short, might be mocked", data)
                    return False
                
                # Check for React-related content (since we asked about React)
                react_keywords = ['react', 'component', 'jsx', 'javascript', 'development', 'help']
                has_relevant_content = any(keyword in ai_content for keyword in react_keywords)
                
                if not has_relevant_content:
                    print(f"   Warning: AI response might not be contextually relevant")
                    print(f"   AI Response: {ai_msg['content'][:200]}...")
                
                self.log_test("Send Message (New)", True, f"Created conversation {self.conversation_id} with real AI response")
                return True
                
            else:
                self.log_test("Send Message (New)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Send Message (New)", False, f"Error: {str(e)}")
            return False
    
    def test_get_specific_conversation(self):
        """Test 4: Get the newly created conversation"""
        if not self.conversation_id:
            self.log_test("Get Specific Conversation", False, "No conversation ID available")
            return False
            
        try:
            response = self.session.get(f"{API_URL}/conversations/{self.conversation_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify conversation structure
                required_fields = ['id', 'title', 'messages', 'created_at', 'updated_at']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Get Specific Conversation", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                # Verify conversation ID matches
                if data['id'] != self.conversation_id:
                    self.log_test("Get Specific Conversation", False, "Conversation ID mismatch", data)
                    return False
                
                # Verify messages exist
                messages = data['messages']
                if len(messages) < 2:  # Should have user + AI message
                    self.log_test("Get Specific Conversation", False, f"Expected 2+ messages, got {len(messages)}", data)
                    return False
                
                # Verify message structure
                for msg in messages:
                    required_msg_fields = ['id', 'role', 'content', 'timestamp', 'avatar']
                    missing_msg_fields = [field for field in required_msg_fields if field not in msg]
                    if missing_msg_fields:
                        self.log_test("Get Specific Conversation", False, f"Message missing fields: {missing_msg_fields}", data)
                        return False
                
                self.log_test("Get Specific Conversation", True, f"Retrieved conversation with {len(messages)} messages")
                return True
                
            else:
                self.log_test("Get Specific Conversation", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Specific Conversation", False, f"Error: {str(e)}")
            return False
    
    def test_send_message_existing_conversation(self):
        """Test 5: Send another message to existing conversation"""
        if not self.conversation_id:
            self.log_test("Send Message (Existing)", False, "No conversation ID available")
            return False
            
        try:
            payload = {
                "conversation_id": self.conversation_id,
                "message": "Can you explain React hooks in detail?"
            }
            
            response = self.session.post(
                f"{API_URL}/chat/send",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ['conversation_id', 'user_message', 'ai_message']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Send Message (Existing)", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                # Verify conversation ID matches
                if data['conversation_id'] != self.conversation_id:
                    self.log_test("Send Message (Existing)", False, "Conversation ID mismatch", data)
                    return False
                
                # Verify AI response
                ai_msg = data['ai_message']
                if ai_msg['role'] != 'assistant' or not ai_msg['content']:
                    self.log_test("Send Message (Existing)", False, "AI message invalid", data)
                    return False
                
                # Check for hooks-related content
                ai_content = ai_msg['content'].lower()
                hooks_keywords = ['hook', 'usestate', 'useeffect', 'react', 'function']
                has_hooks_content = any(keyword in ai_content for keyword in hooks_keywords)
                
                if not has_hooks_content:
                    print(f"   Warning: AI response might not be about React hooks")
                    print(f"   AI Response: {ai_msg['content'][:200]}...")
                
                self.log_test("Send Message (Existing)", True, "Added message to existing conversation with AI response")
                return True
                
            else:
                self.log_test("Send Message (Existing)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Send Message (Existing)", False, f"Error: {str(e)}")
            return False
    
    def test_get_conversations_with_data(self):
        """Test 6: Get conversations (should now have data)"""
        try:
            response = self.session.get(f"{API_URL}/conversations")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Find our conversation
                    our_conversation = None
                    for conv in data:
                        if conv.get('id') == self.conversation_id:
                            our_conversation = conv
                            break
                    
                    if our_conversation:
                        # Verify conversation has multiple messages now
                        messages = our_conversation.get('messages', [])
                        if len(messages) >= 4:  # 2 user + 2 AI messages
                            self.log_test("Get Conversations (With Data)", True, f"Found conversation with {len(messages)} messages")
                            return True
                        else:
                            self.log_test("Get Conversations (With Data)", False, f"Expected 4+ messages, got {len(messages)}")
                            return False
                    else:
                        self.log_test("Get Conversations (With Data)", False, "Our conversation not found in list")
                        return False
                else:
                    self.log_test("Get Conversations (With Data)", False, f"Expected non-empty list, got: {len(data) if isinstance(data, list) else type(data)}")
                    return False
                    
            else:
                self.log_test("Get Conversations (With Data)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Conversations (With Data)", False, f"Error: {str(e)}")
            return False
    
    def test_delete_conversation(self):
        """Test 7: Delete the conversation"""
        if not self.conversation_id:
            self.log_test("Delete Conversation", False, "No conversation ID available")
            return False
            
        try:
            response = self.session.delete(f"{API_URL}/conversations/{self.conversation_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Conversation deleted successfully':
                    self.log_test("Delete Conversation", True, "Conversation deleted successfully")
                    return True
                else:
                    self.log_test("Delete Conversation", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Delete Conversation", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Delete Conversation", False, f"Error: {str(e)}")
            return False
    
    def test_verify_deletion(self):
        """Test 8: Verify conversation was deleted"""
        if not self.conversation_id:
            self.log_test("Verify Deletion", False, "No conversation ID available")
            return False
            
        try:
            response = self.session.get(f"{API_URL}/conversations/{self.conversation_id}")
            
            if response.status_code == 404:
                self.log_test("Verify Deletion", True, "Conversation properly deleted (404 response)")
                return True
            else:
                self.log_test("Verify Deletion", False, f"Expected 404, got HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Verify Deletion", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test 9: Error handling for various scenarios"""
        error_tests = []
        
        # Test 1: Invalid conversation ID
        try:
            response = self.session.get(f"{API_URL}/conversations/invalid-id")
            if response.status_code == 404:
                error_tests.append(("Invalid conversation ID", True, "Properly returns 404"))
            else:
                error_tests.append(("Invalid conversation ID", False, f"Expected 404, got {response.status_code}"))
        except Exception as e:
            error_tests.append(("Invalid conversation ID", False, f"Error: {str(e)}"))
        
        # Test 2: Empty message
        try:
            response = self.session.post(
                f"{API_URL}/chat/send",
                json={"message": ""},
                headers={'Content-Type': 'application/json'}
            )
            # Should either work or return proper error
            if response.status_code in [200, 400, 422]:
                error_tests.append(("Empty message", True, f"Handled properly (HTTP {response.status_code})"))
            else:
                error_tests.append(("Empty message", False, f"Unexpected status: {response.status_code}"))
        except Exception as e:
            error_tests.append(("Empty message", False, f"Error: {str(e)}"))
        
        # Test 3: Invalid JSON
        try:
            response = self.session.post(
                f"{API_URL}/chat/send",
                data="invalid json",
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code in [400, 422]:
                error_tests.append(("Invalid JSON", True, f"Properly returns {response.status_code}"))
            else:
                error_tests.append(("Invalid JSON", False, f"Expected 400/422, got {response.status_code}"))
        except Exception as e:
            error_tests.append(("Invalid JSON", False, f"Error: {str(e)}"))
        
        # Log all error test results
        all_passed = True
        for test_name, success, message in error_tests:
            self.log_test(f"Error Handling - {test_name}", success, message)
            if not success:
                all_passed = False
        
        return all_passed
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("BACKEND API TESTING - AI CHAT APPLICATION")
        print("=" * 60)
        print(f"Backend URL: {API_URL}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print()
        
        tests = [
            self.test_root_endpoint,
            self.test_get_conversations_empty,
            self.test_send_message_new_conversation,
            self.test_get_specific_conversation,
            self.test_send_message_existing_conversation,
            self.test_get_conversations_with_data,
            self.test_delete_conversation,
            self.test_verify_deletion,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                print()  # Add spacing between tests
                time.sleep(1)  # Small delay between tests
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
                print()
        
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Backend is working correctly.")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check the details above.")
        
        print(f"\nTest completed at: {datetime.now().isoformat()}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)