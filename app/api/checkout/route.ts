export async function POST() {
  return Response.json(
    {
      error: "Poprzednie pakiety zastąpiono abonamentem. Przejdź na /dla-firm.",
    },
    { status: 410 },
  );
}
