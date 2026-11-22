import HousingPage, { housingMetadata } from "../components/HousingPage";
export const metadata = housingMetadata("all");
export default function Page() { return <HousingPage budget="all" />; }
