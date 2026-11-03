import { randomUUID } from "node:crypto";
import { adminAllowed } from "../../../lib/admin";
import { sameOrigin } from "../../../lib/config";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req: Request) {
  if (!sameOrigin(req) || !(await adminAllowed()))
    return Response.json({ error: "Brak dostępu." }, { status: 403 });
  const length = Number(req.headers.get("content-length"));
  if (!length || length > 3200000)
    return Response.json(
      { error: "Zdjęcie może mieć najwyżej 3 MB." },
      { status: 413 },
    );
  const form = await req.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof File) || !file.size || file.size > 3145728)
    return Response.json({ error: "Wybierz plik do 3 MB." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const formats = {
    "image/jpeg": {
      ext: "jpg",
      valid: bytes.subarray(0, 3).toString("hex") === "ffd8ff",
    },
    "image/png": {
      ext: "png",
      valid: bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a",
    },
    "image/webp": {
      ext: "webp",
      valid:
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP",
    },
  };
  const format = formats[file.type as keyof typeof formats];
  if (!format?.valid)
    return Response.json(
      { error: "Wybierz zdjęcie JPG, PNG lub WebP." },
      { status: 400 },
    );
  const image = randomUUID() + "." + format.ext;
  const { error } = await getSupabase()
    .storage.from("bnp-offer-images")
    .upload(image, bytes, { contentType: file.type, cacheControl: "31536000" });
  if (error) {
    console.error("Upload zdjęcia", error.name);
    return Response.json(
      {
        error:
          "Zapis zdjęcia w Supabase nie powiódł się. Sprawdź konfigurację Storage.",
      },
      { status: 500 },
    );
  }
  return Response.json({ image });
}
