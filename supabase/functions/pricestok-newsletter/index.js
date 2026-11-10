import { createClient } from "@supabase/supabase-js";
const headers={"Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async req=>{
  if(req.method!=="POST")return reply({error:"Method not allowed"},405);
  if(req.headers.get("origin")!=="https://pricestok.pl")return reply({error:"Forbidden"},403);
  const raw=await req.text();if(raw.length>1500)return reply({error:"Za dużo danych."},413);
  let d;try{d=JSON.parse(raw);}catch{return reply({error:"Nieprawidłowe dane."},400);}
  if(!d||typeof d!=="object")return reply({error:"Nieprawidłowe dane."},400);
  try{
    const db=createClient(Deno.env.get("SUPABASE_URL"),Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),{auth:{persistSession:false,autoRefreshToken:false}});
    if(d.action==="unsubscribe"){
      if(typeof d.token!=="string"||!/^[a-f0-9]{64}$/.test(d.token))return reply({error:"Link jest nieprawidłowy."},400);
      const r=await db.from("bnp_newsletter").update({status:"unsubscribed",unsubscribed_at:new Date().toISOString()}).eq("unsubscribe_token",d.token).eq("status","active");
      if(r.error)throw r.error;return reply({ok:true});
    }
    if(d.website)return reply({ok:true});
    const email=typeof d.email==="string"?d.email.trim().toLowerCase():"";
    if(email.length>254||!(/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/).test(email)||d.consent!==true)return reply({error:"Podaj poprawny e-mail i zaznacz zgodę na newsletter."},400);
    const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,"0")).join("");
    const payload={email,status:"active",unsubscribe_token:token,consent_version:"2026-11-10",consent_text:"Zgadzam się na otrzymywanie od PriceStok wiadomości e-mail o imprezach, wydarzeniach i lokalnych ofertach w Białymstoku. Zgodę mogę wycofać w każdej chwili.",consented_at:new Date().toISOString(),unsubscribed_at:null,source:"website"};
    const added=await db.from("bnp_newsletter").upsert(payload,{onConflict:"email",ignoreDuplicates:true}).select("email");
    if(added.error)throw added.error;
    if(!added.data?.length){const r=await db.from("bnp_newsletter").update(payload).eq("email",email).eq("status","unsubscribed");if(r.error)throw r.error;}
    return reply({ok:true});
  }catch{return reply({error:"Nie udało się zapisać zmiany. Spróbuj ponownie za chwilę."},500);}
});
