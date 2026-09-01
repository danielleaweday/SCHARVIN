import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from "livekit-client";
import api from "../lib/api";

/**
 * useLiveKit — connects to a LiveKit room if the backend is configured.
 * Returns:
 *   status: 'idle' | 'checking' | 'connecting' | 'connected' | 'unavailable' | 'error'
 *   participants: [{ identity, name, videoTrack, audioTrack, isSpeaking }]
 *   toggleMic, toggleCam, publishScreen, stopScreen, disconnect
 */
export function useLiveKit(roomName) {
  const [status, setStatus] = useState("idle");
  const [participants, setParticipants] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const roomRef = useRef(null);

  const refresh = () => {
    if (!roomRef.current) return;
    const list = [];
    const local = roomRef.current.localParticipant;
    if (local) {
      list.push({
        identity: local.identity,
        name: local.name || "You",
        isLocal: true,
        isSpeaking: local.isSpeaking,
        videoTrack: local
          .getTrackPublication(Track.Source.Camera)
          ?.videoTrack || null,
      });
    }
    roomRef.current.remoteParticipants.forEach((p) => {
      list.push({
        identity: p.identity,
        name: p.name || p.identity,
        isLocal: false,
        isSpeaking: p.isSpeaking,
        videoTrack: p.getTrackPublication(Track.Source.Camera)?.videoTrack || null,
      });
    });
    setParticipants(list);
  };

  const connect = async () => {
    setStatus("checking");
    try {
      const cfg = await api.get("/livekit/config");
      if (!cfg.data.enabled) {
        setStatus("unavailable");
        return;
      }
      setStatus("connecting");
      const tokenRes = await api.post("/livekit/token", {
        room: roomName,
        can_publish: true,
      });
      const room = new Room({ adaptiveStream: true, dynacast: true });
      room.on(RoomEvent.ParticipantConnected, refresh);
      room.on(RoomEvent.ParticipantDisconnected, refresh);
      room.on(RoomEvent.TrackSubscribed, refresh);
      room.on(RoomEvent.TrackUnsubscribed, refresh);
      room.on(RoomEvent.ActiveSpeakersChanged, refresh);
      await room.connect(tokenRes.data.url, tokenRes.data.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      await room.localParticipant.setCameraEnabled(true);
      roomRef.current = room;
      setStatus("connected");
      refresh();
    } catch (e) {
      console.warn("LiveKit connect failed", e);
      setStatus("error");
    }
  };

  const toggleMic = async () => {
    if (!roomRef.current) {
      setMicOn(!micOn);
      return;
    }
    const next = !micOn;
    await roomRef.current.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  };

  const toggleCam = async () => {
    if (!roomRef.current) {
      setCamOn(!camOn);
      return;
    }
    const next = !camOn;
    await roomRef.current.localParticipant.setCameraEnabled(next);
    setCamOn(next);
    refresh();
  };

  const publishScreen = async () => {
    if (!roomRef.current) {
      setScreenOn(true);
      return;
    }
    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(true);
      setScreenOn(true);
      refresh();
    } catch (e) {
      console.warn("Screen share failed", e);
    }
  };

  const stopScreen = async () => {
    if (!roomRef.current) {
      setScreenOn(false);
      return;
    }
    await roomRef.current.localParticipant.setScreenShareEnabled(false);
    setScreenOn(false);
    refresh();
  };

  const disconnect = () => {
    roomRef.current?.disconnect();
    roomRef.current = null;
  };

  useEffect(() => () => disconnect(), []);

  return {
    status,
    participants,
    micOn,
    camOn,
    screenOn,
    connect,
    toggleMic,
    toggleCam,
    publishScreen,
    stopScreen,
    disconnect,
  };
}
