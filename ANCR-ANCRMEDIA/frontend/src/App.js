import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { PlayerProvider } from "@/context/PlayerContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import AlbumDetail from "@/pages/AlbumDetail";
import CreatorDetail from "@/pages/CreatorDetail";
import VideoWatch from "@/pages/VideoWatch";
import { Schools, SchoolDetail } from "@/pages/Schools";
import Countries from "@/pages/Countries";
import Creators from "@/pages/Creators";
import Albums from "@/pages/Albums";
import Search from "@/pages/Search";
import Library from "@/pages/Library";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import { PlaylistDetail, GenreDetail } from "@/pages/Detail";
import {
  Discover, Trending, NewReleases, Videos, Live, Playlists, Genres, Challenges, Events, Podcasts,
} from "@/pages/Feeds";
import { WavHome, ViewHome, Featured, Originals, Downloads, WatchLater, Liked, HistoryPage } from "@/pages/Experiences";

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Toaster theme="dark" position="bottom-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="/wav" element={<WavHome />} />
              <Route path="/view" element={<ViewHome />} />
              <Route path="/featured" element={<Featured />} />
              <Route path="/originals" element={<Originals />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/watch-later" element={<WatchLater />} />
              <Route path="/liked" element={<Liked />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/new-releases" element={<NewReleases />} />
              <Route path="/following" element={<Library />} />
              <Route path="/live" element={<Live />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlists/:id" element={<PlaylistDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/schools" element={<Schools />} />
              <Route path="/schools/:slug" element={<SchoolDetail />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/genres" element={<Genres />} />
              <Route path="/genres/:name" element={<GenreDetail />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/search" element={<Search />} />
              <Route path="/creators" element={<Creators />} />
              <Route path="/creators/:id" element={<CreatorDetail />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/albums/:id" element={<AlbumDetail />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/videos/:id" element={<VideoWatch />} />
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/channels" element={<Videos />} />
              <Route path="/collections" element={<Playlists />} />
              <Route path="/library" element={<Library />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}
