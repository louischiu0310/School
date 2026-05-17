import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');

  return (
    // 🌟 這裡幫你精準修正：最外層使用鍵盤防護罩，讓鍵盤彈起時，輸入框跟著往上滑，不再被遮擋！
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80} // 預留頂部導覽列的高度
    >
      {/* 頂部標題 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏠 家長聯絡網</Text>
        <Text style={styles.headerSubtitle}>當前：家長端</Text>
      </View>

      {/* 聊天訊息列表 */}
      <ScrollView style={styles.messageList} contentContainerStyle={{ padding: 15 }}>
        {/* 老師發的訊息 */}
        <View style={styles.teacherMessageContainer}>
          <Text style={styles.senderName}>👩‍🏫 班導師</Text>
          <View style={styles.teacherBubble}>
            <Text style={styles.messageText}>小明今天在補習班表現很好，數學小考拿了95分，非常專心！</Text>
          </View>
        </View>

        {/* 家長發的訊息 */}
        <View style={styles.parentMessageContainer}>
          <Text style={styles.parentSenderName}>家長 (您)</Text>
          <View style={styles.parentBubble}>
            <Text style={styles.parentMessageText}>謝謝老師的指導與照顧！</Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部輸入區域 */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="請輸入訊息..." 
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline={false}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>傳送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#FFF', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#EAEAEA', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 13, color: '#666' },
  
  messageList: { flex: 1 },
  
  teacherMessageContainer: { alignment: 'left', marginBottom: 20, maxWidth: '80%' },
  senderName: { fontSize: 12, color: '#666', marginBottom: 5 },
  teacherBubble: { backgroundColor: '#FFF', padding: 12, borderRadius: 15, borderTopLeftRadius: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  messageText: { fontSize: 15, color: '#333', lineHeight: 22 },
  
  parentMessageContainer: { alignSelf: 'flex-end', marginBottom: 20, maxWidth: '80%', alignItems: 'flex-end' },
  parentSenderName: { fontSize: 12, color: '#666', marginBottom: 5 },
  parentBubble: { backgroundColor: '#E2E8F0', padding: 12, borderRadius: 15, borderTopRightRadius: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  parentMessageText: { fontSize: 15, color: '#3B5998', lineHeight: 22 },
  
  // 底部輸入區域樣式
  inputContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#FFF', 
    borderTopWidth: 1, 
    borderTopColor: '#EAEAEA',
    alignItems: 'center',
    // 💡 底部額外多留一點空隙，打字更舒適
    paddingBottom: Platform.OS === 'android' ? 15 : 25 
  },
  input: { flex: 1, backgroundColor: '#F0F2F5', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, fontSize: 15, color: '#333', marginRight: 10, maxHeight: 40 },
  sendButton: { backgroundColor: '#3B5998', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' }
});