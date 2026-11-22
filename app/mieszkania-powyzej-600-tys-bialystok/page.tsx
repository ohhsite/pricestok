import HousingPage, { housingMetadata } from "../components/HousingPage";
export const metadata = housingMetadata("600-plus");
export default function Page() { return <HousingPage budget="600-plus" />; }
