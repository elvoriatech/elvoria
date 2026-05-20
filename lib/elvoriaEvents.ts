/** Client-side site actions via custom events (modals, chat, etc.). */

export type ProposalChatSource =
  | 'proposal_widget'
  | 'contact_technical_proposal'
  | 'hero_start_project'
  | 'hero_build_together'
  | 'contact_start_project';

export function openProposalChat(source: ProposalChatSource = 'proposal_widget') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('elvoria:open-proposal-chat', {
      detail: { source },
    })
  );
}

export type ContactInquiryPreset = {
  projectType?: string;
  budget?: string;
  /** Prefills message when the field is empty */
  messageSeed?: string;
};

export function openContactInquiry(preset?: ContactInquiryPreset) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('elvoria:open-contact-inquiry', {
      detail: preset ?? {},
    })
  );
  const section = document.getElementById('contact');
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const form = document.getElementById('project-inquiry-form');
  window.setTimeout(() => {
    const firstField = form?.querySelector<HTMLInputElement>('input[name="name"]');
    firstField?.focus();
  }, 450);
}

export function openScheduleConsultation() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('elvoria:open-schedule'));
}

export type UnderConstructionDetail = {
  title?: string;
  description?: string;
};

export function openUnderConstruction(detail?: UnderConstructionDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('elvoria:under-construction', {
      detail: detail ?? {},
    })
  );
}
