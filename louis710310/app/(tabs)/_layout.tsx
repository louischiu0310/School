import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // 🌟 這裡幫你精準修正：把底部選單加高，並利用 padding 往上推，完美避開手機系統按鍵！
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: Platform.OS === 'android' ? 75 : 88, // 依手機系統自動加高
          paddingBottom: Platform.OS === 'android' ? 20 : 30, // 向上抬高留出安全空間
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
        },
        tabBarActiveTintColor: '#FF9900', // 啟動時的亮色
        tabBarInactiveTintColor: '#666666',
      }}
    >
      {/* 1. 園所首頁 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '園所首頁',
        }}
      />
      
      {/* 2. 到校歷史 */}
      <Tabs.Screen
        name="history" // 如果你的檔名不同，請確保 name 跟你的實體檔名一致
        options={{
          title: '到校歷史',
        }}
      />

      {/* 3. 親師對話 (就是原來的 explore 改名，或者你本來的檔名) */}
      <Tabs.Screen
        name="explore" 
        options={{
          title: '親師對話',
        }}
      />

      {/* 4. 委託託藥 */}
      <Tabs.Screen
        name="medicine"
        options={{
          title: '委託託藥',
        }}
      />

      {/* 5. 班級公告 */}
      <Tabs.Screen
        name="announcement"
        options={{
          title: '班級公告',
        }}
      />
    </Tabs>
  );
}