"use client";
type LayerWindow = Window & {dataLayer?: Record<string, unknown>[]};
export const consentKey = "pricestok-analytics-consent";
export function hasAnalyticsConsent() {
  try { return localStorage.getItem(consentKey) === "accepted"; } catch { return false; }
}
export function trackEvent(event: string, fields: Record<string, string> = {}) {
  if (!hasAnalyticsConsent()) return;
  const url = new URL(location.href);
  let attribution: Record<string,string> = {};
  try {attribution=JSON.parse(sessionStorage.getItem("pricestok-attribution")||"{}");}catch{}
  for (const key of ["utm_source","utm_medium","utm_campaign","utm_content"]) {
    const value=url.searchParams.get(key);
    if(value && /^[a-zA-Z0-9_-]{1,120}$/.test(value)) attribution[key]=value;
  }
  try {sessionStorage.setItem("pricestok-attribution",JSON.stringify(attribution));}catch{}
  const w = window as LayerWindow;
  (w.dataLayer ||= []).push({event,...attribution,...fields});
  const id=fields.offer_id;
  if(id){
    let source="direct";
    const utm=attribution.utm_source?.toLowerCase();
    if(utm)source=["facebook","google","instagram"].includes(utm)?utm:"other";
    else {try{const host=new URL(document.referrer).hostname;if(/(^|\.)facebook\.com$/.test(host))source="facebook";else if(/(^|\.)google\.[a-z.]+$/.test(host))source="google";else if(/(^|\.)instagram\.com$/.test(host))source="instagram";else if(host!==location.hostname)source="other";}catch{}}
    fetch("/api/engagement",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,event,source}),keepalive:true}).catch(()=>{});
  }
}
