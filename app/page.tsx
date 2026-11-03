import { listOffers } from "./lib/repository";
import Catalog from "./components/Catalog";
export const dynamic = "force-dynamic";
export default async function Home() {
  return <Catalog offers={await listOffers()} />;
}
