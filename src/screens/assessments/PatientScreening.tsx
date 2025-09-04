import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import Thermometer from '@components/Thermometer';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Segmented from '@components/Segmented';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from 'src/services';


interface ClinicalChecklist {
  PMEMID?: string;
  StudyId: string;
  ExeperiencType: string;
  SortKey?: number;
  Status: number
}

export default function PatientScreening() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [dt, setDt] = useState(0);
  const [implants, setImplants] = useState('');
  const [prosthetics, setProsthetics] = useState('');
  // const [conds, setConds] = useState<string[]>([]);

  // New state variables for previously hardcoded values
  const [participantId, setParticipantId] = useState('');
  // const [age, setAge] = useState('');
  const [date, setDate] = useState('');
  const [factGScore, setFactGScore] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bmi, setBmi] = useState('');
  const [notes, setNotes] = useState('');

  const [clinicalChecklist, setClinicalChecklist] = useState<ClinicalChecklist[]>([]);
  const [conds, setConds] = useState<string[]>([]);

 const route = useRoute<RouteProp<RootStackParamList, 'PatientScreening'>>();
  const { patientId, age, studyId } = route.params as { patientId: number, age: number, studyId: number };

    useEffect(() => {
    apiService
      .post<{ ResponseData: ClinicalChecklist[] }>("/GetParticipantMedicalExperienceData")
      .then((res) => {
        setClinicalChecklist(res.data.ResponseData || []);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {participantId || patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId || 'N/A'}
          </Text>

          <Text className="text-base font-semibold text-gray-700">
            Age: {age || 'Not specified'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        <FormCard icon="D" title="Patient Screening">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field 
                label="Participant ID" 
                placeholder={`Participant ID: ${patientId}`}
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

        <FormCard icon="I" title="Medical Details">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-muted">Distress Thermometer (0–10)</Text>
            <Pressable 
              onPress={() => navigation.navigate('DistressThermometerScreen', { patientId, age, studyId })}
              className="px-4 py-3 bg-[#0ea06c] rounded-lg"
            >
              <Text className="text-xs text-white font-medium">Assessment: Distress Thermometer scoring 0-10</Text>
            </Pressable>
          </View>
          <Thermometer value={dt} onChange={setDt} />
          <View className="flex-row gap-3 mt-6">
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-[#4b5f5a]">FACT-G Total Score</Text>
                <Pressable 
                  onPress={() => navigation.navigate('EdmontonFactGScreen', { patientId, age, studyId })}
                  className="px-4 py-3 bg-[#0ea06c] rounded-lg"
                >
                  <Text className="text-xs text-white font-medium">Assessment: Fact-G scoring 0-108</Text>
                </Pressable>
              </View>
              <Field 
                label=""
                keyboardType="number-pad" 
                placeholder="0–108"
                value={factGScore}
                onChangeText={setFactGScore}
              />
            </View>
          </View>

         <Text className="text-lg mt-3 font-semibold">Vitals</Text>
          <View className="flex-row gap-3 mt-3">
         
            <View className="flex-1">
              <Field 
                label="Pulse Rate (bpm)" 
                placeholder="76"
                value={pulseRate}
                onChangeText={setPulseRate}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Field 
                label="Blood Pressure (mmHg)" 
                placeholder="120/80"
                value={bloodPressure}
                onChangeText={setBloodPressure}
              />
            </View>
            <View className="flex-1">
              <Field 
                label="Temperature (°C)" 
                placeholder="36.8"
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Field 
                label="BMI" 
                placeholder="22.5"
                value={bmi}
                onChangeText={setBmi}
                keyboardType="numeric"
              />
            </View>
          </View>
        </FormCard>

        <FormCard icon="⚙️" title="Devices">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Any electronic implants?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable 
                  onPress={() => setImplants('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    implants === 'Yes' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    implants === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    implants === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable 
                  onPress={() => setImplants('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    implants === 'No' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    implants === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    implants === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-[#4b5f5a] mb-2">Any prosthetics or orthotics device?</Text>
              <View className="flex-row gap-2">
                {/* Yes Button */}
                <Pressable 
                  onPress={() => setProsthetics('Yes')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    prosthetics === 'Yes' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    prosthetics === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ✅
                  </Text>
                  <Text className={`font-medium text-xs ${
                    prosthetics === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable 
                  onPress={() => setProsthetics('No')}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                    prosthetics === 'No' 
                      ? 'bg-[#4FC264]' 
                      : 'bg-[#EBF6D6]'
                  }`}
                >
                  <Text className={`text-lg mr-1 ${
                    prosthetics === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    ❌
                  </Text>
                  <Text className={`font-medium text-xs ${
                    prosthetics === 'No' ? 'text-white' : 'text-[#2c4a43]'
                  }`}>
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </FormCard>

       <FormCard icon="✔︎" title="Clinical Checklist">
          <Chip
            items={clinicalChecklist.map(item => item.ExeperiencType)} // 👈 use API values
            value={conds}
            onChange={setConds}
          />

          <View className="mt-3">
            <Field
              label="Notes (optional)"
              placeholder="Add any clarifications…"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
          
          {/* Extra space to ensure Notes field is not hidden by BottomBar */}
          <View style={{ height: 150 }} />
        </FormCard>
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={() => { }} className="py-4">Validate</Btn>
        <Btn onPress={() => { }} className="py-4">Save Screening</Btn>
      </BottomBar>
    </>
  );
}
