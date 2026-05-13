import React, { useState } from "react";
import {
  StyleSheet, Text, View, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, Modal, TextInput, Alert,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

// ── 顏色定義 ──────────────────────────────────────────────────────────────────
const C = {
  primary:      "#1E3A8A",
  primaryMid:    "#2563EB",
  primaryLight: "#EFF6FF",
  success:      "#16A34A",
  successLight: "#DCFCE7",
  warning:      "#D97706",
  warningLight: "#FEF3C7",
  danger:        "#DC2626",
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

const fmtMoney = (n) => `NT$ ${Number(n || 0).toLocaleString()}`;

// ── 共用元件 ──────────────────────────────────────────────────────────────────
const Badge = ({ label, bg, color }) => (
  <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
    <Text style={{ fontSize: 11, fontWeight: "700", color }}>{label}</Text>
  </View>
);

const Row = ({ label, value, valueColor }) => (
  <View style={s.detailRow}>
    <Text style={s.detailLabel}>{label}</Text>
    <Text style={[s.detailValue, valueColor && { color: valueColor }]}>{value || "—"}</Text>
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
      style={[s.formInput, multiline && { height: 72, textAlignVertical: "top" }]}
    />
  </View>
);

// ══════════════════════════════════════════════════════════════════════════════
// 編輯與新增 Modal (通用 Form)
// ══════════════════════════════════════════════════════════════════════════════
const PropertyFormModal = ({ item, onSave, onClose, isNew = false }) => {
  const [form, setForm] = useState(item || {
    id: Date.now().toString(),
    name: "",
    address: "",
    purchasePrice: "",
    rent: "",
    landTax: "",
    houseTax: "",
    dueDay: "5",
    tenant: "",
    note: "",
    paid: false,
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.name || !form.rent) {
      Alert.alert("請填寫必要資訊", "名稱與租金為必填項");
      return;
    }
    onSave({
      ...form,
      purchasePrice: parseInt(String(form.purchasePrice).replace(/,/g, "")) || 0,
      rent: parseInt(String(form.rent).replace(/,/g, "")) || 0,
      landTax: parseInt(String(form.landTax).replace(/,/g, "")) || 0,
      houseTax: parseInt(String(form.houseTax).replace(/,/g, "")) || 0,
    });
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{isNew ? "🏠 新增不動產" : "✏️ 編輯物件"}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 22 }}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Field label="物件名稱 *" value={form.name} onChangeText={set("name")} placeholder="例如：林口店面" />
            <Field label="購入總價 (元)" value={String(form.purchasePrice)} onChangeText={set("purchasePrice")} keyboardType="numeric" />
            <Field label="月租金 (元) *" value={String(form.rent)} onChangeText={set("rent")} keyboardType="numeric" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="預估地價稅" value={String(form.landTax)} onChangeText={set("landTax")} keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Field label="預估房屋稅" value={String(form.houseTax)} onChangeText={set("houseTax")} keyboardType="numeric" /></View>
            </View>
            <Field label="租客姓名" value={form.tenant} onChangeText={set("tenant")} />
            <Field label="備註" value={form.note} onChangeText={set("note")} multiline />
            
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 30 }}>
              <TouchableOpacity onPress={onClose} style={s.btnCancel}><Text>取消</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={s.btnSave}><Text style={{ color: "#FFF" }}>儲存設定</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 主畫面
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [properties, setProperties] = useState([]); // 初始為空，讓 User 自行增加
  const [modalMode, setModalMode] = useState({ visible: false, item: null, isNew: false });

  // 計算投報率公式：((月租 * 12) - (稅金)) / 購入價
  const getROI = (p) => {
    if (!p.purchasePrice || p.purchasePrice === 0) return 0;
    const annualNet = (p.rent * 12) - (Number(p.landTax || 0) + Number(p.houseTax || 0));
    return ((annualNet / p.purchasePrice) * 100).toFixed(2);
  };

  const totalRent = properties.reduce((s, p) => s + Number(p.rent), 0);
  const totalValue = properties.reduce((s, p) => s + Number(p.purchasePrice), 0);

  const saveProperty = (data) => {
    if (modalMode.isNew) {
      setProperties([...properties, data]);
    } else {
      setProperties(properties.map(p => p.id === data.id ? data : p));
    }
    setModalMode({ visible: false, item: null, isNew: false });
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerHi}>不動產投資管理系統</Text>
          <Text style={s.headerDate}>總資產價值：{fmtMoney(totalValue)}</Text>
        </View>
        <TouchableOpacity 
          style={s.addBtn}
          onPress={() => setModalMode({ visible: true, item: null, isNew: true })}
        >
          <Ionicons name="add-circle" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── 數據統計 ── */}
      <View style={s.statRow}>
        <View style={[s.statChip, { backgroundColor: C.primaryLight }]}>
          <Text style={[s.statNum, { color: C.primaryMid }]}>{properties.length}</Text>
          <Text style={s.statLbl}>物件總數</Text>
        </View>
        <View style={[s.statChip, { backgroundColor: C.successLight }]}>
          <Text style={[s.statNum, { color: C.success }]}>{fmtMoney(totalRent)}</Text>
          <Text style={s.statLbl}>月收租預估</Text>
        </View>
      </View>

      {/* ── 物件列表 ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 15 }}>
        {properties.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="business-outline" size={60} color={C.gray200} />
            <Text style={{ color: C.gray400, marginTop: 10 }}>目前尚無資料，請點擊右上角新增</Text>
          </View>
        ) : (
          properties.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={s.card}
              onPress={() => setModalMode({ visible: true, item, isNew: false })}
            >
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>{item.name}</Text>
                  <Text style={s.cardAddr}>{item.tenant || "無租客資訊"}</Text>
                </View>
                <View style={s.roiBadge}>
                  <Text style={s.roiText}>投報 {getROI(item)}%</Text>
                </View>
              </View>

              <View style={s.divider} />

              <View style={s.cardBottom}>
                <View>
                  <Text style={s.cellLabel}>月租收益</Text>
                  <Text style={s.cellValue}>{fmtMoney(item.rent)}</Text>
                </View>
                <View>
                  <Text style={s.cellLabel}>預估年稅金</Text>
                  <Text style={[s.cellValue, { color: C.danger }]}>
                    {fmtMoney(Number(item.landTax || 0) + Number(item.houseTax || 0))}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ── Form Modal ── */}
      {modalMode.visible && (
        <PropertyFormModal 
          isNew={modalMode.isNew}
          item={modalMode.item}
          onClose={() => setModalMode({ visible: false, item: null, isNew: false })}
          onSave={saveProperty}
        />
      )}
    </SafeAreaView>
  );
}

// ── 樣式設定 ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray50 },
  header: {
    backgroundColor: C.primary,
    padding: 20, paddingTop: 15,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  headerHi: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  headerDate: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  addBtn: { padding: 5 },
  statRow: { flexDirection: "row", gap: 12, padding: 16 },
  statChip: { flex: 1, padding: 15, borderRadius: 15, alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "800" },
  statLbl: { fontSize: 12, color: C.gray500, marginTop: 4 },
  card: { backgroundColor: "#FFF", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.gray200 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { fontSize: 17, fontWeight: "800", color: C.gray900 },
  cardAddr: { fontSize: 13, color: C.gray400, marginTop: 4 },
  roiBadge: { backgroundColor: C.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  roiText: { color: C.primaryMid, fontWeight: "bold", fontSize: 12 },
  divider: { height: 1, backgroundColor: C.gray100, marginVertical: 15 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between" },
  cellLabel: { fontSize: 11, color: C.gray400, marginBottom: 5 },
  cellValue: { fontSize: 15, fontWeight: "700", color: C.gray700 },
  emptyState: { alignItems: "center", marginTop: 100 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#FFF", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  formLabel: { fontSize: 14, fontWeight: "600", color: C.gray700, marginBottom: 8 },
  formInput: { backgroundColor: C.gray50, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.gray200, marginBottom: 5 },
  btnSave: { flex: 1, backgroundColor: C.primaryMid, padding: 15, borderRadius: 12, alignItems: "center" },
  btnCancel: { flex: 1, backgroundColor: C.gray100, padding: 15, borderRadius: 12, alignItems: "center" },
});