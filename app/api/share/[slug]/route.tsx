import {ImageResponse} from "next/og";
import {readFile} from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {listOffers} from "../../../lib/repository";
import {isActive} from "../../../lib/data";
import {brands} from "../../../lib/brands";
export const runtime="nodejs";
export async function GET(req:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const o=(await listOffers()).find(o=>o.slug===slug&&o.status==="published");
 if(!o)return new Response("Nie znaleziono oferty",{status:404});
 let logo="";const asset=o.logo || (brands[o.companySlug]?"/brands/"+brands[o.companySlug]:"");
 if(/^\/brands\/[a-zA-Z0-9_.-]+$/.test(asset)){
  try{const bytes=await readFile(path.join(process.cwd(),"public",asset));const png=await sharp(bytes).resize({width:460,height:180,fit:"inside"}).png().toBuffer();logo="data:image/png;base64,"+png.toString("base64");}catch{}
 }
 const dark=["chilli-pizza","na-lipowej","magic-gym","beauty-bar"].includes(o.companySlug);
 const res=new ImageResponse(<div style={{display:"flex",width:"100%",height:"100%",background:"#fff9ef",padding:48,color:"#352b20",flexDirection:"column",fontFamily:"sans-serif"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:25,fontWeight:700}}><span>PRICESTOK · BIAŁYSTOK</span><span>{isActive(o)?o.badge:"Oferta nieaktywna"}</span></div><div style={{display:"flex",gap:40,flex:1,alignItems:"center"}}><div style={{display:"flex",width:380,height:260,borderRadius:24,background:dark?"#252a22":"#f0e8dc",alignItems:"center",justifyContent:"center",padding:25,color:dark?"white":"#352b20"}}>{logo?<img src={logo} width={330} height={160} style={{objectFit:"contain"}}/>:<span style={{fontSize:40,textAlign:"center"}}>{o.company}</span>}</div><div style={{display:"flex",flexDirection:"column",width:640,gap:18}}><span style={{fontSize:25,color:"#995000"}}>{o.company}</span><span style={{fontSize:o.title.length>85?38:46,fontWeight:700,lineHeight:1.15}}>{o.title}</span><span style={{fontSize:23,color:"#756958"}}>{o.address}</span>{o.end&&<span style={{fontSize:23}}>Do {o.end}</span>}</div></div><div style={{display:"flex",justifyContent:"space-between",fontSize:23,borderTop:"1px solid #ddcdb5",paddingTop:22}}><span>Warunki i aktualność sprawdź na stronie</span><span>pricestok.pl ↗</span></div></div>,{width:1200,height:630});
 res.headers.set("Cache-Control","public, max-age=300, s-maxage=300");
 if(new URL(req.url).searchParams.get("download")==="1")res.headers.set("Content-Disposition",`attachment; filename="pricestok-${slug}.png"`);
 return res;
}
