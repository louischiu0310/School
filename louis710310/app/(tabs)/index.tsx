import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { userRole } = useLocalSearchParams();

  // 1. 後台管理員專屬功能選單
  const adminMenu = [
    { id: 'm1', title: '🔑 帳號與權限管理', desc: '管制人員登入、權限重設與分流' },
    { id: 'm2', title: '📚 班級管理', desc: '英文班/數學班/作文班/才藝班類型設定' },
    { id: 'm3', title: '🖼️ 家長 Banner 設定', desc: '管理家長端首頁佈告欄公告圖影' },
    { id: 'm4', title: '📊 學生資料總管', desc: '全校學生名冊、家長資料雙向串聯綁定' },
  ];

  // 2. 老師端專屬功能選單
  const teacherMenu = [
    { id: 't1', title: '📌 點名 (班級出席)', desc: '依據不同班級（如英文、數學）獨立點名' },
    { id: 't2', title: '💬 聯絡本 (發送/查看)', desc: '發送今日作業、小考成績與個別學生表現' },
    { id: 't3', title: '🔔 簽到 / 簽退', desc: '即時控管學生到離班狀況' },
    { id: 't4', title: '💊 託藥單 (查看/記錄)', desc: '核對與登記家長傳送之用藥指示及時間' },
    { id: 't5', title: '🧑‍🎓 學生管理', desc: '負責班級內學生的即時狀況處理' },
  ];

  // 3. 家長端專屬功能選單
  const parentMenu = [
    { id: 'p1', title: '✨ Banner 首頁活動', desc: '查看安親班最新活動花絮與夏令營報名' },
    { id: 'p2', title: '📆 孩子出席狀態', desc: '確認孩子今日是否已安全送達、離校時間點' },
    { id: 'p3', title: '💬 聯絡本 (查看/回覆)', desc: '接收老師反饋，即時線上簽名與意見回覆' },
    { id: 'p4', title: '💊 託藥單 (填寫送出)', desc: '線上填寫用藥時間、劑量與叮囑，一鍵送給老師' },
    { id: 'p5', title: '📢 通知公告', desc: '接收停課、節慶、繳費等重要訊息公告' },
  ];

  // 根據角色決定資料來源與主題色彩
  let currentMenu = parentMenu;
  let roleName = '🧑‍🍼 家長帳號';
  let themeColor = '#D97706'; // 橘黃色調

  if (userRole === 'admin') {
    currentMenu = adminMenu;
    roleName = '💻 後台管理員';
    themeColor = '#6366F1'; // 靛藍色調
  } else if (userRole === 'teacher') {
    currentMenu = teacherMenu;
    roleName = '👩‍🏫 老師帳號';
    themeColor = '#059669'; // 綠色調
  }

  return (
    <ScrollView style={styles.container}>
      {/* 頂部橫幅：動態切換主題色與身分 */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <Text style={styles.headerTitle}>安親班 APP 功能架構</Text>
        <Text style={styles.headerSubtitle}>當前身分：{roleName}</Text>
      </View>

      {/* 核心功能列表 */}
      <View style={styles.menuGrid}>
        {currentMenu.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => {
              // 點擊聯絡簿相關功能時，跳轉去對話檔案
              if (item.id === 't2' || item.id === 'p3') {
                router.push('/explore');
              }
            }}
          >
            <Text style={[styles.cardTitle, { color: themeColor }]}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 底部小提示：呼應架構圖的班級類型概念 */}
      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>💡 班級類型：英文班 | 數學班 | 作文班 | 才藝班</Text>
        <Text style={styles.footerSubText}>每個班級獨立點名、聯絡本、學生名冊管理</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 25, paddingTop: 60, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: '#FFF', marginTop: 8, textAlign: 'center', fontWeight: '600' },
  menuGrid: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardDesc: { fontSize: 14, color: '#64748B', marginTop: 6, lineHeight: 20 },
  footerInfo: { padding: 20, alignItems: 'center', marginBottom: 40 },
  footerText: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  footerSubText: { fontSize: 12, color: '#94A3B8', marginTop: 4 }
});