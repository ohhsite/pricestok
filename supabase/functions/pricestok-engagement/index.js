import {createClient} from "@supabase/supabase-js";
const ids=new Set(["chilli-druga-pizza", "chilli-pizza-lunch", "na-lipowej-wtorki", "beauty-bar-pierwsza-wizyta", "house-of-beauty-pakiety", "magic-gym-pierwsze-wejscie", "fito-pierwsze-wejscie", "booksy-nail-concept", "booksy-boska-studio-urody", "booksy-salon-pieknosci-ds", "rowerowa-sniadanie-pol-ceny", "fabryczna-pierwsze-zamowienie", "krokospoko-rodzenstwo", "po-prostu-pizza-lunch", "toni-peperoni-trzecia-pizza", "hacienda-pizze-trzy-za-dwie", "btl-bilet-urodzinowy", "smocza-arena-urodziny", "optyk-tomek-oprawki", "crazy-needles-newsletter", "renzacci-pranie-z-karta", "finnserwis-rabat-pranie", "rukola-pizza-gratis", "aleja-piekna-depilacja-pol-ceny", "aleja-piekna-noble-shape", "kunegunda-pierwsza-depilacja", "rowerowa-dwie-buly-bbq", "rowerowa-dwa-nalesniki-nutella", "fabryczna-kawa-do-sniadania", "u-mlanka-kupon-40", "u-mlanka-dostawa-napoj"]);
const events=new Set(['offer_view','offer_outbound','company_click','share_facebook','copy_link','copy_post','download_image','company_materials_open','contact_click']);
Deno.serve(async req=>{
 if(req.method!=="POST"||req.headers.get("origin")!=="https://pricestok.pl")return new Response("Forbidden",{status:403});
 try{
  const {id,event,source}=await req.json();
  if(typeof id!=="string"||id.length>120||!events.has(event)||!['direct','facebook','google','instagram','other'].includes(source))return new Response("Invalid",{status:400});
  const db=createClient(Deno.env.get("SUPABASE_URL"),Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  if(!ids.has(id)){const {data}=await db.from("bnp_offers").select("id").eq("id",id).eq("data->>status","published").maybeSingle();if(!data)return new Response("Unknown offer",{status:404});}
  const {error}=await db.rpc("bnp_record_offer_event",{p_offer:id,p_event:event,p_source:source});
  return Response.json({ok:!error},{status:error?500:200});
 }catch{return Response.json({ok:false},{status:400});}
});
