import dynamic from "next/dynamic";
const ToeicHomePage = dynamic(() => import("./homepage"), { ssr: false });

export default function Page() {
  return (
    <ToeicHomePage />
  );
}

// Assuming the ToeicHomePage component is defined in another file
// Here we would typically import it and apply the changes as needed.
// The following is a placeholder for the actual ToeicHomePage component.
// Please ensure to update the ToeicHomePage component in its respective file.

// Example of the ToeicHomePage component
export default function ToeicHomePage() {
  <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">
    <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
      <span className="text-green-900">Luyện thi</span>{' '}
      <span style={{ color: '#ea580c', fontWeight: 700 }}>TOEIC</span>
    </h1>
  </div>
}
}
