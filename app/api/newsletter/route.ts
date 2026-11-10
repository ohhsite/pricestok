import { newsletterBackendUrl, newsletterPublicKey } from "../../lib/newsletter-backend";
import { randomBytes } from "node:crypto";
import { sameOrigin, databaseConfigured, siteUrl } from "../../lib/config";
import { getSupabase } from "../../lib/supabase";
import { adminAllowed } from "../../lib/admin";
import { newsletterConsent, newsletterConsentVersion, validNewsletterEmail } from "../../lib/newsletter";
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status:403 });
  const raw = await req.text();
  if (raw.length > 1500) return Response.json({error:"Za dużo danych."},{status:413,headers});
  let d;
  try { d = JSON.parse(raw); } catch { return Response.json({error:"Nieprawidłowe dane."},{status:400,headers}); }
  if (!d || typeof d !== "object") return Response.json({error:"Nieprawidłowe dane."},{status:400,headers});
  if (!databaseConfigured()) {
    try {
      const result = await fetch(newsletterBackendUrl, {method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+newsletterPublicKey,Origin:siteUrl()},body:raw,signal:AbortSignal.timeout(20000),cache:"no-store"});
      return new Response(await result.text(),{status:result.status,headers:{...headers,"Content-Type":"application/json"}});
    } catch { return Response.json({error:"Zapis jest chwilowo niedostępny. Spróbuj później."},{status:503,headers}); }
  }
  try {
    const db = getSupabase();
    if (d.action === "unsubscribe") {
      if (typeof d.token !== "string" || !/^[a-f0-9]{64}$/.test(d.token)) return Response.json({error:"Link jest nieprawidłowy."},{status:400,headers});
      const result = await db.from("bnp_newsletter").update({status:"unsubscribed",unsubscribed_at:new Date().toISOString()}).eq("unsubscribe_token",d.token).eq("status","active");
      if (result.error) throw result.error;
      return Response.json({ok:true},{headers});
    }
    if (d.website) return Response.json({ok:true},{headers});
    const email = typeof d.email === "string" ? d.email.trim().toLowerCase() : "";
    if (!validNewsletterEmail(email) || d.consent !== true) return Response.json({error:"Podaj poprawny e-mail i zaznacz zgodę na newsletter."},{status:400,headers});
    const token = randomBytes(32).toString("hex");
    const payload = {email,status:"active",unsubscribe_token:token,consent_version:newsletterConsentVersion,consent_text:newsletterConsent,consented_at:new Date().toISOString(),unsubscribed_at:null,source:"website"};
    const added = await db.from("bnp_newsletter").upsert(payload,{onConflict:"email",ignoreDuplicates:true}).select("email");
    if (added.error) throw added.error;
    let changed = !!added.data?.length;
    if (!changed) {
      const rejoined = await db.from("bnp_newsletter").update(payload).eq("email",email).eq("status","unsubscribed").select("email");
      if (rejoined.error) throw rejoined.error;
      changed = !!rejoined.data?.length;
    }
    return Response.json({ok:true},{headers});
  } catch { return Response.json({error:"Nie udało się zapisać zmiany. Spróbuj ponownie za chwilę."},{status:500,headers}); }
}
export async function GET(req: Request) {
  if (!(await adminAllowed())) return new Response("Brak dostępu",{status:403,headers});
  const csv = new URL(req.url).searchParams.get("format") === "csv";
  const db=getSupabase();
  if (!csv) {
    const result=await db.from("bnp_newsletter").select("email",{count:"exact",head:true}).eq("status","active");
    if (result.error) return Response.json({error:"Nie udało się pobrać zapisów."},{status:500,headers});
    return Response.json({active:result.count || 0},{headers});
  }
  const result=await db.from("bnp_newsletter").select("email,consented_at,consent_version,unsubscribe_token",{count:"exact"}).eq("status","active").order("consented_at",{ascending:false}).limit(1000);
  if (result.error || (result.count || 0)>1000) return Response.json({error:"Nie udało się pobrać pełnej listy."},{status:500,headers});
  const cell=(v:string)=>'"'+(/^[=+\-@\t\r]/.test(v)?"'":"")+v.replace(/"/g,'""')+'"';
  const rows=[['email','data_zgody','wersja_zgody','link_rezygnacji'],...(result.data || []).map(r=>[r.email,r.consented_at,r.consent_version,siteUrl()+"/newsletter/wypisz#token="+r.unsubscribe_token])];
  return new Response('\ufeff'+rows.map(row=>row.map(cell).join(';')).join('\r\n'),{headers:{...headers,"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="pricestok-newsletter.csv"'}});
}
