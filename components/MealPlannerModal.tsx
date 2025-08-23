import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { PlannedMealExtended, MealIngredient, FoodSearchResult } from '@/types';
import { searchFoods } from '@/utils/api';
import { useData } from '@/contexts/DataContext';

const makeId = () => Math.random().toString(36).slice(2, 9);

interface Props {
  visible: boolean;
  date: string;
  onClose: () => void;
  getPlannedMealsForDate: (date: string) => PlannedMealExtended[];
  addPlannedMeal: (date: string, meal: PlannedMealExtended) => Promise<void>;
  removePlannedMeal: (date: string, id: string) => Promise<void>;
}

export const MealPlannerModal: React.FC<Props> = ({ visible, date, onClose, getPlannedMealsForDate, addPlannedMeal, removePlannedMeal }) => {
  const { data, addCustomFood } = useData();

  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('Lunch');
  const [calories, setCalories] = useState('');
  const [note, setNote] = useState('');

  const [ingredients, setIngredients] = useState<MealIngredient[]>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoodSearchResult[]>([]);

  const meals = getPlannedMealsForDate(date) || [];

  const handleSearch = async () => {
    if (!query || query.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await searchFoods(query.trim());
      setResults(res);
    } catch (err) {
      console.error('Search error', err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addIngredientFromResult = (r: FoodSearchResult) => {
    const ing: MealIngredient = {
      id: String(r.id),
      name: r.name,
  grams: 100,
  unit: 'g',
      calories: r.calories,
      protein_g: r.protein_g,
      carbs_g: r.carbs_g,
      fats_g: r.fats_g,
      source: 'search',
    };
    setIngredients(prev => [...prev, ing]);
    setQuery('');
    setResults([]);
  };

  const addManualIngredient = (name: string, grams?: number, calories?: number) => {
  const ing: MealIngredient = { id: makeId(), name, grams, unit: 'g', calories, source: 'manual' };
    setIngredients(prev => [...prev, ing]);
  };

  const removeIngredient = (id?: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleAdd = async () => {
    if (!name) return Alert.alert('Name required', 'Please enter a meal name');
    const meal: PlannedMealExtended = {
      id: makeId(),
      mealType,
      name,
      calories: calories ? parseInt(calories, 10) : undefined,
      note,
      ingredients,
    };

    // Persist planned meal
    await addPlannedMeal(date, meal);

    // Add ingredients to custom foods if not present
    try {
      const existing = data?.custom_foods || [];
      for (const ing of ingredients) {
        const already = existing.find(f => f.name.toLowerCase() === ing.name.toLowerCase());
        if (!already) {
          // Map MealIngredient -> FoodEntry minimal
          const food = {
            name: ing.name,
            grams: ing.grams || 100,
            calories: ing.calories || 0,
            protein_g: ing.protein_g || 0,
            carbs_g: ing.carbs_g || 0,
            fats_g: ing.fats_g || 0,
          } as any;
          await addCustomFood(food);
        }
      }
    } catch (err) {
      console.error('Error saving ingredients to custom foods', err);
    }

    // reset
    setName(''); setCalories(''); setNote(''); setIngredients([]);
  };

  const handleRemove = async (id: string) => {
    await removePlannedMeal(date, id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Plan meals for {date}</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {meals.map(m => (
              <View key={m.id} style={styles.plannedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealName}>{m.mealType} — {m.name}{m.calories ? ` • ${m.calories} kcal` : ''}</Text>
                  {m.note ? <Text style={styles.mealNote}>{m.note}</Text> : null}
                  {m.ingredients?.length ? (
                    <View style={{ marginTop: 6 }}>
                      {m.ingredients.map((ing, idx) => (
                        <Text key={String(ing.id || idx)} style={{ color: '#6b7280', fontSize: 12 }}>{ing.name} • {ing.grams || ''}g</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(m.id)}>
                  <Text style={{ color: '#fff' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ height: 12 }} />
            <TextInput placeholder="Meal name (e.g., Grilled chicken salad)" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Calories (optional)" value={calories} onChangeText={setCalories} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Note (optional)" value={note} onChangeText={setNote} style={styles.input} />

            <Text style={{ fontWeight: '700', marginTop: 8 }}>Ingredients</Text>
            {ingredients.map((ing, idx) => (
              <View key={String(ing.id)} style={{ paddingVertical: 6, borderBottomWidth: 1, borderColor: '#f3f4f6', paddingBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '600' }}>{ing.name}</Text>
                  <TouchableOpacity onPress={() => removeIngredient(ing.id)} style={{ padding: 6 }}>
                    <Text style={{ color: '#ef4444' }}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <TextInput value={ing.grams ? String(ing.grams) : ''} onChangeText={(v) => {
                    const val = parseFloat(v) || undefined;
                    setIngredients(prev => prev.map(p => p.id === ing.id ? { ...p, grams: val } : p));
                  }} style={[styles.input, { flex: 1 }]} keyboardType="numeric" placeholder="amount" />

                  <TouchableOpacity style={[styles.typeBtn, { paddingVertical: 10 }]} onPress={() => {
                    // cycle unit options
                    const units = ['g','oz','cup','tbsp','tsp','piece','serving'];
                    const idxU = units.indexOf(ing.unit || 'g');
                    const next = units[(idxU + 1) % units.length];
                    setIngredients(prev => prev.map(p => p.id === ing.id ? { ...p, unit: next } : p));
                  }}>
                    <Text style={{ color: '#111' }}>{ing.unit || 'g'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TextInput placeholder="Search ingredients (min 2 chars)" value={query} onChangeText={setQuery} style={[styles.input, { flex: 1 }]} />
              <TouchableOpacity onPress={handleSearch} style={[styles.typeBtn, { paddingVertical: 10 }]}>
                {searching ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Search</Text>}
              </TouchableOpacity>
            </View>

            {results.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <FlatList
                  data={results}
                  keyExtractor={r => String(r.id)}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => addIngredientFromResult(item)} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                      <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 12 }}>{item.source} • {Math.round(item.calories || 0)} kcal</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <View style={{ height: 10 }} />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {['Breakfast','Lunch','Dinner','Snacks'].map(t => (
                <TouchableOpacity key={t} style={[styles.typeBtn, mealType === t && styles.typeBtnActive]} onPress={() => setMealType(t)}>
                  <Text style={{ color: mealType === t ? '#fff' : '#374151' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Add planned meal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ color: '#374151', fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, maxHeight: '92%', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: '#f9fafb' },
  addBtn: { backgroundColor: '#059669', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6 },
  closeBtn: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12, backgroundColor: '#f3f4f6' },
  plannedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  mealName: { fontWeight: '600', color: '#111827' },
  mealNote: { color: '#6b7280', marginTop: 4 },
  removeBtn: { backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  typeBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#e2e8f0' },
  typeBtnActive: { backgroundColor: '#059669' },
});
