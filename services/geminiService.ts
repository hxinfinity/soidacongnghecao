
import { GoogleGenAI, Type } from "@google/genai";
import { SkinAnalysisResult } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overview: {
      type: Type.OBJECT,
      properties: {
        skin_score: { type: Type.NUMBER },
        skin_type: { type: Type.STRING },
        top_3_issues: { type: Type.ARRAY, items: { type: Type.STRING } },
        weakest_area: { type: Type.STRING }
      },
      required: ["skin_score", "skin_type", "top_3_issues", "weakest_area"]
    },
    layers: {
      type: Type.OBJECT,
      properties: {
        surface: { 
          type: Type.OBJECT, 
          properties: { 
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
            heatmap_description: { type: Type.STRING }
          },
          required: ["title", "description", "metrics", "heatmap_description"]
        },
        pigmentation: { 
          type: Type.OBJECT, 
          properties: { 
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
            heatmap_description: { type: Type.STRING }
          },
          required: ["title", "description", "metrics", "heatmap_description"]
        },
        dermis: { 
          type: Type.OBJECT, 
          properties: { 
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
            heatmap_description: { type: Type.STRING }
          },
          required: ["title", "description", "metrics", "heatmap_description"]
        },
        vascular: { 
          type: Type.OBJECT, 
          properties: { 
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
            heatmap_description: { type: Type.STRING }
          },
          required: ["title", "description", "metrics", "heatmap_description"]
        }
      },
      required: ["surface", "pigmentation", "dermis", "vascular"]
    },
    detailed_metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER },
          severity: { type: Type.STRING },
          analysis: { type: Type.STRING },
          cause: { type: Type.STRING },
          highlight_areas: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ["name", "score", "severity", "analysis", "cause", "recommendation"]
      }
    },
    symmetry: {
      type: Type.OBJECT,
      properties: {
        balance_score: { type: Type.NUMBER },
        weak_side: { type: Type.STRING },
        comparison: { type: Type.STRING },
        t_zone_vs_u_zone: { type: Type.STRING }
      },
      required: ["balance_score", "weak_side", "comparison", "t_zone_vs_u_zone"]
    },
    aging: {
      type: Type.OBJECT,
      properties: {
        without_care: { type: Type.STRING },
        with_care: { type: Type.STRING },
        improvement_percent: { type: Type.NUMBER }
      },
      required: ["without_care", "with_care", "improvement_percent"]
    },
    treatment: {
      type: Type.OBJECT,
      properties: {
        plan_name: { type: Type.STRING },
        description: { type: Type.STRING },
        duration_30_days: { type: Type.STRING },
        duration_60_days: { type: Type.STRING },
        duration_90_days: { type: Type.STRING },
        suggested_services: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["plan_name", "description", "duration_30_days", "duration_60_days", "duration_90_days", "suggested_services"]
    }
  },
  required: ["overview", "layers", "detailed_metrics", "symmetry", "aging", "treatment"]
};

export async function analyzeSkinImage(base64Image: string): Promise<SkinAnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = "gemini-3-pro-preview";
  const prompt = `Bạn là một chuyên gia da liễu cao cấp tại Hoàng Gia Spa. Hãy phân tích ảnh da mặt này với độ chính xác cấp độ máy soi da chuyên nghiệp (VISIA). 
  Yêu cầu phân tích chi tiết:
  1. Tổng quan da (Skin Score PRO, Loại da, Top 3 vấn đề, Vùng yếu nhất).
  2. Phân tích 4 tầng (Biểu bì, Sắc tố, Trung bì, Mao mạch).
  3. Phân tích 12 hạng mục chi tiết: Nám mảng, Nám chân đinh, Tàn nhang, Mụn viêm, Mụn ẩn, Mụn đầu đen, Lỗ chân lông, Nếp nhăn, Độ đàn hồi, Kết cấu da, Da dầu/khô theo vùng, Lão hóa dự đoán.
  4. Dự đoán lão hóa trong 3-5 năm.
  5. Phân tích đối xứng (Trái/Phải) và T-zone/U-zone.
  6. Đề xuất phác đồ điều trị chuyên sâu tại Spa (Peel, Laser, Meso, etc.).
  
  Trả về kết quả hoàn toàn bằng tiếng Việt dưới định dạng JSON theo schema đã cung cấp.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any,
    },
  });

  if (!response.text) {
    throw new Error("Không nhận được kết quả từ AI.");
  }

  try {
    return JSON.parse(response.text) as SkinAnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response", response.text);
    throw new Error("Lỗi định dạng dữ liệu từ AI. Vui lòng thử lại.");
  }
}
