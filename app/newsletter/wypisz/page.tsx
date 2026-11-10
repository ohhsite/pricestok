import { Header } from "../../components/Shell";
import NewsletterUnsubscribe from "../../components/NewsletterUnsubscribe";
export const metadata={title:"Rezygnacja z newslettera",robots:{index:false,follow:false},referrer:"no-referrer" as const};
export default function Unsubscribe(){return <><Header/><main className="container inner-main prose"><h1 className="page-title">Rezygnacja z newslettera</h1><NewsletterUnsubscribe/></main></>}
