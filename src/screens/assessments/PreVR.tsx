import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '../../components/FormCard';
import { Field } from '../../components/Field';
import DateField from '../../components/DateField';
import PillGroup from '../../components/PillGroup';
import Segmented from '../../components/Segmented';
import BottomBar from '../../components/BottomBar';
import { Btn } from '../../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { RouteProp } from '@react-navigation/native';

export default function PreVR() {
  const [effect, setEffect] = useState<number | undefined>();
  const [clarity, setClarity] = useState<number | undefined>();
  const [confidence, setConfidence] = useState<number | undefined>();
  const [demo, setDemo] = useState('');
  const [controls, setControls] = useState('');
  const [guidance, setGuidance] = useState('');
  const [wear, setWear] = useState('');
  const [pref, setPref] = useState('');
  const [qa, setQa] = useState('');

  // New state variables for previously hardcoded values
  const [participantId, setParticipantId] = useState('');
  const [date, setDate] = useState('');
  const [demoComments, setDemoComments] = useState('');
  const [wearComments, setWearComments] = useState('');
  const [prefComments, setPrefComments] = useState('');
  const [qaComments, setQaComments] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PreVR'>>();
  const { patientId,age,studyId } = route.params;
  console.log("PATIENTID", patientId)

  const ready = (() => {
    const base = (effect && clarity && confidence) ? Math.round(((effect || 0) + (clarity || 0) + (confidence || 0)) / 3) : '—';
    const extras = Number(demo === 'Yes') + Number(controls === 'Yes') + Number(guidance === 'No');
    return base === '—' ? '—' : `${base}${extras ? ` (+${extras})` : ''}`;
  })();

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`prevr-${patientId}-${today}`, 'done');
    navigation.goBack();
  };

  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {participantId || patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId || studyId || 'N/A'}
          </Text>

          <Text className="text-base font-semibold text-gray-700">
            Age: {age || 'Not specified'}
          </Text>
        </View>
      </View>
      <ScrollView className="flex-1 p-4 bg-white pb-[400px]">
        <FormCard icon="H" title="Pre-VR Assessment">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field 
                label="Participant ID" 
                placeholder="e.g., PT-0234"
                value={participantId}
                onChangeText={setParticipantId}
              />
            </View>
            <View className="flex-1">
              <DateField 
                label="Date" 
                value={date}
                onChange={setDate}
              />
            </View>
          </View>
        </FormCard>

        <FormCard icon="A" title="Orientation Quality">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Effectiveness (1–5)</Text>
              <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((value, index) => (
                    <React.Fragment key={value}>
                      <Pressable
                        onPress={() => setEffect(value)}
                        className={`flex-1 py-3 items-center justify-center ${
                          effect === value ? 'bg-[#4FC264]' : 'bg-white'
                        }`}
                      >
                        <Text className={`font-medium text-sm ${
                          effect === value ? 'text-white' : 'text-[#4b5f5a]'
                        }`}>
                          {value}
                        </Text>
                      </Pressable>
                      {index < 4 && (
                        <View className="w-px bg-[#e6eeeb]" />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Clarity (1–5)</Text>
              <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((value, index) => (
                    <React.Fragment key={value}>
                      <Pressable
                        onPress={() => setClarity(value)}
                        className={`flex-1 py-3 items-center justify-center ${
                          clarity === value ? 'bg-[#4FC264]' : 'bg-white'
                        }`}
                      >
                        <Text className={`font-medium text-sm ${
                          clarity === value ? 'text-white' : 'text-[#4b5f5a]'
                        }`}>
                          {value}
                        </Text>
                      </Pressable>
                      {index < 4 && (
                        <View className="w-px bg-[#e6eeeb]" />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </FormCard>

        <FormCard icon="B" title="Demonstration & Confidence">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Demonstration provided?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable 
                  onPress={() => setDemo('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    demo === 'Yes' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    demo === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    demo === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable 
                  onPress={() => setDemo('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    demo === 'No' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    demo === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    demo === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
              {demo === 'Yes' && (
                <View className="mt-3">
                  <Field 
                    label="Comments" 
                    placeholder="Describe the demonstration provided..."
                    value={demoComments}
                    onChangeText={setDemoComments}
                  />
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Confidence (1–5)</Text>
              <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((value, index) => (
                    <React.Fragment key={value}>
                      <Pressable
                        onPress={() => setConfidence(value)}
                        className={`flex-1 py-3 items-center justify-center ${
                          confidence === value ? 'bg-[#4FC264]' : 'bg-white'
                        }`}
                      >
                        <Text className={`font-medium text-sm ${
                          confidence === value ? 'text-white' : 'text-[#4b5f5a]'
                        }`}>
                          {value}
                        </Text>
                      </Pressable>
                      {index < 4 && (
                        <View className="w-px bg-[#e6eeeb]" />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
              <Text className="text-xs text-muted mt-1">1=Not confident • 5=Very confident</Text>
            </View>
          </View>
        </FormCard>

        <FormCard icon="C" title="Controls & Guidance">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Confident with controls?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable 
                  onPress={() => setControls('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    controls === 'Yes' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    controls === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    controls === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable 
                  onPress={() => setControls('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    controls === 'No' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    controls === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    controls === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Need additional guidance?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable 
                  onPress={() => setGuidance('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    guidance === 'Yes' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    guidance === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    guidance === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable 
                  onPress={() => setGuidance('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    guidance === 'No' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    guidance === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    guidance === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </FormCard>

        <FormCard icon="D" title="Fit, Adjustment & Wear">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Any concerns about wearing the device?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable 
                  onPress={() => setWear('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    wear === 'Yes' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    wear === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    wear === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable 
                  onPress={() => setWear('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    wear === 'No' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    wear === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    wear === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
              {wear === 'Yes' && (
                <View className="mt-3">
                  <Field 
                    label="Comments" 
                    placeholder="Discomfort, hygiene, duration limits…"
                    value={wearComments}
                    onChangeText={setWearComments}
                  />
                </View>
              )}
            </View>
            <View className="flex-1" />
          </View>
        </FormCard>

        <FormCard icon="E" title="Guided Imagery Content">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Preferences or concerns?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable 
                  onPress={() => setPref('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    pref === 'Yes' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    pref === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    pref === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable 
                  onPress={() => setPref('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    pref === 'No' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    pref === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    pref === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
              {pref === 'Yes' && (
                <View className="mt-3">
                  <Field 
                    label="Response" 
                    placeholder="e.g., avoid fast motion, prefer beach scenes…"
                    value={prefComments}
                    onChangeText={setPrefComments}
                  />
                </View>
              )}
            </View>
            <View className="flex-1" />
          </View>
        </FormCard>

        <FormCard icon="F" title="Questions & Concerns">
          <Text className="text-xs text-[#4b5f5a] mb-2">Were your questions addressed?</Text>
          <View className="flex-row gap-2">
            {/* Yes Button */}
            <Pressable 
              onPress={() => setQa('Yes')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                qa === 'Yes' 
                  ? 'bg-[#4FC264]' 
                  : 'bg-[#EBF6D6]'
              }`}
            >
              <Text className={`text-lg mr-1 ${
                qa === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                ✅
              </Text>
              <Text className={`font-medium text-xs ${
                qa === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                Yes
              </Text>
            </Pressable>

            {/* No Button */}
            <Pressable 
              onPress={() => setQa('No')}
              className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                qa === 'No' 
                  ? 'bg-[#4FC264]' 
                  : 'bg-[#EBF6D6]'
              }`}
            >
              <Text className={`text-lg mr-1 ${
                qa === 'No' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                ❌
              </Text>
              <Text className={`font-medium text-xs ${
                qa === 'No' ? 'text-white' : 'text-[#2c4a43]'
              }`}>
                No
              </Text>
            </Pressable>
          </View>
          {qa === 'No' && (
            <View className="mt-3">
              <Field 
                label="Comments / Questions" 
                placeholder="List any unresolved questions…"
                value={qaComments}
                onChangeText={setQaComments}
              />
            </View>
          )}
          
          {/* Extra space to ensure Comments field is not hidden by BottomBar */}
          <View style={{ height: 150 }} />
        </FormCard>
      </ScrollView>

      <BottomBar>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">Readiness: {String(ready)}</Text>
        <Btn variant="light" onPress={() => { }}>Validate</Btn>
        <Btn onPress={handleSave}>Save Pre‑VR</Btn>
      </BottomBar>
    </>
  );
}
