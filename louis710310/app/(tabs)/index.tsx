import { useState } from "react";
import {
  StyleSheet, Text, View, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, Modal, TextInput, Alert,
} from "react-native";

// ── 真實資料（依照你的合約） ──────────────────────────────────────────────────
const INIT_PROPERTIES = [
  {
    id: "1",
    name: "林口店面",
    address: "新北市林口區國際路",
    type: "店面",
    rent: 49350,
    dueDay: 5,
    paid: true,
    status: "rented",
    tenant: "邱奕德",
    phone: "",
    bank: "中國信託　帳號：705890018772",
    contractEnd: "125/04/14",
    note: "已公證。前2年49,350元，第3年起漲至51,450元。",
    rentSchedule: [
      { label: "第1年", period: "114/5/1～115/4/30", rent: 49350 },
      { label: "第2年", period: "115/5/1～116/4/30", rent: 49350 },
      { label: "第3年", period: "116/5/1～117/4/30", rent: 51450 },
      { label: "第4年", period: "117/5/1～118/4/30", rent: 51450 },
      { label: "第5年", period: "118/5/1～119/4/30", rent: 51450 },
    ],
  },
  {
    id: "2",
    name: "桃園國際路",
    address: "桃園市桃園區國際路二段180號3樓",
    type: "套房",
    rent: 6000,
    dueDay: 15,
    paid: false,
    status: "rented",
    tenant: "（租客）",
    phone: "",
    bank: "（轉帳繳付）",
    contractEnd: "125/01/14",
    note: "租期115/1/15起。每月15日前繳款。",
    rentSchedule: [],
  },
  {
    id: "3",
    name: "鶯歌物件",
    address: "新北市鶯歌區",
    type: "套房",
    rent: 7000,
    dueDay: 5,
    paid: true,
    status: "rented",
    tenant: "（租客）",
    phone: "",
    bank: "",
    contractEnd: "",
    note: "每月5號入帳。無公證。",
    rentSchedule: [],
  },
];

// ── 顏色 ──────────────────────────────────────────────────────────────────────
const C = {
  primary:      "#1E3A8A",
  primaryMid:   "#2563EB",
  primaryLight: "#EFF6FF",
  success:      "#16A34A",
  successLight: "#DCFCE7",
  warning:      "#D97706",
  warningLight: "#FEF3C7",
  danger:       "#DC2626",
  dangerLight:  "#FEE2E2",
  gray50:  "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray700: "#334155",
  gray900: "#0F172A",
  white:   "#FFFFFF",
};

const fmtMoney = (n) => `NT$ ${Number(n).toLocaleString()}`;

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, bg, color }) => (
  <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
    <Text style={{ fontSize: 11, fontWeight: "700", color }}>{label}</Text>
  </View>
);

// ── Detail Row ────────────────────────────────────────────────────────────────
const Row = ({ label, value, valueColor }) => (
  <View style={s.detailRow}>
    <Text style={s.detailLabel}>{label}</Text>
    <Text style={[s.detailValue, valueColor && { color: valueColor }]}>{value || "—"}</Text>
  </View>
);

// ── Field（獨立在最外層，避免重新渲染導致鍵盤收起）────────────────────────────
const Field = ({ label, value, onChangeText, keyboardType = "default", multiline = false }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.formLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      style={[s.formInput, multiline && { height: 72, textAlignVertical: "top" }]}
    />
  </View>
);

// ══════════════════════════════════════════════════════════════════════════════
// 編輯 Modal
// ══════════════════════════════════════════════════════════════════════════════
const EditModal = ({ item, onSave, onClose }) => {
  const [form, setForm] = useState({
    rent:        String(item.rent),
    dueDay:      String(item.dueDay),
    tenant:      item.tenant,
    phone:       item.phone,
    bank:        item.bank,
    contractEnd: item.contractEnd,
    note:        item.note,
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const save = () => {
    const rentNum   = parseInt(form.rent.replace(/,/g, ""), 10);
    const dueDayNum = parseInt(form.dueDay, 10);
    if (isNaN(rentNum) || rentNum <= 0)                       { Alert.alert("請輸入正確的租金金額"); return; }
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) { Alert.alert("繳費日請輸入 1～31");  return; }
    onSave({ ...item, ...form, rent: rentNum, dueDay: dueDayNum });
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>✏️ 編輯：{item.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 22, color: C.gray400 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Field label="月租金（元）"       value={form.rent}        onChangeText={set("rent")}        keyboardType="numeric" />
            <Field label="每月繳費日（1～31）" value={form.dueDay}      onChangeText={set("dueDay")}      keyboardType="numeric" />
            <Field label="租客姓名"           value={form.tenant}      onChangeText={set("tenant")} />
            <Field label="租客電話"           value={form.phone}       onChangeText={set("phone")}       keyboardType="phone-pad" />
            <Field label="收款帳戶"           value={form.bank}        onChangeText={set("bank")} />
            <Field label="合約到期（民國）"   value={form.contractEnd} onChangeText={set("contractEnd")} />
            <Field label="備註"               value={form.note}        onChangeText={set("note")}        multiline />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4, marginBottom: 24 }}>
              <TouchableOpacity onPress={onClose} style={s.btnCancel}>
                <Text style={s.btnCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={s.btnSave}>
                <Text style={s.btnSaveText}>儲存</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 詳情 Modal
// ══════════════════════════════════════════════════════════════════════════════
const DetailModal = ({ item, onClose, onEdit, onTogglePaid }) => (
  <Modal visible animationType="slide" transparent>
    <View style={s.modalOverlay}>
      <View style={[s.modalBox, { paddingBottom: 40 }]}>
        <View style={s.modalHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.modalTitle}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>{item.address}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 22, color: C.gray400 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 租金資訊 */}
          <View style={s.section}>
            <Text style={s.sectionHead}>💰 租金資訊</Text>
            <Row label="月租金"   value={fmtMoney(item.rent)} valueColor={C.primaryMid} />
            <Row label="繳費日"   value={`每月 ${item.dueDay} 日前`} />
            <Row label="本月狀態" value={item.paid ? "✅ 已收款" : "⚠️ 未收款"} valueColor={item.paid ? C.success : C.danger} />
            <Row label="收款帳戶" value={item.bank} />
          </View>

          {/* 租約資訊 */}
          <View style={s.section}>
            <Text style={s.sectionHead}>📄 租約資訊</Text>
            <Row label="租客"     value={item.tenant} />
            <Row label="電話"     value={item.phone} />
            <Row label="合約到期" value={item.contractEnd} />
            <Row label="備註"     value={item.note} />
          </View>

          {/* 租金排程（林口才有） */}
          {item.rentSchedule && item.rentSchedule.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionHead}>📅 租金調整排程</Text>
              {item.rentSchedule.map((r, i) => (
                <View key={i} style={[s.scheduleRow, i % 2 === 0 && { backgroundColor: C.gray50 }]}>
                  <Text style={s.scheduleLabel}>{r.label}</Text>
                  <Text style={s.schedulePeriod}>{r.period}</Text>
                  <Text style={s.scheduleRent}>{fmtMoney(r.rent)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 操作按鈕 */}
          <View style={{ gap: 10, marginTop: 4 }}>
            <TouchableOpacity onPress={onTogglePaid}
              style={[s.actionBtn, { backgroundColor: item.paid ? C.warningLight : C.successLight }]}>
              <Text style={[s.actionBtnText, { color: item.paid ? C.warning : C.success }]}>
                {item.paid ? "↩ 標記為未收款" : "✅ 標記為已收款"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onEdit}
              style={[s.actionBtn, { backgroundColor: C.primaryLight }]}>
              <Text style={[s.actionBtnText, { color: C.primaryMid }]}>✏️ 編輯租金與資訊</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// ══════════════════════════════════════════════════════════════════════════════
// 主畫面
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [properties, setProperties] = useState(INIT_PROPERTIES);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem,   setEditItem]   = useState(null);

  const totalRent   = properties.reduce((s, p) => s + p.rent, 0);
  const paidCount   = properties.filter(p => p.paid).length;
  const unpaidCount = properties.filter(p => !p.paid).length;

  const saveEdit = (updated) => {
    setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditItem(null);
    setDetailItem(updated);
  };

  const togglePaid = (id) => {
    setProperties(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = { ...p, paid: !p.paid };
      setDetailItem(next);
      return next;
    }));
  };

  const today  = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerHi}>你好，Louis 先生 👋</Text>
          <Text style={s.headerDate}>{dateStr}</Text>
        </View>
        <View style={s.rentBox}>
          <Text style={s.rentBoxLabel}>本月應收</Text>
          <Text style={s.rentBoxValue}>{fmtMoney(totalRent)}</Text>
        </View>
      </View>

      {/* ── 統計 ── */}
      <View style={s.statRow}>
        {[
          { n: properties.length, label: "物件數",  bg: C.primaryLight, color: C.primaryMid },
          { n: paidCount,         label: "已收款",  bg: C.successLight,  color: C.success    },
          { n: unpaidCount,       label: "未收款",  bg: unpaidCount > 0 ? C.dangerLight : C.gray100, color: unpaidCount > 0 ? C.danger : C.gray400 },
        ].map(({ n, label, bg, color }) => (
          <View key={label} style={[s.statChip, { backgroundColor: bg }]}>
            <Text style={[s.statNum, { color }]}>{n}</Text>
            <Text style={[s.statLbl, { color }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── 物件列表 ── */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={s.listTitle}>我的物件</Text>

        {properties.map(item => (
          <TouchableOpacity key={item.id} onPress={() => setDetailItem(item)} activeOpacity={0.85}>
            <View style={s.card}>
              {/* 頂列 */}
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>{item.name}</Text>
                  <Text style={s.cardAddr}>{item.address}</Text>
                </View>
                <Badge
                  label={item.paid ? "已收款" : "未收款"}
                  bg={item.paid ? C.successLight : C.dangerLight}
                  color={item.paid ? C.success : C.danger}
                />
              </View>

              {/* 數字列 */}
              <View style={s.cardMid}>
                <View style={s.cardMidCell}>
                  <Text style={s.cellLabel}>月租金</Text>
                  <Text style={s.cellValue}>{fmtMoney(item.rent)}</Text>
                </View>
                <View style={s.vLine} />
                <View style={s.cardMidCell}>
                  <Text style={s.cellLabel}>繳費日</Text>
                  <Text style={s.cellValue}>每月 {item.dueDay} 日</Text>
                </View>
                <View style={s.vLine} />
                <View style={s.cardMidCell}>
                  <Text style={s.cellLabel}>租客</Text>
                  <Text style={s.cellValue} numberOfLines={1}>{item.tenant}</Text>
                </View>
              </View>

              {item.note ? <Text style={s.cardNote} numberOfLines={1}>📝 {item.note}</Text> : null}
              <Text style={s.cardHint}>點擊查看詳情 · 可編輯 →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Modals ── */}
      {detailItem && !editItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={() => setEditItem(detailItem)}
          onTogglePaid={() => togglePaid(detailItem.id)}
        />
      )}
      {editItem && (
        <EditModal
          item={editItem}
          onSave={saveEdit}
          onClose={() => setEditItem(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ── 樣式 ──────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray50 },

  header: {
    backgroundColor: C.primary,
    padding: 20, paddingTop: 14,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  headerHi:   { fontSize: 20, fontWeight: "800", color: C.white },
  headerDate: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  rentBox:      { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12, alignItems: "flex-end" },
  rentBoxLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)" },
  rentBoxValue: { fontSize: 17, fontWeight: "800", color: C.white, marginTop: 2 },

  statRow:  { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 0 },
  statChip: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  statNum:  { fontSize: 22, fontWeight: "800" },
  statLbl:  { fontSize: 11, fontWeight: "600", marginTop: 2 },

  listTitle: { fontSize: 13, fontWeight: "700", color: C.gray500, marginBottom: 4 },

  card: { backgroundColor: C.white, borderRadius: 18, borderWidth: 1, borderColor: C.gray200, padding: 16 },
  cardTop:  { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  cardName: { fontSize: 17, fontWeight: "800", color: C.gray900 },
  cardAddr: { fontSize: 12, color: C.gray400, marginTop: 3 },
  cardMid:  { flexDirection: "row", backgroundColor: C.gray50, borderRadius: 12, padding: 12, marginBottom: 10 },
  cardMidCell: { flex: 1, alignItems: "center" },
  cellLabel:   { fontSize: 10, color: C.gray400, marginBottom: 4 },
  cellValue:   { fontSize: 13, fontWeight: "700", color: C.gray700 },
  vLine:    { width: 1, backgroundColor: C.gray200, marginHorizontal: 4 },
  cardNote: { fontSize: 11, color: C.gray400, marginBottom: 6 },
  cardHint: { fontSize: 11, color: C.primaryMid, textAlign: "right" },

  section:     { marginBottom: 12, backgroundColor: C.gray50, borderRadius: 14, padding: 14 },
  sectionHead: { fontSize: 13, fontWeight: "700", color: C.gray700, marginBottom: 10 },
  detailRow:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  detailLabel: { fontSize: 13, color: C.gray500 },
  detailValue: { fontSize: 13, fontWeight: "600", color: C.gray700, flex: 1, textAlign: "right", marginLeft: 12 },

  scheduleRow:    { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 4, borderRadius: 6 },
  scheduleLabel:  { fontSize: 12, fontWeight: "700", color: C.gray700, width: 40 },
  schedulePeriod: { fontSize: 11, color: C.gray400, flex: 1 },
  scheduleRent:   { fontSize: 13, fontWeight: "800", color: C.primaryMid },

  actionBtn:     { borderRadius: 12, padding: 14, alignItems: "center" },
  actionBtnText: { fontSize: 14, fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalBox:     { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "92%" },
  modalHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: "800", color: C.gray900 },

  formLabel: { fontSize: 13, fontWeight: "600", color: C.gray700, marginBottom: 6 },
  formInput:  { borderWidth: 1.5, borderColor: C.gray200, borderRadius: 10, padding: 11, fontSize: 14, backgroundColor: C.gray50 },

  btnCancel:     { flex: 1, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: C.gray200, alignItems: "center" },
  btnCancelText: { fontWeight: "600", color: C.gray700 },
  btnSave:       { flex: 1, padding: 13, borderRadius: 12, backgroundColor: C.primaryMid, alignItems: "center" },
  btnSaveText:   { fontWeight: "700", color: C.white },
});