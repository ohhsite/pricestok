import HousingPage, { housingMetadata } from "../components/HousingPage";
export const metadata = housingMetadata("500");
export default function Page() { return <HousingPage budget="500" />; }
