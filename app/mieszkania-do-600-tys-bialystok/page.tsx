import HousingPage, { housingMetadata } from "../components/HousingPage";
export const metadata = housingMetadata("600");
export default function Page() { return <HousingPage budget="600" />; }
