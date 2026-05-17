import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, StatusBar, Alert, SafeAreaView, Modal, FlatList,
} from "react-native";

// ══════════════════════════════════════════════════════════════════════════════
// 資料庫（擴充加入後台管理員與班級概念）
// ══════════════════════════════════════════════════════════════════════════════
const INIT_STUDENTS = [
  { id: 1, name: "王小明", qr: "STU001", parent_name: "王大明", parent_phone: "0912-345-678", classType: "英文班" },
  { id: 2, name: "李小花", qr: "STU002", parent_name: "李美玲", parent_phone: "0923-456-789", classType: "數學班" },
  { id: 3, name: "陳小安", qr: "STU003", parent_name: "陳大志", parent_phone: "0934-567-890", classType: "英文班" },
  { id: 4, name: "林小宇", qr: "STU004", parent_name: "林惠君", parent_phone: "0945-678-901", classType: "作文班" },
  { id: 5, name: "張小雯", qr: "STU005", parent_name: "張志明", parent_phone: "0956-789-012", classType: "才藝班" },
];

const ACCOUNTS = [
  { id: "A1", role: "admin",   name: "主管系統管理員", email: "admin@school.com",   password: "demo1234" },
  { id: "T1", role: "teacher", name: "陳老師",       email: "teacher@school.com", password: "demo1234" },
  { id: "P1", role: "parent",  name: "王大明",       email: "parent@school.com",  password: "demo1234", childId: 1 },
];

const MOCK_NOTICES = [
  { id: 1, title: "📢 本週五補習班成果發表會", body: "本週五下午 3:30 舉辦成果發表，歡迎家長踴躍參與，當日接送時間請配合調整至 5:00 前。", date: "2026-05-11", unread: true },
  { id: 2, title: "📢 端午節連續假期停課通知", body: "端午連假（6/2–6/4）安親班各類課程同步停課三天，請家長注意假期安全。", date: "2026-05-09", unread: false },
  { id: 3, title: "📢 六月份夏季生活營開始報名", body: "超熱門主題夏令營開放報名囉！名額有限，詳細課表請至櫃檯或線上填表。", date: "2026-05-07", unread: false },
];

const MOCK_MESSAGES = [
  { id: 1, from: "teacher", name: "陳老師", text: "大明爸爸您好，小明今天英文小考表現很棒喔！", time: "17:30" },
  { id: 2, from: "parent",  name: "王大明", text: "謝謝陳老師！他回家有說英文課很好玩 😊", time: "17:45" },
];

// 託藥單初始模擬資料
const INIT_MEDICATIONS = [
  { id: 1, studentName: "王小明", time: "午餐後", dosage: "感冒藥水 5ml、藥粉一包", status: "已餵藥", note: "注意吃完容易昏睡", parentSign: "王大明" },
];

// ══════════════════════════════════════════════════════════════════════════════
// 顏色與工具配置
// ══════════════════════════════════════════════════════════════════════════════
const C = {
  admin:        "#6366F1", // 管理員：靛藍
  teacher:      "#059669", // 老師端：綠色
  parent:       "#D97706", // 家長端：橘黃
  primary:      "#2563EB",
  primaryLight: "#EFF6FF",
  success:      "#16A34A",
  successLight: "#DCFCE7",
  warning:      "#D97706",
  warningLight: "#FEF3C7",
  danger:       "#DC2626",
  dangerLight:  "#FEE2E2",
  gray50:  "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  white:   "#FFFFFF",
};

const AVATAR_COLORS = ["#3B82F6","#8B5CF6","#EC4899","#14B8A6","#F59E0B","#10B981"];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const todayKey    = () => new Date().toISOString().slice(0, 10);
const fmtTime     = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};
const fmtDate = (str) => {
  const d = new Date(str);
  const days = ["日","一","二","三","四","五","六"];
  return `${d.getMonth()+1}/${d.getDate()}（週${days[d.getDay()]}）`;
};

// ══════════════════════════════════════════════════════════════════════════════
// 共用元件
// ══════════════════════════════════════════════════════════════════════════════
const Ava = ({ name, id = 0, size = 42 }) => (
  <View style={[s.ava, { width: size, height: size, borderRadius: size/2, backgroundColor: avatarColor(id) }]}>
    <Text style={[s.avaText, { fontSize: size * 0.38 }]}>{name.slice(0,2)}</Text>
  </View>
);

const Pill = ({ label, bg, color }) => (
  <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
    <Text style={{ fontSize: 11, fontWeight: "700", color }}>{label}</Text>
  </View>
);

const Field = ({ label, value, onChangeText, keyboardType = "default", multiline = false, placeholder = "" }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.formLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor={C.gray400}
      numberOfLines={multiline ? 3 : 1}
      style={[s.formInput, multiline && { height: 72, textAlignVertical: "top" }]}
    />
  </View>
);

// ══════════════════════════════════════════════════════════════════════════════
// 登入畫面
// ══════════════════════════════════════════════════════════════════════════════
const LoginScreen = ({ onLogin }) => {
  const [email,    setEmail]    = useState("parent@school.com");
  const [password, setPassword] = useState("demo1234");
  const [error,    setError]    = useState("");

  const login = () => {
    if (!email || !password) { setError("請輸入帳號與密碼"); return; }
    const acc = ACCOUNTS.find(a => a.email === email.trim() && a.password === password);
    if (acc) { setError(""); onLogin(acc); }
    else     { setError("帳號或密碼錯誤，請重試"); }
  };

  return (
    <SafeAreaView style={[s.root, { justifyContent: "center" }]}>
      <View style={s.loginWrap}>
        <View style={[s.loginLogo, { backgroundColor: C.primary }]}>
          <Text style={{ fontSize: 36 }}>🏫</Text>
        </View>
        <Text style={s.loginTitle}>安親補習班智慧管理系統</Text>
        <Text style={s.loginSub}>跨端整合平台 (管理員 | 老師 | 家長)</Text>

        <Field label="電子郵件帳號" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="請輸入帳號" />
        <Field label="登入密碼" value={password} onChangeText={setPassword} placeholder="請輸入密碼" />

        {error ? <Text style={s.loginError}>{error}</Text> : null}

        <TouchableOpacity onPress={login} style={[s.loginBtn, { backgroundColor: C.primary }]}>
          <Text style={s.loginBtnText}>安全驗證登入</Text>
        </TouchableOpacity>

        <View style={s.loginHint}>
          <Text style={[s.loginHintText, { fontWeight: "bold" }]}>💡 測試流暢切換快捷提示：</Text>
          <Text style={s.loginHintText}>💻 後台管理：admin@school.com</Text>
          <Text style={s.loginHintText}>👩‍🏫 班導師端：teacher@school.com</Text>
          <Text style={s.loginHintText}>🧑‍🍼 家長端：parent@school.com</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 【新】1. 後台管理員端 (AdminApp)
// ══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = ({ students }) => {
  return (
    <ScrollView style={s.page}>
      <View style={[s.blueHeader, { backgroundColor: C.admin }]}>
        <Text style={s.bhTitle}>後台營運核心數據</Text>
        <Text style={s.bhDate}>安親班授權總覽</Text>
      </View>
      <View style={s.statRow}>
        <View style={[s.statCard, { backgroundColor: C.primaryLight }]}><Text style={[s.statN, { color: C.admin }]}>5</Text><Text style={s.statL}>活躍班級數</Text></View>
        <View style={[s.statCard, { backgroundColor: C.successLight }]}><Text style={[s.statN, { color: C.success }]}>{students.length}</Text><Text style={s.statL}>學生總註冊</Text></View>
        <View style={[s.statCard, { backgroundColor: C.warningLight }]}><Text style={[s.statN, { color: C.warning }]}>2</Text><Text style={s.statL}>在線員工數</Text></View>
      </View>
      
      <View style={s.listCard}>
        <Text style={s.listCardTitle}>🛠️ 系統模組快速管理</Text>
        {["🔑 帳號與權限管制模組", "📚 班級類型核心設定 (英文/數學/作文)", "🖼️ 家長端 Banner 活動推播佈局"].map((item, idx) => (
          <View key={idx} style={[s.listRow, s.listBorder, { justifyContent: "space-between" }]}>
            <Text style={{ fontSize: 14, color: C.gray700, fontWeight: "600" }}>{item}</Text>
            <Pill label="運作正常" bg={C.successLight} color={C.success} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const AdminClasses = () => {
  const classes = [
    { name: "菁英英文 A 班", type: "英文班", teacher: "陳老師", count: 12 },
    { name: "思維數學高階班", type: "數學班", teacher: "林老師", count: 8 },
    { name: "基礎作文引導班", type: "作文班", teacher: "張老師", count: 15 },
    { name: "創意黏土才藝班", type: "才藝班", teacher: "王老師", count: 10 },
  ];
  return (
    <ScrollView style={s.page}>
      <View style={s.pageHeader}><Text style={s.pageTitle}>📚 班級架構維護</Text></View>
      <View style={{ padding: 16, gap: 10 }}>
        {classes.map((cls, i) => (
          <View key={i} style={s.attendCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.listName}>{cls.name}</Text>
              <Text style={s.listSub}>分類：{cls.type}  |  授課教師：{cls.teacher}</Text>
            </View>
            <Pill label={`${cls.count} 人`} bg={C.primaryLight} color={C.primary} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const AdminApp = ({ user, onLogout, students, setStudents }) => {
  const [tab, setTab] = useState("dashboard");
  return (
    <SafeAreaView style={s.root}>
      <View style={s.topBar}>
        <Text style={[s.topBarTitle, { color: C.admin }]}>💻 系統後台管理端</Text>
        <TouchableOpacity onPress={onLogout} style={s.logoutBtn}><Text style={s.logoutText}>登出</Text></TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {tab === "dashboard" && <AdminDashboard students={students} />}
        {tab === "classes" && <AdminClasses />}
        {tab === "students" && <TeacherStudents students={students} setStudents={setStudents} />}
      </View>
      <View style={s.tabBar}>
        {[
          { key: "dashboard", icon: "📊", label: "營運總覽" },
          { key: "classes",   icon: "📚", label: "班級開課" },
          { key: "students",  icon: "📊", label: "學生名冊" },
        ].map(t => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={s.tabItem}>
            <Text style={s.tabIcon}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.key && { color: C.admin }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. 班導師端 (TeacherApp) - 擴充班級篩選、託藥管理
// ══════════════════════════════════════════════════════════════════════════════
const TeacherDashboard = ({ students, attendance }) => {
  const [selectedClass, setSelectedClass] = useState("全部班級");
  const rec = attendance[todayKey()] || {};
  
  const filteredStudents = selectedClass === "全部班級" 
    ? students 
    : students.filter(s => s.classType === selectedClass);

  const present = filteredStudents.filter(s => rec[s.id]?.cin && !rec[s.id]?.cout);
  const left    = filteredStudents.filter(s => rec[s.id]?.cout);
  const absent  = filteredStudents.filter(s => !rec[s.id]?.cin);

  return (
    <ScrollView style={s.page} showsVerticalScrollIndicator={false}>
      <View style={[s.blueHeader, { backgroundColor: C.teacher }]}>
        <Text style={s.bhDate}>{fmtDate(todayKey())}</Text>
        <Text style={s.bhTitle}>今日出席總覽</Text>
      </View>

      {/* 班級篩選列 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, marginVertical: 10 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {["全部班級", "英文班", "數學班", "作文班", "才藝班"].map(cls => (
          <TouchableOpacity key={cls} onPress={() => setSelectedClass(cls)} style={[s.filterBtn, selectedClass === cls && { backgroundColor: C.teacher }]}>
            <Text style={[s.filterText, selectedClass === cls && { color: "#fff" }]}>{cls}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.statRow}>
        <View style={[s.statCard, { backgroundColor: "#DCFCE7" }]}><Text style={[s.statN, { color: "#065F46" }]}>{present.length}</Text><Text style={s.statL}>在班中</Text></View>
        <View style={[s.statCard, { backgroundColor: "#FEE2E2" }]}><Text style={[s.statN, { color: "#991B1B" }]}>{absent.length}</Text><Text style={s.statL}>未到校</Text></View>
        <View style={[s.statCard, { backgroundColor: "#DBEAFE" }]}><Text style={[s.statN, { color: "#1E40AF" }]}>{left.length}</Text><Text style={s.statL}>已離校</Text></View>
      </View>

      <View style={s.listCard}>
        <Text style={s.listCardTitle}>{selectedClass} 名冊 ({filteredStudents.length} 人)</Text>
        {filteredStudents.map((st, i) => {
          const r = rec[st.id] || {};
          return (
            <View key={st.id} style={[s.listRow, i < filteredStudents.length - 1 && s.listBorder]}>
              <Ava name={st.name} id={st.id} size={40} />
              <View style={s.listInfo}>
                <Text style={s.listName}>{st.name} <Text style={{ fontSize: 11, color: C.gray400 }}>({st.classType})</Text></Text>
                <Text style={s.listSub}>{r.cin ? `到校 ${fmtTime(r.cin)}` : "尚未簽到"}{r.cout ? ` | 離校 ${fmtTime(r.cout)}` : ""}</Text>
              </View>
              <Pill label={r.cout ? "已離校" : r.cin ? "在班中" : "未到校"} bg={r.cout ? "#DBEAFE" : r.cin ? "#DCFCE7" : "#FEE2E2"} color={r.cout ? "#1E40AF" : r.cin ? "#166534" : "#991B1B"} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const TeacherAttendance = ({ students, attendance, setAttendance }) => {
  const today = todayKey();
  const rec = attendance[today] || {};

  const handleCheckin = (st) => {
    setAttendance(p => ({
      ...p,
      [today]: { ...(p[today] || {}), [st.id]: { ...(p[today]?.[st.id] || {}), cin: new Date().toISOString() } }
    }));
  };

  const handleCheckout = (st) => {
    setAttendance(p => ({
      ...p,
      [today]: { ...(p[today] || {}), [st.id]: { ...(p[today]?.[st.id] || {}), cout: new Date().toISOString() } }
    }));
  };

  return (
    <ScrollView style={s.page}>
      <View style={s.pageHeader}><Text style={s.pageTitle}>📌 到班/離班 安全控管系統</Text></View>
      <View style={{ padding: 16, gap: 10 }}>
        {students.map(st => {
          const r = rec[st.id] || {};
          return (
            <View key={st.id} style={s.attendCard}>
              <Ava name={st.name} id={st.id} size={40} />
              <View style={s.listInfo}>
                <Text style={s.listName}>{st.name}</Text>
                <Text style={s.listSub}>{r.cin ? `簽到：${fmtTime(r.cin)}` : "未簽到"}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <TouchableOpacity onPress={() => handleCheckin(st)} disabled={!!r.cin} style={[s.actBtn, { backgroundColor: r.cin ? C.gray100 : "#DCFCE7" }]}>
                  <Text style={{ color: r.cin ? C.gray400 : "#065F46", fontSize: 12, fontWeight: "700" }}>到校</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCheckout(st)} disabled={!r.cin || !!r.cout} style={[s.actBtn, { backgroundColor: (!r.cin || r.cout) ? C.gray100 : "#DBEAFE" }]}>
                  <Text style={{ color: (!r.cin || r.cout) ? C.gray400 : "#1E40AF", fontSize: 12, fontWeight: "700" }}>離校</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const TeacherMedication = ({ medications, setMedications }) => {
  const completeMed = (id) => {
    setMedications(p => p.map(m => m.id === id ? { ...m, status: "已餵藥" } : m));
    Alert.alert("完成登記", "已成功回報家長餵藥狀況！");
  };

  return (
    <ScrollView style={s.page}>
      <View style={s.pageHeader}><Text style={s.pageTitle}>💊 當日學生託藥指示清單</Text></View>
      <View style={{ padding: 16, gap: 10 }}>
        {medications.map(m => (
          <View key={m.id} style={[s.attendCard, { flexDirection: "column", alignItems: "flex-start" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: C.gray900 }}>學生：{m.studentName}</Text>
              <Pill label={m.status} bg={m.status === "已餵藥" ? C.successLight : C.warningLight} color={m.status === "已餵藥" ? C.success : C.warning} />
            </View>
            <Text style={s.listSub}>⏰ 託藥時間點：{m.time}</Text>
            <Text style={s.listSub}>📦 劑量與藥包說明：{m.dosage}</Text>
            {m.note ? <Text style={[s.listSub, { color: C.danger }]}>⚠️ 備註：{m.note}</Text> : null}
            <Text style={[s.listSub, { fontStyle: "italic" }]}>✍️ 家長授權簽章：{m.parentSign}</Text>
            
            {m.status === "待處理" && (
              <TouchableOpacity onPress={() => completeMed(m.id)} style={[s.loginBtn, { width: "100%", padding: 8, marginTop: 10, backgroundColor: C.teacher }]}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>確認執行餵藥確認並通知家長</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const TeacherStudents = ({ students, setStudents }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", parent_name: "", parent_phone: "", classType: "英文班" });

  const addStudent = () => {
    if (!form.name) return;
    const newId = students.length + 1;
    setStudents(p => [...p, { id: newId, qr: `STU${String(newId).padStart(3,"0")}`, ...form }]);
    setModal(false);
    setForm({ name: "", parent_name: "", parent_phone: "", classType: "英文班" });
  };

  return (
    <View style={s.page}>
      <View style={[s.pageHeader, { flexDirection: "row", justifyContent: "space-between" }]}>
        <Text style={s.pageTitle}>🧒 學生核心名冊</Text>
        <TouchableOpacity onPress={() => setModal(true)} style={[s.addBtn, { backgroundColor: C.primary }]}><Text style={s.addBtnText}>+ 新增學生</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 16, gap: 10 }}>
        {students.map(st => (
          <View key={st.id} style={[s.studentCard, { marginBottom: 10 }]}>
            <Ava name={st.name} id={st.id} />
            <View style={s.listInfo}>
              <Text style={s.listName}>{st.name} ({st.classType})</Text>
              <Text style={s.listSub}>主要聯繫家長：{st.parent_name}</Text>
              <Text style={s.listSub}>📞 手機：{st.parent_phone}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>建立新學生檔案</Text>
            <Field label="學生真實姓名 *" value={form.name} onChangeText={v => setForm({...form, name: v})} placeholder="請輸入姓名" />
            <Field label="對應家長姓名" value={form.parent_name} onChangeText={v => setForm({...form, parent_name: v})} placeholder="請輸入家長姓名" />
            <Field label="家長行動電話" value={form.parent_phone} onChangeText={v => setForm({...form, parent_phone: v})} placeholder="例: 0912-345-678" />
            <View style={s.modalBtns}>
              <TouchableOpacity onPress={() => setModal(false)} style={s.btnCancel}><Text>取消</Text></TouchableOpacity>
              <TouchableOpacity onPress={addStudent} style={s.btnSave}><Text style={{ color: "#fff" }}>確認儲存</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const TeacherApp = ({ user, onLogout, students, setStudents, attendance, setAttendance, medications, setMedications }) => {
  const [tab, setTab] = useState("dashboard");
  return (
    <SafeAreaView style={s.root}>
      <View style={s.topBar}>
        <Text style={[s.topBarTitle, { color: C.teacher }]}>👩‍🏫 班導師智慧管理端</Text>
        <TouchableOpacity onPress={onLogout} style={s.logoutBtn}><Text style={s.logoutText}>登出</Text></TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {tab === "dashboard" && <TeacherDashboard students={students} attendance={attendance} />}
        {tab === "attendance" && <TeacherAttendance students={students} attendance={attendance} setAttendance={setAttendance} />}
        {tab === "medication" && <TeacherMedication medications={medications} setMedications={setMedications} />}
        {tab === "students" && <TeacherStudents students={students} setStudents={setStudents} />}
      </View>
      <View style={s.tabBar}>
        {[
          { key: "dashboard",  icon: "📊", label: "今日總覽" },
          { key: "attendance", icon: "📌", label: "到離安全" },
          { key: "medication", icon: "💊", label: "校園託藥" },
          { key: "students",   icon: "👦", label: "學生管理" },
        ].map(t => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={s.tabItem}>
            <Text style={s.tabIcon}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.key && { color: C.teacher }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. 家長智慧端 (ParentApp) - 整合首頁 Banner 活動花絮、託藥線上申請
// ══════════════════════════════════════════════════════════════════════════════
const ParentHome = ({ user, students, attendance, setTab }) => {
  const child = students.find(s => s.id === user.childId) || students[0];
  const rec = (attendance[todayKey()] || {})[child?.id] || {};

  return (
    <ScrollView style={s.page} showsVerticalScrollIndicator={false}>
      {/* 營運公告動態 Banner */}
      <View style={[s.blueHeader, { backgroundColor: C.parent, padding: 20 }]}>
        <Text style={s.bhDate}>✨ 園所動態花絮焦點</Text>
        <Text style={[s.bhTitle, { fontSize: 18 }]}>🏆 本季傑出安親英語朗讀大賽完美落幕！</Text>
        <Text style={{ color: "#fff", opacity: 0.8, fontSize: 12, marginTop: 4 }}>點擊查看最新夏令營名額及各班花絮照片牆...</Text>
      </View>

      {/* 孩子專屬狀況卡 */}
      <View style={s.childCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Ava name={child?.name} id={child?.id} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={s.childName}>{child?.name}</Text>
            <Text style={s.childSub}>所屬班別：{child?.classType}</Text>
          </View>
          <Pill label={rec.cout ? "已離校" : rec.cin ? "在班中" : "未到校"} bg={rec.cout ? "#DBEAFE" : rec.cin ? "#DCFCE7" : "#FEE2E2"} color={rec.cout ? "#1E40AF" : rec.cin ? "#166534" : "#991B1B"} />
        </View>
        <View style={s.childStats}>
          <View style={s.childStatCell}><Text style={s.childStatLabel}>到校安全回報</Text><Text style={[s.childStatVal, { color: C.success }]}>{rec.cin ? fmtTime(rec.cin) : "—"}</Text></View>
          <View style={s.vLine} />
          <View style={s.childStatCell}><Text style={s.childStatLabel}>安全離校簽退</Text><Text style={[s.childStatVal, { color: C.primary }]}>{rec.cout ? fmtTime(rec.cout) : "—"}</Text></View>
        </View>
      </View>

      {/* 快捷排版導覽 */}
      <View style={{ padding: 16 }}>
        <Text style={s.sectionTitle}>✨ 快速互動模組</Text>
        <View style={s.quickGrid}>
          <TouchableOpacity onPress={() => setTab("records")} style={[s.quickCard, { backgroundColor: "#EFF6FF" }]}><Text style={{ fontSize: 24 }}>📋</Text><Text style={s.quickLabel}>出席歷程</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setTab("messages")} style={[s.quickCard, { backgroundColor: "#F0FDF4" }]}><Text style={{ fontSize: 24 }}>💬 </Text><Text style={s.quickLabel}>親師雙向通</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setTab("medication")} style={[s.quickCard, { backgroundColor: "#FFF1F2" }]}><Text style={{ fontSize: 24 }}>💊</Text><Text style={s.quickLabel}>線上託藥申請</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setTab("notices")} style={[s.quickCard, { backgroundColor: "#FFFBEB" }]}><Text style={{ fontSize: 24 }}>📢</Text><Text style={s.quickLabel}>公告通知</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const ParentRecords = ({ user, students, attendance }) => {
  const child = students.find(s => s.id === user.childId) || students[0];
  return (
    <ScrollView style={s.page}>
      <View style={s.pageHeader}><Text style={s.pageTitle}>📊 孩子出席歷史日誌</Text></View>
      <View style={{ padding: 16 }}>
        <View style={s.recordCard}>
          <View style={s.recordDate}><Text style={s.recordDay}>17</Text><Text style={s.recordWeek}>日</Text></View>
          <View style={s.listInfo}>
            <Text style={s.listName}>{fmtDate(todayKey())}</Text>
            <Text style={s.listSub}>正常出席</Text>
          </View>
          <Pill label="安全到班" bg={C.successLight} color={C.success} />
        </View>
      </View>
    </ScrollView>
  );
};

const ParentMedicationForm = ({ user, students, medications, setMedications }) => {
  const child = students.find(s => s.id === user.childId) || students[0];
  const [time, setTime] = useState("");
  const [dosage, setDosage] = useState("");
  const [note, setNote] = useState("");

  const submitForm = () => {
    if (!time || !dosage) { Alert.alert("提示", "請完整填寫餵藥時間點與劑量說明"); return; }
    const newRequest = {
      id: medications.length + 1,
      studentName: child.name,
      time,
      dosage,
      status: "待處理",
      note,
      parentSign: user.name,
    };
    setMedications([...medications, newRequest]);
    Alert.alert("送出成功", "託藥單已成功傳送給班導師！");
    setTime(""); setDosage(""); setNote("");
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 16 }}>
      <View style={s.pageHeader}><Text style={s.pageTitle}>✍️ 線上填寫安全託藥單</Text></View>
      <View style={[s.listCard, { padding: 16, marginTop: 10 }]}>
        <Field label="委託餵藥時間點 *" value={time} onChangeText={setTime} placeholder="例如：午餐後 / 下午 3 點" />
        <Field label="精確藥量/藥包/劑量說明 *" value={dosage} onChangeText={setDosage} placeholder="例如：黃色藥水 5ml、感冒藥粉一包" />
        <Field label="特別交代注意事項 (選填)" value={note} onChangeText={setNote} placeholder="例如：吃完藥請多喝水 / 需冷藏" />
        <TouchableOpacity onPress={submitForm} style={[s.loginBtn, { backgroundColor: C.parent, marginTop: 10 }]}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>完成數位簽章並送出</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const ParentApp = ({ user, onLogout, students, attendance, medications, setMedications }) => {
  const [tab, setTab] = useState("home");
  return (
    <SafeAreaView style={s.root}>
      <View style={s.topBar}>
        <Text style={[s.topBarTitle, { color: C.parent }]}>🧑‍🍼 補習班家長聯絡端</Text>
        <TouchableOpacity onPress={onLogout} style={s.logoutBtn}><Text style={s.logoutText}>登出</Text></TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {tab === "home" && <ParentHome user={user} students={students} attendance={attendance} setTab={setTab} />}
        {tab === "records" && <ParentRecords user={user} students={students} attendance={attendance} />}
        {tab === "messages" && <ParentMessages user={user} />}
        {tab === "medication" && <ParentMedicationForm user={user} students={students} medications={medications} setMedications={setMedications} />}
        {tab === "notices" && <ParentNotices />}
      </View>
      <View style={s.tabBar}>
        {[
          { key: "home",       icon: "🏠", label: "園所首頁" },
          { key: "records",    icon: "📋", label: "到校歷史" },
          { key: "messages",   icon: "💬", label: "親師對話" },
          { key: "medication", icon: "💊", label: "委託託藥" },
          { key: "notices",    icon: "🔔", label: "班級公告" },
        ].map(t => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={s.tabItem}>
            <Text style={s.tabIcon}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.key && { color: C.parent }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 補齊原本遺漏的對話與公告元件
// ══════════════════════════════════════════════════════════════════════════════
const ParentMessages = ({ user }) => {
  const [msgs, setMsgs] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { id: msgs.length+1, from: "parent", name: user.name, text: input.trim(), time: "18:05" }]);
    setInput("");
  };
  return (
    <View style={{ flex:1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} style={{ flex: 1, backgroundColor: C.gray50 }}>
        {msgs.map(m => (
          <View key={m.id} style={{ alignSelf: m.from === "parent" ? "flex-end" : "flex-start", backgroundColor: m.from === "parent" ? C.primary : "#fff", padding: 12, borderRadius: 12, marginVertical: 4, maxWidth: "80%" }}>
            <Text style={{ color: m.from === "parent" ? "#fff" : C.gray900 }}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={s.inputRow}>
        <TextInput value={input} onChangeText={setInput} placeholder="請輸入回覆訊息..." style={s.msgInput} />
        <TouchableOpacity onPress={send} style={[s.sendBtn, { backgroundColor: C.primary }]}><Text style={{ color: "#fff" }}>➤</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const ParentNotices = () => (
  <ScrollView style={s.page} contentContainerStyle={{ padding: 16 }}>
    {MOCK_NOTICES.map(n => (
      <View key={n.id} style={[s.noticeCard, { marginBottom: 12 }]}>
        <Text style={s.noticeTitle}>{n.title}</Text>
        <Text style={s.noticeBody}>{n.body}</Text>
        <Text style={s.noticeDate}>{n.date}</Text>
      </View>
    ))}
  </ScrollView>
);

// ══════════════════════════════════════════════════════════════════════════════
// 頂層全域狀態分流核心控制節點
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,       setUser]       = useState(null);
  const [students,   setStudents]   = useState(INIT_STUDENTS);
  const [attendance, setAttendance] = useState({});
  const [medications, setMedications] = useState(INIT_MEDICATIONS);

  if (!user) return <LoginScreen onLogin={setUser} />;

  // 三大角色安全入口路由分流
  if (user.role === "admin") {
    return <AdminApp user={user} onLogout={() => setUser(null)} students={students} setStudents={setStudents} />;
  }
  if (user.role === "teacher") {
    return <TeacherApp user={user} onLogout={() => setUser(null)} students={students} setStudents={setStudents} attendance={attendance} setAttendance={setAttendance} medications={medications} setMedications={setMedications} />;
  }
  return (
    <ParentApp user={user} onLogout={() => setUser(null)} students={students} attendance={attendance} medications={medications} setMedications={setMedications} />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 樣式表維護
// ══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex:1, backgroundColor: C.gray50 },
  loginWrap:  { flex:1, justifyContent:"center", padding: 32 },
  loginLogo:  { width:72, height:72, borderRadius:20, alignItems:"center", justifyContent:"center", alignSelf:"center", marginBottom:16 },
  loginTitle: { fontSize:22, fontWeight:"800", color: C.gray900, textAlign:"center", marginBottom:4 },
  loginSub:   { fontSize:13, color: C.gray500, textAlign:"center", marginBottom:32 },
  loginBtn:   { borderRadius:14, padding:14, alignItems:"center", marginTop:4 },
  loginBtnText: { color: C.white, fontWeight:"700", fontSize:16 },
  loginError: { color: C.danger, fontSize:13, textAlign:"center", marginBottom:8 },
  loginHint:  { marginTop:24, padding:16, backgroundColor: C.gray100, borderRadius:12 },
  loginHintText: { fontSize:12, color: C.gray500, textAlign:"left", lineHeight:20 },
  topBar:      { height:52, backgroundColor: C.white, borderBottomWidth:1, borderBottomColor: C.gray200, flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16 },
  topBarTitle: { fontSize:15, fontWeight:"800" },
  logoutBtn:   { paddingHorizontal:12, paddingVertical:6, borderRadius:8, borderWidth:1, borderColor: C.gray200 },
  logoutText:  { fontSize:12, color: C.gray600, fontWeight:"600" },
  page:       { flex:1, backgroundColor: C.gray50 },
  pageHeader: { backgroundColor: C.white, padding:16, borderBottomWidth:1, borderBottomColor: C.gray100 },
  pageTitle:  { fontSize:18, fontWeight:"800", color: C.gray900 },
  pageSub:    { fontSize:12, color: C.gray500, marginTop:2 },
  blueHeader: { padding:24, paddingBottom:28 },
  bhDate:     { color:"rgba(255,255,255,0.8)", fontSize:12, marginBottom:4 },
  bhTitle:    { color: C.white, fontSize:20, fontWeight:"800" },
  statRow:  { flexDirection:"row", gap:10, padding:16 },
  statCard: { flex:1, borderRadius:14, padding:14, alignItems:"center", elevation:1 },
  statN:    { fontSize:24, fontWeight:"800" },
  statL:    { fontSize:11, fontWeight:"600", marginTop:2, color: C.gray500 },
  listCard:      { margin:16, marginTop:0, backgroundColor: C.white, borderRadius:16, overflow:"hidden", borderWidth:1, borderColor: C.gray200 },
  listCardTitle: { fontSize:13, fontWeight:"700", color: C.gray700, padding:14, backgroundColor: C.gray50, borderBottomWidth:1, borderBottomColor: C.gray100 },
  listRow:       { flexDirection:"row", alignItems:"center", padding:14, gap:12 },
  listBorder:    { borderBottomWidth:1, borderBottomColor: C.gray100 },
  listInfo:      { flex:1 },
  listName:      { fontSize:14, fontWeight:"700", color: C.gray900 },
  listSub:       { fontSize:12, color: C.gray500, marginTop:2 },
  ava:     { alignItems:"center", justifyContent:"center" },
  avaText: { color: C.white, fontWeight:"700" },
  filterBtn:   { paddingHorizontal:14, paddingVertical:6, borderRadius:999, backgroundColor: C.gray200, height: 32 },
  filterText:  { fontSize:12, fontWeight:"600", color: C.gray700 },
  attendCard:  { backgroundColor: C.white, borderRadius:14, borderWidth:1, borderColor: C.gray200, padding:14, flexDirection:"row", alignItems:"center", gap:12 },
  actBtn:      { paddingHorizontal:12, paddingVertical:6, borderRadius:8 },
  studentCard: { backgroundColor: C.white, borderRadius:14, borderWidth:1, borderColor: C.gray200, padding:14, flexDirection:"row", alignItems:"center", gap:12 },
  addBtn:      { paddingHorizontal:12, paddingVertical:6, borderRadius:8 },
  addBtnText:  { color: C.white, fontWeight:"700", fontSize:12 },
  childCard:      { margin:16, marginTop:-16, backgroundColor: C.white, borderRadius:20, padding:16, elevation:3 },
  childName:      { fontSize:16, fontWeight:"800", color: C.gray900 },
  childSub:       { fontSize:12, color: C.gray500, marginTop:2 },
  childStats:     { flexDirection:"row", backgroundColor: C.gray50, borderRadius:14, padding:12 },
  childStatCell:  { flex:1, alignItems:"center" },
  childStatLabel: { fontSize:11, color: C.gray400, marginBottom:4 },
  childStatVal:   { fontSize:16, fontWeight:"800" },
  vLine:          { width:1, backgroundColor: C.gray200, marginHorizontal:4 },
  sectionTitle: { fontSize:13, fontWeight:"700", color: C.gray500, marginBottom:10 },
  quickGrid:    { flexDirection:"row", flexWrap:"wrap", gap:10 },
  quickCard:    { width:"48%", borderRadius:16, padding:14 },
  quickLabel:   { fontSize:13, fontWeight:"700", color: C.gray900, marginTop:4 },
  noticeCard:    { backgroundColor: C.white, borderRadius:14, borderWidth:1, borderColor: C.gray200, padding:14 },
  noticeTitle:   { fontSize:14, fontWeight:"700", color: C.gray900 },
  noticeBody:    { fontSize:12, color: C.gray500, marginTop:4, lineHeight:18 },
  noticeDate:    { fontSize:10, color: C.gray400, marginTop:6 },
  recordCard:  { backgroundColor: C.white, borderRadius:14, borderWidth:1, borderColor: C.gray200, padding:14, flexDirection:"row", alignItems:"center", gap:12 },
  recordDate:  { width:40, height:40, borderRadius:10, backgroundColor: C.gray100, alignItems:"center", justifyContent:"center" },
  recordDay:   { fontSize:14, fontWeight:"800", color: C.gray700 },
  recordWeek:  { fontSize:10, color: C.gray500 },
  inputRow:    { flexDirection:"row", padding:12, backgroundColor: C.white, borderTopWidth:1, borderTopColor: C.gray100, gap:10, alignItems:"center" },
  msgInput:    { flex:1, backgroundColor: C.gray50, borderWidth:1, borderColor: C.gray200, borderRadius:999, paddingHorizontal:14, paddingVertical:8, fontSize:13 },
  sendBtn:     { width:36, height:36, borderRadius:18, alignItems:"center", justifyContent:"center" },
  modalOverlay: { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  modalBox:     { backgroundColor: C.white, borderTopLeftRadius:24, borderTopRightRadius:24, padding:24, maxHeight:"80%" },
  modalTitle:   { fontSize:16, fontWeight:"800", color: C.gray900, marginBottom:16 },
  modalBtns:    { flexDirection:"row", gap:10, marginTop:14 },
  btnCancel:    { flex:1, padding:12, borderRadius:10, borderWidth:1, borderColor: C.gray200, alignItems:"center" },
  btnSave:      { flex:1, padding:12, borderRadius:10, backgroundColor: C.primary, alignItems:"center" },
  formLabel: { fontSize:12, fontWeight:"600", color: C.gray700, marginBottom:4 },
  formInput:  { borderWidth:1, borderColor: C.gray200, borderRadius:10, padding:10, fontSize:13, backgroundColor: C.gray50 },
  tabBar:  { flexDirection:"row", backgroundColor: C.white, borderTopWidth:1, borderTopColor: C.gray200, paddingBottom:6, paddingTop:4 },
  tabItem: { flex:1, alignItems:"center", gap:2 },
  tabIcon: { fontSize:20 },
  tabLabel:{ fontSize:10, fontWeight:"600", color: C.gray400 },
});