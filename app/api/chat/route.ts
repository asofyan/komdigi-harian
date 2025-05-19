import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const APP_ID = process.env.APP_ID;
  const API_KEY = process.env.API_KEY;

  try {
    const dashscopeRes = await fetch(
      `https://dashscope-intl.aliyuncs.com/api/v1/apps/${APP_ID}/completion`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { prompt },
          parameters: {},
          debug: {},
        }),
      }
    );

    const data = await dashscopeRes.json();
    // Adjust this if the response structure is different
    const result =
      data.output?.choices?.[0]?.message?.content?.trim() ||
      data.output?.text?.trim() ||
      JSON.stringify(data) ||
      "No response.";

    return NextResponse.json({ result });
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      JSON.stringify(error);
    return NextResponse.json({ result: message }, { status: 500 });
  }
}