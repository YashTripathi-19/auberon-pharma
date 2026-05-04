export interface TestPlate {
  id: number;
  imageType: "ishihara";
  question: string;
  options: string[];
  correctAnswer: string;
  detectionType: "normal" | "red-green" | "blue-yellow" | "total";
  svgDescription: string;
}

export interface TestResult {
  type: "Normal Vision" | "Red-Green Deficiency" | "Blue-Yellow Deficiency" | "Total Colour Blindness" | "Mild Colour Deficiency";
  severity: "None" | "Mild" | "Moderate" | "Severe";
  description: string;
  recommendation: string;
  score: number;
  totalPlates: number;
}

export const TEST_PLATES: TestPlate[] = [
  {
    id: 1,
    imageType: "ishihara",
    question: "What number do you see in this image?",
    options: ["12", "2", "6", "Nothing"],
    correctAnswer: "12",
    detectionType: "normal",
    svgDescription: "Plate showing number 12 — visible to normal vision",
  },
  {
    id: 2,
    imageType: "ishihara",
    question: "What number do you see in this image?",
    options: ["8", "3", "Nothing", "6"],
    correctAnswer: "8",
    detectionType: "red-green",
    svgDescription: "Plate showing number 8 — invisible to red-green deficient",
  },
  {
    id: 3,
    imageType: "ishihara",
    question: "What number do you see in this image?",
    options: ["29", "70", "Nothing", "20"],
    correctAnswer: "29",
    detectionType: "red-green",
    svgDescription: "Plate showing number 29",
  },
  {
    id: 4,
    imageType: "ishihara",
    question: "What number do you see in this image?",
    options: ["5", "Nothing", "2", "6"],
    correctAnswer: "5",
    detectionType: "blue-yellow",
    svgDescription: "Plate showing number 5",
  },
  {
    id: 5,
    imageType: "ishihara",
    question: "What number do you see in this image?",
    options: ["Nothing", "3", "7", "45"],
    correctAnswer: "Nothing",
    detectionType: "total",
    svgDescription: "Plate visible only to colour blind individuals",
  },
  {
    id: 6,
    imageType: "ishihara",
    question: "What number do you see in this image?",
    options: ["15", "17", "Nothing", "10"],
    correctAnswer: "15",
    detectionType: "normal",
    svgDescription: "Plate showing number 15",
  },
];

export function calculateResult(answers: Record<number, string>): TestResult {
  let correctCount = 0;
  let redGreenErrors = 0;
  let blueYellowErrors = 0;
  let totalErrors = 0;

  TEST_PLATES.forEach((plate) => {
    const userAnswer = answers[plate.id];
    if (userAnswer === plate.correctAnswer) {
      correctCount++;
    } else {
      if (plate.detectionType === "red-green") redGreenErrors++;
      if (plate.detectionType === "blue-yellow") blueYellowErrors++;
      if (plate.detectionType === "total") totalErrors++;
    }
  });

  const score = correctCount;
  const total = TEST_PLATES.length;

  if (score === total) {
    return {
      type: "Normal Vision",
      severity: "None",
      description: "Your colour vision appears to be normal. You correctly identified all test plates.",
      recommendation: "No immediate action needed. Continue regular eye check-ups annually.",
      score,
      totalPlates: total,
    };
  } else if (redGreenErrors >= 2) {
    const severity = redGreenErrors >= 3 ? "Severe" : redGreenErrors === 2 ? "Moderate" : "Mild";
    return {
      type: "Red-Green Deficiency",
      severity,
      description: `You may have a red-green colour vision deficiency. This is the most common type affecting approximately 8% of males and 0.5% of females.`,
      recommendation: "We recommend consulting an ophthalmologist for a detailed Ishihara colour vision test and professional diagnosis.",
      score,
      totalPlates: total,
    };
  } else if (blueYellowErrors >= 1) {
    return {
      type: "Blue-Yellow Deficiency",
      severity: "Moderate",
      description: "You may have a blue-yellow colour vision deficiency (Tritanopia). This is less common than red-green deficiency.",
      recommendation: "Please consult an eye specialist for a comprehensive colour vision evaluation.",
      score,
      totalPlates: total,
    };
  } else if (score <= 2) {
    return {
      type: "Total Colour Blindness",
      severity: "Severe",
      description: "Your results suggest significant difficulty distinguishing colours. This could indicate achromatopsia or another colour vision condition.",
      recommendation: "We strongly recommend an urgent consultation with an ophthalmologist for a thorough evaluation.",
      score,
      totalPlates: total,
    };
  } else {
    return {
      type: "Mild Colour Deficiency",
      severity: "Mild",
      description: "You have a mild colour vision deficiency. You may have occasional difficulty distinguishing certain colours.",
      recommendation: "A consultation with an eye care professional is advisable for further evaluation.",
      score,
      totalPlates: total,
    };
  }
}
