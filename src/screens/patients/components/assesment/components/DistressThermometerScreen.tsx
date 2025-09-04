import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import Checkbox from "../../../../../components/Checkbox";
import FormCard from "../../../../../components/FormCard";
import Thermometer from "../../../../../components/Thermometer";
import { useRoute, RouteProp } from "@react-navigation/native";
import BottomBar from "@components/BottomBar";
import { Btn } from "@components/Button";
import { RootStackParamList } from "../../../../../Navigation/types";
import { apiService } from "src/services";
import Toast from "react-native-toast-message";

// Define expected API types
type Question = {
  id: string;
  label: string;
};

type Category = {
  categoryName: string;
  questions: Question[];
};

export default function DistressThermometerScreen() {
  const [v, setV] = useState(0);
  const [notes, setNotes] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  const route =
    useRoute<RouteProp<RootStackParamList, "DistressThermometerScreen">>();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number;
  };
  const [enteredPatientId, setEnteredPatientId] = useState<string>(
    patientId.toString()
  );

  // Toggle a problem selection
  const toggleProblem = (uniqueId: string) => {
    setSelectedProblems((prev) => ({
      ...prev,
      [uniqueId]: !prev[uniqueId],
    }));
  };

  const getData = async (weekNo = parseInt(selectedWeek.replace("week", ""))) => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiService.post<{ ResponseData: any[] }>(
        "/GetParticipantDistressThermometerBaselineQA"
      );

      const responseData = res.data?.ResponseData;

      if (Array.isArray(responseData) && responseData.length > 0) {
        // Group questions by category
        const grouped: Category[] = Object.values(
          responseData.reduce((acc: Record<string, Category>, item) => {
            const catName = item.CategoryName;
            if (!acc[catName]) {
              acc[catName] = { categoryName: catName, questions: [] };
            }
            acc[catName].questions.push({
              id: item.DistressQuestionId,
              label: item.Question,
            });
            return acc;
          }, {})
        );

        setCategories(grouped);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedWeek]);

  const handleSave = async () => {
    try {
      setLoading(true);

   
      const selectedDistressData = categories.flatMap((cat) =>
        cat.questions
          .map((q, idx) => {
            const uniqueId = `${cat.categoryName}_${q.id}_${idx}`;
            if (selectedProblems[uniqueId]) {
              return { DistressQuestionId: q.id };
            }
            return null;
          })
          .filter(Boolean) 
      );

    
      const reqObj = {
        ParticipantId: `${patientId}`,
        StudyId: "CS-0001",
        CreatedBy: "UH-1000",
        DistressData: selectedDistressData,
      };

      console.log("Saving Problem List payload:", reqObj);

      const res1 = await apiService.post(
        "/AddUpdateParticipantDistressThermometerBaselineQA",
        reqObj
      );

      console.log("Problem List saved:", res1.data);

      const scoreObj = {
        ParticipantId: `${patientId}`,
        StudyId: "CS-0001",
        DistressThermometerScore: `${v}`,
        ModifiedBy: "UH-1000",
      };

      console.log("Saving Score payload:", scoreObj);

      const res2 = await apiService.post(
        "/AddUpdateParticipantDistressThermoScore",
        scoreObj
      );

      console.log("Score saved:", res2.data);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Distress Thermometer saved successfully!",
        position: "top",
        topOffset: 50,
      });
    } catch (err) {
      console.error("Save error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save distress thermometer.",
        position: "top",
        topOffset: 50,
      });
    } finally {
      setLoading(false);
    }
  };



  const handleClear = () => {
    setV(0);
    setNotes("");
    setSelectedProblems({});
    setSelectedWeek(""); // Reset week dropdown
    setShowWeekDropdown(false);
  };

  return (
    <>
      {/* Header Card */}
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId || "N/A"}
          </Text>

          <View className="flex-row items-center gap-3">
            <Text className="text-base font-semibold text-gray-700">
              Age: {age || "Not specified"}
            </Text>

            {/* Week Dropdown */}
            <View className="w-32">
              <Pressable
                className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-row justify-between items-center"
                onPress={() => setShowWeekDropdown(!showWeekDropdown)}
              >
                <Text className="text-sm text-gray-700">
                  {selectedWeek === "week1"
                    ? "Week 1"
                    : selectedWeek === "week2"
                      ? "Week 2"
                      : selectedWeek === "week3"
                        ? "Week 3"
                        : selectedWeek === "week4"
                          ? "Week 4"
                          : "Select Week"}
                </Text>
                <Text className="text-gray-500 text-xs">▼</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {showWeekDropdown && (
          <View className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-28">
            {["week1", "week2", "week3", "week4"].map((week) => (
              <Pressable
                key={week}
                className="px-3 py-2 border-b border-gray-100"
                onPress={() => {
                  setSelectedWeek(week);
                  setShowWeekDropdown(false);
                }}
              >
                <Text className="text-sm text-gray-700">
                  {week.replace("week", "Week ")}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ScrollView className="flex-1 bg-gray-100 p-4 pb-[200px]">
        {/* Distress Thermometer Card */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-2">
                <Text className="font-bold text-xl text-[#2E7D32]">DT</Text>
              </View>
              <View>
                <Text className="font-bold text-lg text-[#333]">
                  Distress Thermometer
                </Text>
                <Text className="text-xs text-[#6b7a77]">
                  "Considering the past week, including today."
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mb-2">
            <View className="flex-1">
              <Text className="text-xs text-[#6b7a77] mb-2">Participant ID</Text>
              <TextInput
                className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-700"
                value={enteredPatientId}
                onChangeText={setEnteredPatientId}
                placeholder="Enter Patient ID"
              />
            </View>
          </View>
        </View>

        {/* Rate Distress */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="font-bold text-lg text-[#333] mb-4">
            Rate Your Distress (0-10)
          </Text>
          <FormCard icon="DT" title="Distress Thermometer">
            <Thermometer value={v} onChange={setV} />
          </FormCard>
        </View>

        {/* Dynamic Problem List */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="font-bold text-lg text-[#333] mb-4">
            Problem List
          </Text>

          {loading && <Text className="text-gray-500">Loading...</Text>}
          {error && <Text className="text-red-500">{error}</Text>}

          {categories.map((cat, index) => (
            <View key={index} className="mb-4">
              <Text className="font-bold mb-2 text-sm text-[#333]">
                {cat.categoryName}
              </Text>
              <View className="flex-row flex-wrap">
                {cat.questions?.map((q, idx) => {
                  const uniqueId = `${cat.categoryName}_${q.id}_${idx}`;
                  return (
                    <Checkbox
                      key={uniqueId}
                      label={q.label}
                      isChecked={!!selectedProblems[uniqueId]}
                      onToggle={() => toggleProblem(uniqueId)}
                    />
                  );
                })}

              </View>
            </View>
          ))}

          <View className="flex-1 mr-1">
            <Text className="text-xs text-[#6b7a77] mb-2">Other Problems</Text>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-700"
              placeholder="Enter other problems..."
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn variant="light" onPress={() => { }}>
          Validate
        </Btn>
        <Btn onPress={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Distress Thermometer"}
        </Btn>
      </BottomBar>
    </>
  );
}
