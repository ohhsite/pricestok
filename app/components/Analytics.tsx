"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {consentKey,hasAnalyticsConsent,trackEvent} from "../lib/analytics";
const excluded = (path:string) => /^\/(admin|panel|api|newsletter|platnosc|sukces|anulowano)(\/|$)/.test(path);
function enable() {
  const w=window as Window & {dataLayer?: unknown[]};
  w.dataLayer ||= [];
  // Default denies advertising storage even when anonymous analytics is accepted.
  const consent=function(..._args:unknown[]){w.dataLayer!.push(arguments);};
  consent("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
  consent("consent","update",{analytics_storage:"granted"});
  if(document.getElementById("pricestok-gtm")) return;
  w.dataLayer.push({"gtm.start":Date.now(),event:"gtm.js"});
  const script=document.createElement("script");script.id="pricestok-gtm";script.async=true;
  script.src="https://www.googletagmanager.com/gtm.js?id=GTM-MV8D8L9N";
  document.head.appendChild(script);
}
export default function Analytics(){
 const path=usePathname();const [choice,setChoice]=useState(false);
 useEffect(()=>{
   if(excluded(path)) return;
   try {setChoice(!localStorage.getItem(consentKey));} catch {setChoice(true);}
   if(hasAnalyticsConsent()) {enable();trackEvent("page_view",{page_path:path,page_location:location.origin+path,page_title:document.title});}
   const click=(e:MouseEvent)=>{
     const a=(e.target as Element)?.closest?.("a");if(!a)return;
     const href=a.getAttribute("href")||"";
     const context={offer_id:document.querySelector("[data-analytics-offer]")?.getAttribute("data-analytics-offer")||""};
     if(href.startsWith("/api/out?")) trackEvent("offer_outbound",{offer_id:new URL(href,location.origin).searchParams.get("id")||""});
     else if(href.startsWith("mailto:")||href.startsWith("tel:")) trackEvent("contact_click",{...context,contact_type:href.startsWith("mailto:")?"email":"phone"});
     else if(href.startsWith("/firma/")) trackEvent("company_click",{...context,company_slug:href.split("/")[2]||""});
   };
   document.addEventListener("click",click);return()=>document.removeEventListener("click",click);
 },[path]);
 function choose(accepted:boolean){
   try{localStorage.setItem(consentKey,accepted?"accepted":"rejected");}catch{}
   setChoice(false);
   if(accepted){enable();window.dispatchEvent(new Event("pricestok-analytics-accepted"));trackEvent("page_view",{page_path:path,page_location:location.origin+path,page_title:document.title});}
   else if(document.getElementById("pricestok-gtm"))location.reload();
 }
 if(excluded(path))return null;
 return <><button className="analytics-settings" onClick={()=>setChoice(true)}>Ustawienia prywatności</button>{choice&&<aside className="analytics-consent" aria-label="Ustawienia prywatności"><strong>Pomóż nam ulepszać PriceStok</strong><p>Za Twoją zgodą korzystamy z Google Tag Managera i analityki, aby mierzyć odwiedziny oraz zainteresowanie ofertami. <a href="/polityka-prywatnosci">Więcej o prywatności</a></p><div><button className="button secondary" onClick={()=>choose(false)}>Odrzuć</button><button className="button" onClick={()=>choose(true)}>Zgadzam się</button></div></aside>}</>;
}
