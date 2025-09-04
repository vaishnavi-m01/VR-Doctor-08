import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import FormCard from "../../../../../components/FormCard";
import BottomBar from "../../../../../components/BottomBar";
import { Btn } from "../../../../../components/Button";
import { Field } from "../../../../../components/Field";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../../../Navigation/types";
import { apiService } from "src/services";
import Toast from 'react-native-toast-message';

interface FactGQuestion {
  FactGCategoryId: string;
  FactGCategoryName: string;
  FactGQuestionId: string;
  FactGQuestion: string;
  ScaleValue?: string;
}

interface FactGResponse {
  ResponseData: FactGQuestion[];
}

interface Subscale {
  key: string;
  label: string;
  items: { code: string; text: string; value?: string, FactGCategoryId?: string }[];
}

interface ScoreResults {
  PWB: number;
  SWB: number;
  EWB: number;
  FWB: number;
  TOTAL: number;
}

// helper to sum a subscale
const calculateSubscaleScore = (
  answers: Record<string, number | null>,
  itemCodes: string[]
) => {
  return itemCodes.reduce((sum, code) => {
    const value = answers[code];
    return sum + (value !== null && value !== undefined ? value : 0);
  }, 0);
};

// compute all scores
const computeScores = (answers: Record<string, number | null>): ScoreResults => {
  const PWB_ITEMS = ["GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7"];
  const SWB_ITEMS = ["GS1", "GS2", "GS3", "GS4", "GS5", "GS6"];
  const EWB_ITEMS = ["GE1", "GE2", "GE3", "GE4", "GE5", "GE6"];
  const FWB_ITEMS = ["GF1", "GF2", "GF3", "GF4", "GF5", "GF6", "GF7"];

  const PWB = calculateSubscaleScore(answers, PWB_ITEMS);
  const SWB = calculateSubscaleScore(answers, SWB_ITEMS);
  const EWB = calculateSubscaleScore(answers, EWB_ITEMS);
  const FWB = calculateSubscaleScore(answers, FWB_ITEMS);
  const TOTAL = PWB + SWB + EWB + FWB;

  return { PWB, SWB, EWB, FWB, TOTAL };
};

export default function EdmontonFactGScreen() {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [subscales, setSubscales] = useState<Subscale[]>([]);
  const [assessedOn, setAssessedOn] = useState("");
  const [assessedBy, setAssessedBy] = useState("");
  const [sessionNo, setSessionNo] = useState("1");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  const score: ScoreResults = useMemo(() => computeScores(answers), [answers]);

  const route = useRoute<RouteProp<RootStackParamList, "EdmontonFactGScreen">>();
  const navigation = useNavigation();
  const { patientId, age,studyId } = route.params as { patientId: number; age: number;studyId:number };

  function setAnswer(code: string, value: number) {
    setAnswers((prev) => ({ ...prev, [code]: value }));
  }

  function handleClear() {
    setAnswers({});
    setSelectedWeek(''); // Reset week dropdown to "Select Week"
    setShowWeekDropdown(false); // Close dropdown if open
  }

  const fetchFactG = async (weekNo = parseInt(selectedWeek.replace('week', ''))) => {
    try {
      const response = await apiService.post<FactGResponse>(
        "/getParticipantFactGQuestionBaseline",
        {
          WeekNo: weekNo,
          ParticipantId: `${patientId}`,
        }
      );

      const { ResponseData } = response.data;
      console.log("FactGResponseDataaa", ResponseData)

      // If API returns empty data, use default questions
      if (!ResponseData || ResponseData.length === 0) {
        console.log("No data returned from API, using default questions");
        const defaultSubscales: Subscale[] = [
          {
            key: "PWB",
            label: "Physical Well-Being",
            items: [
              { code: "GP1", text: "I have a lack of energy", FactGCategoryId: "PWB" },
              { code: "GP2", text: "I have nausea", FactGCategoryId: "PWB" },
              { code: "GP3", text: "Because of my physical condition, I have trouble meeting the needs of my family", FactGCategoryId: "PWB" },
              { code: "GP4", text: "I have pain", FactGCategoryId: "PWB" },
              { code: "GP5", text: "I am bothered by side effects of treatment", FactGCategoryId: "PWB" },
              { code: "GP6", text: "I feel ill", FactGCategoryId: "PWB" },
              { code: "GP7", text: "I am forced to spend time in bed", FactGCategoryId: "PWB" },
            ]
          },
          {
            key: "SWB",
            label: "Social/Family Well-Being",
            items: [
              { code: "GS1", text: "I feel close to my friends", FactGCategoryId: "SWB" },
              { code: "GS2", text: "I get emotional support from my family", FactGCategoryId: "SWB" },
              { code: "GS3", text: "I get support from my friends", FactGCategoryId: "SWB" },
              { code: "GS4", text: "My family has accepted my illness", FactGCategoryId: "SWB" },
              { code: "GS5", text: "I am satisfied with family communication about my illness", FactGCategoryId: "SWB" },
              { code: "GS6", text: "I feel close to my partner (or the person who is my main support)", FactGCategoryId: "SWB" },
            ]
          },
          {
            key: "EWB",
            label: "Emotional Well-Being",
            items: [
              { code: "GE1", text: "I feel sad", FactGCategoryId: "EWB" },
              { code: "GE2", text: "I am satisfied with how I am coping with my illness", FactGCategoryId: "EWB" },
              { code: "GE3", text: "I am losing hope in the fight against my illness", FactGCategoryId: "EWB" },
              { code: "GE4", text: "I feel nervous", FactGCategoryId: "EWB" },
              { code: "GE5", text: "I worry about dying", FactGCategoryId: "EWB" },
              { code: "GE6", text: "I worry that my condition will get worse", FactGCategoryId: "EWB" },
            ]
          },
          {
            key: "FWB",
            label: "Functional Well-Being",
            items: [
              { code: "GF1", text: "I am able to work (include work at home)", FactGCategoryId: "FWB" },
              { code: "GF2", text: "My work (include work at home) is fulfilling", FactGCategoryId: "FWB" },
              { code: "GF3", text: "I am able to enjoy life", FactGCategoryId: "FWB" },
              { code: "GF4", text: "I have accepted my illness", FactGCategoryId: "FWB" },
              { code: "GF5", text: "I am sleeping well", FactGCategoryId: "FWB" },
              { code: "GF6", text: "I am enjoying the things I usually do for fun", FactGCategoryId: "FWB" },
              { code: "GF7", text: "I am content with the quality of my life right now", FactGCategoryId: "FWB" },
            ]
          }
        ];
        setSubscales(defaultSubscales);
        return;
      }

      const grouped: Record<string, Subscale> = {};

      ResponseData.forEach((q) => {
        if (!grouped[q.FactGCategoryId]) {
          grouped[q.FactGCategoryId] = {
            key: q.FactGCategoryId,
            label: q.FactGCategoryName,
            items: [],
          };
        }
        grouped[q.FactGCategoryId].items.push({
          code: q.FactGQuestionId,
          FactGCategoryId: q.FactGCategoryId,
          text: q.FactGQuestion,
          value: q.ScaleValue,
        });
      });

      setSubscales(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching FactG:", error);
      // Fallback to default questions if API fails
      console.log("API failed, using default questions");
      const defaultSubscales: Subscale[] = [
        {
          key: "PWB",
          label: "Physical Well-Being",
          items: [
            { code: "GP1", text: "I have a lack of energy", FactGCategoryId: "PWB" },
            { code: "GP2", text: "I have nausea", FactGCategoryId: "PWB" },
            { code: "GP3", text: "Because of my physical condition, I have trouble meeting the needs of my family", FactGCategoryId: "PWB" },
            { code: "GP4", text: "I have pain", FactGCategoryId: "PWB" },
            { code: "GP5", text: "I am bothered by side effects of treatment", FactGCategoryId: "PWB" },
            { code: "GP6", text: "I feel ill", FactGCategoryId: "PWB" },
            { code: "GP7", text: "I am forced to spend time in bed", FactGCategoryId: "PWB" },
          ]
        },
        {
          key: "SWB",
          label: "Social/Family Well-Being",
          items: [
            { code: "GS1", text: "I feel close to my friends", FactGCategoryId: "SWB" },
            { code: "GS2", text: "I get emotional support from my family", FactGCategoryId: "SWB" },
            { code: "GS3", text: "I get support from my friends", FactGCategoryId: "SWB" },
            { code: "GS4", text: "My family has accepted my illness", FactGCategoryId: "SWB" },
            { code: "GS5", text: "I am satisfied with family communication about my illness", FactGCategoryId: "SWB" },
            { code: "GS6", text: "I feel close to my partner (or the person who is my main support)", FactGCategoryId: "SWB" },
          ]
        },
        {
          key: "EWB",
          label: "Emotional Well-Being",
          items: [
            { code: "GE1", text: "I feel sad", FactGCategoryId: "EWB" },
            { code: "GE2", text: "I am satisfied with how I am coping with my illness", FactGCategoryId: "EWB" },
            { code: "GE3", text: "I am losing hope in the fight against my illness", FactGCategoryId: "EWB" },
            { code: "GE4", text: "I feel nervous", FactGCategoryId: "EWB" },
            { code: "GE5", text: "I worry about dying", FactGCategoryId: "EWB" },
            { code: "GE6", text: "I worry that my condition will get worse", FactGCategoryId: "EWB" },
          ]
        },
        {
          key: "FWB",
          label: "Functional Well-Being",
          items: [
            { code: "GF1", text: "I am able to work (include work at home)", FactGCategoryId: "FWB" },
            { code: "GF2", text: "My work (include work at home) is fulfilling", FactGCategoryId: "FWB" },
            { code: "GF3", text: "I am able to enjoy life", FactGCategoryId: "FWB" },
            { code: "GF4", text: "I have accepted my illness", FactGCategoryId: "FWB" },
            { code: "GF5", text: "I am sleeping well", FactGCategoryId: "FWB" },
            { code: "GF6", text: "I am enjoying the things I usually do for fun", FactGCategoryId: "FWB" },
            { code: "GF7", text: "I am content with the quality of my life right now", FactGCategoryId: "FWB" },
          ]
        }
      ];
      setSubscales(defaultSubscales);
    }
  };

  useEffect(() => {
    fetchFactG();
  }, [selectedWeek]);

  const handleSave = async () => {
    try {
      const responses = Object.keys(answers).map((code) => {
        const foundItem = subscales
          .flatMap((s) => s.items)
          .find((item) => item.code === code);

        return {
          FactGCategoryId: foundItem?.FactGCategoryId,
          FactGQuestionId: code,
          ScaleValue: String(answers[code]),   
          FlagStatus: "Yes",                  
        };
      });

      const payload = {
        StudyId: "CS-0001",
        ParticipantId: `${patientId}`,
        WeekNo: selectedWeek ? parseInt(selectedWeek.replace('week', '')) : 1,
        FactGData: responses,
        CreatedBy: "UH-1000",
        CreatedDate: new Date().toISOString().split("T")[0],
      };

      console.log(" FactG Sending Payload:", payload);

      const response = await apiService.post(
        "/AddParticipantFactGQuestionsBaseline",
        payload
      );

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "FACT-G responses saved successfully!",
          position: "top",
          topOffset: 50,
          onHide: () => navigation.goBack(),
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong. Please try again.",
          position: "top",
          topOffset: 50,
        });
      }
    } catch (error: any) {
      console.error("Error saving FACT-G:", error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save FACT-G responses.",
        position: "top",
        topOffset: 50,
      });
    }
  };


  return (
    <>
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId || 'N/A'}
          </Text>

          <View className="flex-row items-center gap-3">
            <Text className="text-base font-semibold text-gray-700">Age: {age}</Text>
            
            {/* Week Dropdown - Next to Age */}
            <View className="w-32">
              <Pressable 
                className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-row justify-between items-center"
                onPress={() => setShowWeekDropdown(!showWeekDropdown)}
                style={{
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                }}
              >
                <Text className="text-sm text-gray-700">
                  {selectedWeek === "week1" ? "Week 1" : 
                   selectedWeek === "week2" ? "Week 2" : 
                   selectedWeek === "week3" ? "Week 3" : 
                   selectedWeek === "week4" ? "Week 4" : "Select Week"}
                </Text>
                <Text className="text-gray-500 text-xs">▼</Text>
              </Pressable>
            </View>
          </View>
        </View>
        
        {/* Dropdown Menu - Positioned outside the header container */}
        {showWeekDropdown && (
          <View className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-28">
            <Pressable 
              className="px-3 py-2 border-b border-gray-100"
              onPress={() => {
                setSelectedWeek("week1");
                setShowWeekDropdown(false);
              }}
            >
              <Text className="text-sm text-gray-700">Week 1</Text>
            </Pressable>
            <Pressable 
              className="px-3 py-2 border-b border-gray-100"
              onPress={() => {
                setSelectedWeek("week2");
                setShowWeekDropdown(false);
              }}
            >
              <Text className="text-sm text-gray-700">Week 2</Text>
            </Pressable>
            <Pressable 
              className="px-3 py-2 border-b border-gray-100"
              onPress={() => {
                setSelectedWeek("week3");
                setShowWeekDropdown(false);
              }}
            >
              <Text className="text-sm text-gray-700">Week 3</Text>
            </Pressable>
            <Pressable 
              className="px-3 py-2"
              onPress={() => {
                setSelectedWeek("week4");
                setShowWeekDropdown(false);
              }}
            >
              <Text className="text-sm text-gray-700">Week 4</Text>
            </Pressable>
          </View>
        )}
      </View>

             <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
        <FormCard
          icon="FG"
          title="FACT-G (Version 4)"
          desc="Considering the past 7 days, choose one number per line. 0=Not at all ... 4=Very much."
        >
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-2">
                <Text className="font-bold text-xl text-[#2E7D32]">FG</Text>
              </View>
              <View>
                <Text className="font-bold text-lg text-[#333]">
                  FACT-G Assessment
                </Text>
                <Text className="text-xs text-[#6b7a77]">
                  "Considering the past 7 days, choose one number per line."
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Participant ID" placeholder={`${patientId}`} editable={false} />
            </View>
            <View className="flex-1">
              <Field
                label="Assessed On"
                placeholder="YYYY-MM-DD"
                value={assessedOn}
                onChangeText={setAssessedOn}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Assessed By"
                placeholder="Name & role"
                value={assessedBy}
                onChangeText={setAssessedBy}
              />
            </View>
          </View>
        </FormCard>

        {subscales.map((scale) => (
          <FormCard key={scale.key} icon={scale.key[0]} title={scale.label}>
            {scale.items.map((item) => (
              <View
                key={item.code}
                className="flex-row items-center gap-3 mb-2"
              >
                <Text className="w-16 text-ink font-bold">{item.code}</Text>
                <Text className="flex-1 text-sm">{item.text}</Text>
                <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
                  <View className="flex-row">
                    {[0, 1, 2, 3, 4].map((value, index) => (
                      <React.Fragment key={value}>
                        <Pressable
                          onPress={() => setAnswer(item.code, value)}
                          className={`w-12 py-2 items-center justify-center ${answers[item.code] === value
                              ? "bg-[#7ED321]"
                              : "bg-white"
                            }`}
                        >
                          <Text
                            className={`font-medium text-sm ${answers[item.code] === value
                                ? "text-white"
                                : "text-[#4b5f5a]"
                              }`}
                          >
                            {value}
                          </Text>
                        </Pressable>
                        {index < 4 && <View className="w-px bg-[#e6eeeb]" />}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </FormCard>
                 ))}
         
         {/* Extra space to ensure content is not hidden by BottomBar */}
         <View style={{ height: 150 }} />
       </ScrollView>

      <BottomBar>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          PWB {score.PWB}
        </Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          SWB {score.SWB}
        </Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          EWB {score.EWB}
        </Text>
        <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">
          FWB {score.FWB}
        </Text>
        <Text className="px-3 py-2 rounded-xl bg-[#134b3b] text-white font-extrabold">
          TOTAL {score.TOTAL}
        </Text>
        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn onPress={handleSave}>Save</Btn>
      </BottomBar>
    </>
  );
}
