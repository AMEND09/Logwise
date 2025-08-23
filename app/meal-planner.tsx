import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useData } from '@/contexts/DataContext';
import { toLocalISODate, parseLocalDate } from '@/utils/dates';
import { MealPlannerModal } from '@/components/MealPlannerModal';
import { ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

const COLS = 7;

export default function MealPlannerPage() {
  const { getPlannedMealsForDate, addPlannedMeal, removePlannedMeal } = useData();
  const [anchorDate, setAnchorDate] = useState(() => toLocalISODate());
  const [selectedDate, setSelectedDate] = useState(() => toLocalISODate());
  const [showModal, setShowModal] = useState(false);

  // Build a full month grid (6 rows) anchored at current month of anchorDate
  const monthMeta = useMemo(() => {
    const anchor = parseLocalDate(anchorDate);
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const first = new Date(year, month, 1);
    const startWeekDay = (first.getDay() + 6) % 7; // make Monday=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { iso: string; inMonth: boolean }[] = [];
    // fill leading
    for (let i = 0; i < startWeekDay; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() - (startWeekDay - i));
      cells.push({ iso: toLocalISODate(d), inMonth: false });
    }
    // month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ iso: toLocalISODate(new Date(year, month, d)), inMonth: true });
    }
    // trailing to 42 cells
    while (cells.length < 42) {
      const last = parseLocalDate(cells[cells.length - 1].iso);
      last.setDate(last.getDate() + 1);
      cells.push({ iso: toLocalISODate(last), inMonth: false });
    }
    return { cells, year, month };
  }, [anchorDate]);

  const shiftMonth = (delta: number) => {
    const a = parseLocalDate(anchorDate);
    a.setMonth(a.getMonth() + delta);
    setAnchorDate(toLocalISODate(a));
  };

  const todayIso = toLocalISODate();
  const screenW = Dimensions.get('window').width;
  const PREFERRED_CELL = 96;
  const totalPreferred = PREFERRED_CELL * 7;
  const needsHorizontal = screenW < totalPreferred;
  const openDate = (date: string) => { setSelectedDate(date); setShowModal(true); };

  const truncate = (s: string, n = 12) => s.length > n ? s.slice(0, n - 1) + '…' : s;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.navBtn}><ChevronLeft size={20} color="#111" /></TouchableOpacity>
          <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.navBtn}><ChevronRight size={20} color="#111" /></TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>
          {new Date(monthMeta.year, monthMeta.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
        <View style={{ width: 72 }} />
      </View>
      <Text style={styles.subtitle}>Tap a day to plan meals & ingredients</Text>
      {!needsHorizontal && (
        <View style={styles.weekHeaderRow}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <Text key={d} style={styles.weekHeader}>{d}</Text>
          ))}
        </View>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} style={{ flex: 1 }}>
        {(() => {
          const rows: typeof monthMeta.cells[] = [];
          for (let r = 0; r < 6; r++) rows.push(monthMeta.cells.slice(r * 7, r * 7 + 7));

          const screenW = Dimensions.get('window').width;
          const PREFERRED_CELL = 96;
          const totalPreferred = PREFERRED_CELL * 7;
          const needsHorizontal = screenW < totalPreferred;

          return (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={needsHorizontal} scrollEnabled={needsHorizontal} contentContainerStyle={{ paddingHorizontal: 8 }}>
                <View style={{ width: needsHorizontal ? totalPreferred : '100%' }}>
                  {needsHorizontal && (
                    <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                        <View key={d} style={{ width: PREFERRED_CELL, alignItems: 'center' }}>
                          {/* override percent-based maxWidth/flexBasis so the label can use the full fixed cell width */}
                          <Text style={[styles.weekHeader, { textAlign: 'center', maxWidth: undefined, flexBasis: undefined, width: '100%' }]}>{d}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {rows.map((row, ri) => (
                    <View key={ri} style={styles.row}>
                    {row.map(c => {
                      const meals = getPlannedMealsForDate(c.iso) || [];
                      const isToday = c.iso === todayIso;
                      const selected = c.iso === selectedDate;
                      return (
                        <TouchableOpacity key={c.iso} onPress={() => openDate(c.iso)} style={[styles.cell, { width: needsHorizontal ? PREFERRED_CELL : undefined }, !c.inMonth && styles.cellOut, selected && styles.cellSelected]}> 
                          <View style={styles.cellHeaderRow}>
                            <Text style={[styles.dayNum, !c.inMonth && styles.dayNumOut, isToday && styles.todayPill]}>{new Date(c.iso).getDate()}</Text>
                            {meals.length > 0 && (
                              <View style={styles.dotWrap}>
                                <View style={[styles.dot, meals.length > 2 && styles.dotMed, meals.length > 5 && styles.dotHigh]} />
                              </View>
                            )}
                          </View>
                          {/* small pill tag showing first meal */}
                          {meals[0] && (
                            <View style={styles.mealTag}>
                              <Text style={styles.mealTagText}>{`${meals[0].mealType[0]} ${truncate(meals[0].name, 10)}`}</Text>
                            </View>
                          )}
                          {meals.slice(0,2).map(m => (
                            <Text key={m.id} style={styles.mealChip} numberOfLines={1}>{m.mealType[0]} {m.name}</Text>
                          ))}
                          {meals.length > 2 && <Text style={styles.moreText}>+{meals.length - 2}</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          );
        })()}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => openDate(selectedDate)}>
        <Plus color="#fff" size={26} />
      </TouchableOpacity>

      <MealPlannerModal
        visible={showModal}
        date={selectedDate}
        onClose={() => setShowModal(false)}
        getPlannedMealsForDate={getPlannedMealsForDate}
        addPlannedMeal={addPlannedMeal}
        removePlannedMeal={removePlannedMeal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  navBtn: { padding: 8, backgroundColor: '#ffffff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  backBtn: { padding: 8, backgroundColor: '#ffffff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  subtitle: { color: '#64748b', paddingHorizontal: 16, marginTop: 6, marginBottom: 8, fontSize: 13 },
  weekHeaderRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 },
  weekHeader: { flexBasis: '14.2857%', maxWidth: '14.2857%', minWidth: 40, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#475569' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 8 },
  // Use flex basis so 7 columns always fit responsively
  cell: { flexBasis: '14.2857%', maxWidth: '14.2857%', minWidth: 40, minHeight: 88, backgroundColor: '#ffffff', margin: 2, borderRadius: 14, padding: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, borderWidth: 1, borderColor: '#e2e8f0' },
  cellOut: { opacity: 0.35 },
  cellSelected: { borderColor: '#059669', shadowOpacity: 0.15, shadowRadius: 6 },
  cellHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayNum: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  dayNumOut: { color: '#94a3b8' },
  todayPill: { backgroundColor: '#059669', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  dotWrap: { alignItems: 'flex-end', flex: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34d399' },
  dotMed: { backgroundColor: '#10b981' },
  dotHigh: { backgroundColor: '#059669' },
  mealChip: { fontSize: 9, color: '#334155', marginTop: 2, backgroundColor: '#f1f5f9', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 },
  moreText: { fontSize: 9, color: '#2563eb', marginTop: 3 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8 },
  mealTag: { position: 'absolute', top: 36, left: 8, backgroundColor: '#eefbf5', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#d1fae5' },
  mealTagText: { fontSize: 10, color: '#065f46', fontWeight: '700' },
});
