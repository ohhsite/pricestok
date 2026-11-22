import HousingPage, { housingMetadata } from "../components/HousingPage";
export const metadata = housingMetadata("400");
export default function Page() { return <HousingPage budget="400" />; }
