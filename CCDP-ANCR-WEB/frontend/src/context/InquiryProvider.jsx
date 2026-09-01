import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { InquiryDialog } from "../components/InquiryDialog";
import { api } from "../lib/api";

const InquiryContext = createContext(null);

export const useInquiry = () => {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used within InquiryProvider");
  return ctx;
};

export const InquiryProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, intent: "general", prefillEmail: "" });
  const [schedulingUrl, setSchedulingUrl] = useState("");

  useEffect(() => {
    api.get("/config").then((r) => setSchedulingUrl(r.data?.schedulingUrl || "")).catch(() => {});
  }, []);

  const openInquiry = useCallback((intent = "general", opts = {}) => {
    setState({ open: true, intent, prefillEmail: opts.email || "" });
  }, []);

  const openBriefing = useCallback(() => {
    if (schedulingUrl) {
      window.open(schedulingUrl, "_blank", "noopener,noreferrer");
    } else {
      setState({ open: true, intent: "briefing", prefillEmail: "" });
    }
  }, [schedulingUrl]);

  const onOpenChange = useCallback((open) => setState((s) => ({ ...s, open })), []);

  return (
    <InquiryContext.Provider value={{ openInquiry, openBriefing, schedulingUrl }}>
      {children}
      <InquiryDialog
        open={state.open}
        onOpenChange={onOpenChange}
        intent={state.intent}
        prefillEmail={state.prefillEmail}
      />
    </InquiryContext.Provider>
  );
};
