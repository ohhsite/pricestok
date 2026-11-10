"use client";
import {useEffect} from "react";
import {trackEvent} from "../lib/analytics";
export default function TrackView({id}:{id:string}){
 useEffect(()=>{let sent=false;const send=()=>{if(sent)return;trackEvent("offer_view",{offer_id:id});sent=true;};
 // Consent granted after mounting should count this visit once.
 const accept=()=>{sent=false;send();};send();window.addEventListener("pricestok-analytics-accepted",accept);return()=>window.removeEventListener("pricestok-analytics-accepted",accept);
 },[id]);return <span hidden data-analytics-offer={id}/>;
}
