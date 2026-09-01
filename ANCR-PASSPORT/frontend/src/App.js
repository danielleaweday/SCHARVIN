import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { Loader } from "@/components/common";

import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import DestinationDetail from "@/pages/DestinationDetail";
import CultureSchool from "@/pages/CultureSchool";
import CourseDetail from "@/pages/CourseDetail";
import Translator from "@/pages/Translator";
import TravelReady from "@/pages/TravelReady";
import MyTrips from "@/pages/MyTrips";
import TripDetail from "@/pages/TripDetail";
import TripMode from "@/pages/TripMode";
import Safety from "@/pages/Safety";
import GlobalClassroom from "@/pages/GlobalClassroom";
import MyPassport from "@/pages/MyPassport";
import Journal from "@/pages/Journal";
import Network from "@/pages/Network";
import MusicCompass from "@/pages/MusicCompass";
import Settings from "@/pages/Settings";
import Documents from "@/pages/Documents";
import Readiness from "@/pages/Readiness";

const Shell = () => {
  const { loading } = useApp();
  if (loading) return <div className="min-h-screen"><Loader label="Preparing your Passport" /></div>;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:id" element={<DestinationDetail />} />
        <Route path="/culture-school" element={<CultureSchool />} />
        <Route path="/culture-school/:id" element={<CourseDetail />} />
        <Route path="/translator" element={<Translator />} />
        <Route path="/travel-ready" element={<TravelReady />} />
        <Route path="/trips" element={<MyTrips />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/trip-mode" element={<TripMode />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/global-classroom" element={<GlobalClassroom />} />
        <Route path="/network" element={<Network />} />
        <Route path="/music-compass" element={<MusicCompass />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/passport" element={<MyPassport />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/readiness" element={<Readiness />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
        <Toaster position="top-right" theme="dark" richColors />
      </AppProvider>
    </div>
  );
}

export default App;
