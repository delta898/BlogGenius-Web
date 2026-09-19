import { getRuntimeEnvironment } from "../../../server/environment";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    const environment = getRuntimeEnvironment();

    return Response.json(
      {
        status: "ready",
        environment,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return Response.json(
      {
        status: "not_ready",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
