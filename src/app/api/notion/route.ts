import { NextResponse } from "next/server";

interface NotionTask {
  name: string;
  status: string;
  deadline?: string;
  url: string;
  assignee?: string;
}

// Real data from Notion 프로젝트 보드 (업무) - Last synced: 2026-03-29
const FALLBACK_TASKS: NotionTask[] = [
  { name: "창업대학 서류접수 마감일", status: "진행 중", deadline: "2026-03-23", url: "https://www.notion.so/31a7a0d68bfb803ca1f1cd5b7502c5b6", assignee: "대왕" },
  { name: "쿡링", status: "진행 중", deadline: "2026-04-17", url: "https://www.notion.so/31a7a0d68bfb80aa837afc81791d05e0", assignee: "대왕" },
  { name: "유튜브 채널 관리", status: "진행 중", url: "https://www.notion.so/31a7a0d68bfb802b81b7c18a8ea0c289", assignee: "김진모" },
  { name: "AI 통합 프로젝트", status: "진행 중", url: "https://www.notion.so/31a7a0d68bfb80f793f4d7e21c4b9565", assignee: "대왕" },
  { name: "김성엽", status: "시작 전", url: "https://www.notion.so/31d7a0d68bfb80a8ac17d1d458e7c904", assignee: "김성엽" },
];

async function fetchNotionTasks(): Promise<NotionTask[]> {
  const notionToken = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID || "31a7a0d68bfb8044917ce8cbfd7821e2";

  if (!notionToken) {
    console.log("Notion API token not configured, using cached data");
    return FALLBACK_TASKS;
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "상태",
          status: {
            does_not_equal: "완료",
          },
        },
        sorts: [
          { property: "마감일", direction: "ascending" },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Notion API error:", response.status);
      return FALLBACK_TASKS;
    }

    const data = await response.json();

    const tasks: NotionTask[] = data.results
      .filter((page: any) => page.properties?.["이름"]?.title?.[0]?.plain_text)
      .map((page: any) => {
        const props = page.properties;
        const name = props["이름"]?.title?.[0]?.plain_text || "";
        const status = props["상태"]?.status?.name || "시작 전";
        const deadline = props["마감일"]?.date?.start || undefined;
        const assigneeList = props["담당자"]?.people || [];
        const assignee = assigneeList.length > 0 ? assigneeList[0].name : undefined;

        return {
          name,
          status,
          deadline,
          url: `https://www.notion.so/${page.id.replace(/-/g, "")}`,
          assignee,
        };
      });

    return tasks.length > 0 ? tasks : FALLBACK_TASKS;
  } catch (error) {
    console.error("Error fetching Notion tasks:", error);
    return FALLBACK_TASKS;
  }
}

export async function GET() {
  try {
    const tasks = await fetchNotionTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Notion API error:", error);
    return NextResponse.json(FALLBACK_TASKS);
  }
}
