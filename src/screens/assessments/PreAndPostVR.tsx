import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import axios from 'axios';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';

type Question = {
  PPVRQMID: string;
  StudyId: string;
  QuestionName: string;
  Type: 'Pre' | 'Post';
  SortKey: number;
  Status: number;
};

export default function PreAndPostVR() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PreAndPostVR'>>();
  const { patientId, age, studyId } = route.params as { patientId: number; age: number; studyId: number };

  const [sessionDate, setSessionDate] = useState<string>("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [participantIdInput, setParticipantIdInput] = useState(`${patientId}`);
  const [dateInput, setDateInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiService.post<{ ResponseData: Question[] }>("/GetPrePostVRSessionQuestionData");
        setQuestions(res.data.ResponseData);
      } catch (err) {
        console.error('Error fetching questions:', err);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load questions.',
          position: 'top',
          topOffset: 50,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [studyId]);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch questions first
      const res = await apiService.post<{ ResponseData: Question[] }>("/GetPrePostVRSessionQuestionData");
      setQuestions(res.data.ResponseData);

      // Assuming there's an API to get saved answers for given patient & study
      const answersRes = await apiService.post<{ ResponseData: Array<{ QuestionId: string, Answer: string, Notes?: string }> }>("/GetParticipantPrePostVRAnswers", {
        ParticipantId: patientId,
        StudyId: studyId,
      });

      if (answersRes.data.ResponseData) {
        // Map ResponseData to answers and notes state
        const loadedAnswers: Record<string, string> = {};
        const loadedNotes: Record<string, string> = {};
        for (const ans of answersRes.data.ResponseData) {
          loadedAnswers[ans.QuestionId] = ans.Answer; 
          if (ans.Notes) loadedNotes[ans.QuestionId] = ans.Notes;
        }
        setAnswers(loadedAnswers);
        setNotes(loadedNotes);
      }
    } catch (err) {
      console.error('Error fetching questions or answers:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load questions or answers.',
        position: 'top',
        topOffset: 50,
      });
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [patientId, studyId]);


  const handleAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
      setErrors(prev => ({ ...prev, [id]: "" }));
  };

  const handleNote = (id: string, value: string) => {
    setNotes(prev => ({ ...prev, [id]: value }));
  };

  const preQuestions = questions.filter(q => q.Type === 'Pre');
  const postQuestions = questions.filter(q => q.Type === 'Post');

  // Calculate mood delta
  const delta = useMemo(() => {
    const preGood = questions.find(q => q.Type === 'Pre' && q.QuestionName === 'Do you feel good?');
    const postGood = questions.find(q => q.Type === 'Post' && q.QuestionName === 'Do you feel good?');
    return (answers[postGood?.PPVRQMID || ''] === 'Yes' ? 1 : 0) - (answers[preGood?.PPVRQMID || ''] === 'Yes' ? 1 : 0);
  }, [answers, questions]);

  // Symptom flag
  const flag = useMemo(() => {
    const symptomKeys = questions
      .filter(q =>
        ['Do you have Headache & Aura?', 'Do you have dizziness?', 'Do you have Blurred Vision?', 'Do you have Vertigo?', 'Do you experience any discomfort?'].includes(
          q.QuestionName
        )
      )
      .map(q => q.PPVRQMID);

    return symptomKeys.some(id => answers[id] === 'Yes');
  }, [answers, questions]);

  const validateAnswers = () => {
    
    const newErrors: Record<string, string> = {};


    if (!participantIdInput.trim()) {
      newErrors['participantId'] = 'Participant ID is required';
    }

    // if (!dateInput.trim()) {
    //   newErrors['date'] = 'Date is required';
    // }

    for (const question of questions) {
      if (!answers[question.PPVRQMID]) {
        newErrors[question.PPVRQMID] = 'Answer is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateAnswers()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please answer all required questions before saving.',
        position: 'top',
        topOffset: 50,
      });
      return;
    }

    setSubmitting(true);
    try {
      const PPPVRId = "PPPVRID-2";
      const sessionNo = "SessionNo-1";
      const modifiedBy = "UH-1000";
      const status = "1";

      for (const question of questions) {
        const answer = answers[question.PPVRQMID];
     

        const payload = {
          PPPVRId: PPPVRId,
          ParticipantId: `${patientId}`,
          StudyId: studyId,
          SessionNo: sessionNo,
          QuestionId: question.PPVRQMID,
          ScaleValue: "5", // static 5 as requested
          Notes: notes[question.PPVRQMID] || "",
          Status: status,
          ModifiedBy: modifiedBy,
        };

        // Log the full payload before sending to API
        console.log("Sending API payload:", JSON.stringify(payload, null, 2));

        await apiService.post("/AddUpdateParticipantPrePostVRSessions", payload);
      }
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Responses saved successfully!',
        position: 'top',
        topOffset: 50,
        visibilityTime: 2000,
        onHide: () => navigation.goBack(),
      });

      navigation.goBack();
    } catch (err) {
      console.error("Error saving responses:", err);
       Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save responses.',
        position: 'top',
        topOffset: 50,
      });
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4FC264" />
        <Text className="mt-2">Loading questions…</Text>
      </View>
    );
  }

  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">Participant ID: {patientId}</Text>
          <Text className="text-base font-semibold text-green-600">Study ID: {studyId || 'N/A'}</Text>
          <Text className="text-base font-semibold text-gray-700">Age: {age}</Text>
        </View>
      </View>

      <ScrollView className="px-4 pt-4 bg-bg pb-[400px]">
        <FormCard icon="I" title="Pre & Post VR">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Participant ID" placeholder={`Participant ID: ${patientId}`} />
              {errors['participantId'] && (
                <Text className="text-red-500 text-xs mt-1">{errors['participantId']}</Text>
              )}
            </View>
            <View className="flex-1">
              <DateField 
               label="Date" 
                value={sessionDate} 
                onChange={setSessionDate} 
              />
              {/* {errors['date'] && (
                <Text className="text-red-500 text-xs mt-1">{errors['date']}</Text>
              )} */}
            </View>
          </View>
        </FormCard>

        {/* Pre Questions */}
        <FormCard icon="A" title="Pre Virtual Reality Questions">
          {preQuestions.map(q => (
            <View key={q.PPVRQMID} className="mb-3">
              <Text className="text-xs text-[#4b5f5a] mb-2">{q.QuestionName}</Text>
              <View className="flex-row gap-2">
                {['Yes', 'No'].map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => handleAnswer(q.PPVRQMID, opt)}
                    className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                      answers[q.PPVRQMID] === opt ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                  >
                    <Text className={`text-lg mr-1 ${answers[q.PPVRQMID] === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                      {opt === 'Yes' ? '✅' : '❌'}
                    </Text>
                    <Text className={`font-medium text-xs ${answers[q.PPVRQMID] === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {errors[q.PPVRQMID] && (
                <Text className="text-red-500 text-xs mt-1">{errors[q.PPVRQMID]}</Text>
              )}

              {answers[q.PPVRQMID] === 'Yes' && q.QuestionName !== 'Do you feel good?' && (
                <View className="mt-3">
                  <Field 
                    label="Notes (optional)" 
                    placeholder="Add details…" 
                    onChangeText={(text) => handleNote(q.PPVRQMID, text)}
                  />
                </View>
              )}
            </View>
          ))}
        </FormCard>

        {/* Post Questions */}
        <FormCard icon="B" title="Post Virtual Reality Questions">
          {postQuestions.map(q => (
            <View key={q.PPVRQMID} className="mb-3">
              <Text className="text-xs text-[#4b5f5a] mb-2">{q.QuestionName}</Text>
              <View className="flex-row gap-2">
                {['Yes', 'No'].map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => handleAnswer(q.PPVRQMID, opt)}
                    className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                      answers[q.PPVRQMID] === opt ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                    }`}
                  >
                    <Text className={`text-lg mr-1 ${answers[q.PPVRQMID] === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                      {opt === 'Yes' ? '✅' : '❌'}
                    </Text>
                    <Text className={`font-medium text-xs ${answers[q.PPVRQMID] === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>
               {errors[q.PPVRQMID] && (
                <Text className="text-red-500 text-xs mt-1">{errors[q.PPVRQMID]}</Text>
              )}

              {/* Conditional extra inputs */}
              {q.QuestionName === 'Do you experience any discomfort?' && answers[q.PPVRQMID] === 'Yes' && (
                <View className="mt-3">
                  <Field 
                    label="Please describe" 
                    placeholder="Dizziness, nausea, etc." 
                    onChangeText={(text) => handleNote(q.PPVRQMID, text)}
                  />
                </View>
              )}
              {answers[q.PPVRQMID] === 'No' && q.QuestionName !== 'Do you experience any discomfort?' && (
                <View className="mt-3">
                  <Field 
                    label="Please specify" 
                    placeholder="e.g., audio low, visuals blurry…" 
                    onChangeText={(text) => handleNote(q.PPVRQMID, text)}
                  />
                </View>
              )}
            </View>
          ))}
        </FormCard>
      </ScrollView>

      {/* Bottom Bar */}
      <BottomBar>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          Mood Δ: {delta > 0 ? '+1' : delta < 0 ? '-1' : '0'}
        </Text>
        {flag && <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">⚠︎ Review symptoms</Text>}
        <Btn variant="light" onPress={() => {}}>Validate</Btn>
        <Btn onPress={handleSave} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </Btn>
      </BottomBar>
    </>
  );
}