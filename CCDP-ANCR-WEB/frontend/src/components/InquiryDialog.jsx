import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { api } from "../lib/api";

export const INTENTS = {
  briefing: { title: "Schedule an Executive Briefing", blurb: "Request a private walkthrough of the CCDP model with our team.", area: "Executive Briefing", deck: false },
  deck: { title: "Request the Partnership Deck", blurb: "Share a few details and our team will send the full partnership overview.", area: "Partnership", deck: true },
  partnership: { title: "Explore Institutional Partnerships", blurb: "See how CCDP integrates into your programs and initiatives.", area: "Partnership", deck: false },
  leadership: { title: "Meet with Our Leadership Team", blurb: "Connect directly with CCDP leadership.", area: "Executive Briefing", deck: false },
  invest: { title: "Invest in CCDP", blurb: "Explore strategic investment and mission-aligned opportunities.", area: "Investment", deck: false },
  support: { title: "Support Awe Day Creative Arts", blurb: "Partner with our nonprofit mission — scholarships, access, and technology for creators.", area: "General Inquiry", deck: false },
  partner: { title: "Become a Founding Partner", blurb: "Help shape the future infrastructure of creative education.", area: "Partnership", deck: false },
  general: { title: "Connect with CCDP", blurb: "Tell us how you'd like to engage with CCDP.", area: "General Inquiry", deck: false },
  // Gated resource requests
  res_deck: { title: "Request the Partnership Deck", blurb: "Complete the form and we'll send the CCDP Partnership Deck.", area: "Partnership", deck: true, resource: true },
  res_brief: { title: "Request the Executive Brief", blurb: "Complete the form to receive the CCDP Executive Brief.", area: "Executive Briefing", resource: true },
  res_overview: { title: "Request the Institutional Overview", blurb: "Complete the form to receive the CCDP Institutional Overview.", area: "General Inquiry", resource: true },
  res_degree: { title: "Request the Degree Program Overview", blurb: "Complete the form to receive the CCDP Degree Program Overview.", area: "Degree Program", resource: true },
  res_ancr: { title: "Request the ANCR Platform Overview", blurb: "Complete the form to receive the ANCR Platform Overview.", area: "Technology Platform", resource: true },
  res_press: { title: "Request the Press Kit", blurb: "Complete the form to receive the CCDP Press Kit.", area: "General Inquiry", resource: true },
};

const ORG_TYPES = ["University", "Foundation", "Investor", "Employer", "Government", "Nonprofit", "Other"];
const AREAS = ["Executive Briefing", "Partnership", "Investment", "Degree Program", "Technology Platform", "General Inquiry"];

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  organization: z.string().trim().min(1, "Organization is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  organizationType: z.string().min(1, "Select an organization type"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional().or(z.literal("")),
  website: z.string().trim().optional().or(z.literal("")),
  areaOfInterest: z.string().min(1, "Select an area of interest"),
  message: z.string().trim().min(10, "Please add a short message (10+ characters)"),
  company: z.string().optional().or(z.literal("")), // honeypot
});

const Field = ({ label, error, required, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-ccdp-cream/70">
      {label} {required && <span className="text-ccdp-purple">*</span>}
    </Label>
    {children}
    {error && <p className="text-[11px] text-red-400">{error.message}</p>}
  </div>
);

const inputCls =
  "bg-white/5 border-white/15 text-ccdp-cream placeholder:text-ccdp-cream/35 focus-visible:ring-ccdp-purple";

export const InquiryDialog = ({ open, onOpenChange, intent = "general", prefillEmail = "" }) => {
  const cfg = INTENTS[intent] || INTENTS.general;
  const [done, setDone] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "", lastName: "", organization: "", jobTitle: "",
      organizationType: "", email: prefillEmail, phone: "", website: "",
      areaOfInterest: cfg.area, message: "", company: "",
    },
  });

  useEffect(() => {
    if (open) {
      setDone(false);
      reset({
        firstName: "", lastName: "", organization: "", jobTitle: "",
        organizationType: "", email: prefillEmail, phone: "", website: "",
        areaOfInterest: cfg.area, message: "", company: "",
      });
    }
  }, [open, intent, prefillEmail]); // eslint-disable-line

  const onSubmit = async (values) => {
    try {
      const res = await api.post("/inquiries", { ...values, source: intent, requestedDeck: cfg.deck });
      if (res.data?.status === "success") {
        setDone(true);
        toast.success("Your inquiry has been received.");
      }
    } catch (e) {
      const msg = e?.response?.status === 429
        ? "Too many requests — please try again in a few minutes."
        : "Something went wrong. Please try again or email awe@aweday.org.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="inquiry-dialog"
        className="max-h-[92vh] overflow-y-auto border-white/10 bg-ccdp-charcoal text-ccdp-cream sm:max-w-[640px]"
      >
        {done ? (
          <div data-testid="inquiry-success" className="flex flex-col items-center py-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ccdp-gradient text-white">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h3 className="mt-6 max-w-md font-display text-2xl font-semibold text-ccdp-white">Thank you for your interest in CCDP.</h3>
            {(cfg.deck || cfg.resource) ? (
              <div className="mt-3 max-w-md space-y-3 text-sm leading-relaxed text-ccdp-cream/70">
                <p>Your request has been received. Our team will review your inquiry and respond within 1–2 business days.</p>
                <p>Because our institutional materials are customized for prospective partners, investors, and higher education institutions, the Partnership Deck will be shared directly following our review.</p>
              </div>
            ) : (
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ccdp-cream/70">
                Your request has been received. Our team will review your inquiry and respond within 1–2 business days.
              </p>
            )}
            <Button data-testid="inquiry-close-btn" onClick={() => onOpenChange(false)}
              className="mt-7 rounded-full bg-ccdp-gradient px-8 text-white hover:opacity-90">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-semibold tracking-tight text-ccdp-white">
                {cfg.title}
              </DialogTitle>
              <DialogDescription className="text-ccdp-cream/60">{cfg.blurb}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
              {/* honeypot */}
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
                {...register("company")} className="absolute left-[-9999px] h-0 w-0 opacity-0" />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" required error={errors.firstName}>
                  <Input data-testid="inquiry-first-name" className={inputCls} {...register("firstName")} />
                </Field>
                <Field label="Last name" required error={errors.lastName}>
                  <Input data-testid="inquiry-last-name" className={inputCls} {...register("lastName")} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Organization" required error={errors.organization}>
                  <Input data-testid="inquiry-organization" className={inputCls} {...register("organization")} />
                </Field>
                <Field label="Job title" required error={errors.jobTitle}>
                  <Input data-testid="inquiry-job-title" className={inputCls} {...register("jobTitle")} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Organization type" required error={errors.organizationType}>
                  <Controller control={control} name="organizationType" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="inquiry-org-type" className={inputCls}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-ccdp-charcoal text-ccdp-cream">
                        {ORG_TYPES.map((t) => (
                          <SelectItem key={t} value={t} data-testid={`org-type-${t.toLowerCase()}`}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </Field>
                <Field label="Area of interest" required error={errors.areaOfInterest}>
                  <Controller control={control} name="areaOfInterest" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="inquiry-area" className={inputCls}>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-ccdp-charcoal text-ccdp-cream">
                        {AREAS.map((a) => (
                          <SelectItem key={a} value={a} data-testid={`area-${a.split(" ")[0].toLowerCase()}`}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" required error={errors.email}>
                  <Input data-testid="inquiry-email" type="email" className={inputCls} {...register("email")} />
                </Field>
                <Field label="Phone (optional)" error={errors.phone}>
                  <Input data-testid="inquiry-phone" className={inputCls} {...register("phone")} />
                </Field>
              </div>

              <Field label="Organization website (optional)" error={errors.website}>
                <Input data-testid="inquiry-website" placeholder="https://" className={inputCls} {...register("website")} />
              </Field>

              <Field label="Message" required error={errors.message}>
                <Textarea data-testid="inquiry-message" rows={4} className={inputCls}
                  placeholder="Tell us about your organization and how you'd like to engage with CCDP…"
                  {...register("message")} />
              </Field>

              <div className="flex items-center gap-2 text-[11px] text-ccdp-cream/45">
                <ShieldCheck className="h-3.5 w-3.5" /> Your information is used only to respond to your inquiry.
              </div>

              <Button data-testid="inquiry-submit" type="submit" disabled={isSubmitting}
                className="w-full rounded-full bg-ccdp-gradient py-6 text-sm font-semibold text-white hover:opacity-90">
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>) : cfg.title}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
