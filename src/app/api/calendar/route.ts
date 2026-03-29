import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  type?: string;
}

// Sample data for demo mode
const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    summary: "팀 스탠드업",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 1800000).toISOString(),
    type: "meeting",
  },
  {
    id: "2",
    summary: "Brisbane 출장 ✈️",
    start: new Date(Date.now() + 86400000).toISOString(),
    end: new Date(Date.now() + 172800000).toISOString(),
    location: "Brisbane, Australia",
    type: "flight",
  },
  {
    id: "3",
    summary: "EIJ Construction 클라이언트 미팅",
    start: new Date(Date.now() + 259200000).toISOString(),
    end: new Date(Date.now() + 262800000).toISOString(),
    type: "meeting",
  },
  {
    id: "4",
    summary: "Pentahexagon 프로젝트 리뷰",
    start: new Date(Date.now() + 345600000).toISOString(),
    end: new Date(Date.now() + 349200000).toISOString(),
    type: "meeting",
  },
  {
    id: "5",
    summary: "서울 출장 ✈️",
    start: new Date(Date.now() + 432000000).toISOString(),
    end: new Date(Date.now() + 518400000).toISOString(),
    location: "Seoul, Korea",
    type: "flight",
  },
];

function inferEventType(summary: string): string {
  const summary_lower = summary.toLowerCase();

  if (summary_lower.includes("flight") || summary_lower.includes("✈️") || summary_lower.includes("출장") || summary_lower.includes("비행")) {
    return "flight";
  }

  if (
    summary_lower.includes("eij") ||
    summary_lower.includes("construction")
  ) {
    return "eij";
  }

  if (
    summary_lower.includes("penta") ||
    summary_lower.includes("pentahexagon")
  ) {
    return "penta";
  }

  if (summary_lower.includes("beyond") || summary_lower.includes("beyondfleet")) {
    return "bf";
  }

  if (summary_lower.includes("한국") || summary_lower.includes("korea")) {
    return "kr";
  }

  return "meeting";
}

async function fetchGoogleCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

    if (!clientId || !clientSecret || !refreshToken) {
      console.log("Google credentials not configured, using sample data");
      return SAMPLE_EVENTS;
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "http://localhost:3000/api/callback"
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Fetch events for current week +/- 2 weeks
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId,
      timeMin: twoWeeksAgo.toISOString(),
      timeMax: twoWeeksLater.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    const events: CalendarEvent[] = (response.data.items || []).map((event: any) => ({
      id: event.id,
      summary: event.summary || "No title",
      start: event.start?.dateTime || event.start?.date || new Date().toISOString(),
      end: event.end?.dateTime || event.end?.date || new Date().toISOString(),
      location: event.location,
      type: inferEventType(event.summary || ""),
    }));

    return events;
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    return SAMPLE_EVENTS;
  }
}

export async function GET(request: NextRequest) {
  try {
    const events = await fetchGoogleCalendarEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Calendar API error:", error);
    // Return sample data on error
    return NextResponse.json(SAMPLE_EVENTS);
  }
}
