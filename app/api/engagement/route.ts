import {sameOrigin} from "../../lib/config";
import {listOffers} from "../../lib/repository";
import {isActive} from "../../lib/data";
import {newsletterBackendUrl,newsletterPublicKey} from "../../lib/newsletter-backend";
const events=new Set(["offer_view","offer_outbound","company_click","share_facebook","copy_link","copy_post","download_image","company_materials_open","contact_click"]);
export async function POST(req:Request){
 if(!sameOrigin(req))return new Response("Forbidden",{status:403});
 try{
  if(Number(req.headers.get("content-length"))>2000)return new Response("Too large",{status:413});
  const {id,event,source}=await req.json();
  if(typeof id!=="string"||!events.has(event)||!["direct","facebook","google","instagram","other"].includes(source))return new Response("Invalid",{status:400});
  if(!(await listOffers()).some(o=>o.id===id&&isActive(o)))return new Response("Not found",{status:404});
  if(process.env.NODE_ENV!=="production")return Response.json({ok:true});
  const result=await fetch(newsletterBackendUrl.replace("pricestok-newsletter","pricestok-engagement"),{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+newsletterPublicKey,Origin:"https://pricestok.pl"},body:JSON.stringify({id,event,source}),signal:AbortSignal.timeout(4000)});
  return Response.json({ok:result.ok},{status:result.ok?200:503});
 }catch{return Response.json({ok:false},{status:503});}
}
