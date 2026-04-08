import dynamic from "next/dynamic";
const ToeicHomePage = dynamic(() => import("./homepage"), { ssr: false });

export default function Page() {
  return <ToeicHomePage />;
}
