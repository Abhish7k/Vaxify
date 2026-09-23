import type { AiAskResult, AiCitation } from "@/types/ai";

/**
 * Pre-written Copilot examples for deployments that do not run the RAG service.
 * Questions must stay identical to ASSISTANT_SUGGESTIONS.
 * Facts and URLs come from the existing corpus metadata (sources.yaml / knowledge-base spec).
 * These are not live model output.
 */

const NIS: AiCitation = {
  citationIndex: 1,
  source: "National_Immunization_Schedule",
  sourceId: "S5",
  title: "National Immunization Schedule",
  publisher: "MoHFW",
  documentDate: "2020-05-29",
  sourceUrl:
    "https://prod-cdn.preprod.co-vin.in/uwin-prod/pdf/National+Immunization+Schedule+(NIS)+for+SRM.pdf",
  pageStart: 1,
  pageEnd: 2,
  section: "National Immunization Schedule",
};

const TD_GUIDELINES: AiCitation = {
  citationIndex: 2,
  source: "Td_Operational_Guidelines",
  sourceId: "S7",
  title: "Td Vaccine Operational Guidelines",
  publisher: "MoHFW",
  documentDate: "2018-01-01",
  sourceUrl:
    "https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/Guildelines_for_immunization/Td_vaccine_operational_guidelines.pdf",
  pageStart: 1,
  pageEnd: 1,
  section: "Td for pregnant women",
};

export interface DemoConversation extends AiAskResult {
  question: string;
}

export const DEMO_UNSUPPORTED_ANSWER =
  "Demo Mode is active, so only the example questions are available in this deployment. This is not a live AI answer.";

export const DEMO_CONVERSATIONS: readonly DemoConversation[] = [
  {
    question: "What vaccines are given at birth?",
    status: "answered",
    answer:
      "At birth, India’s National Immunization Schedule includes BCG, oral polio vaccine (OPV), and a birth dose of hepatitis B. [1]\n\nOPV is given by mouth. The hepatitis B birth dose is given intramuscularly in the thigh. BCG is given intradermally in the left upper arm. [1]",
    citations: [NIS],
  },
  {
    question: "When is Td given during pregnancy?",
    status: "answered",
    answer:
      "For pregnant women, the national schedule uses Td. Td-1 is given early in pregnancy, and Td-2 is given four weeks after Td-1. If two doses were given within the last three years, one Td booster is given instead. [1][2]",
    citations: [
      {
        ...NIS,
        pageStart: 2,
        pageEnd: 2,
        section: "Pregnant women — Td",
      },
      TD_GUIDELINES,
    ],
  },
  {
    question: "What is PCV?",
    status: "answered",
    answer:
      "PCV is the pneumococcal conjugate vaccine. The operational guidelines give it as 0.5 ml intramuscularly in the right mid-thigh at 6 weeks, 14 weeks, and 9 months, to help prevent pneumococcal disease such as pneumonia. [1]",
    citations: [
      {
        citationIndex: 1,
        source: "PCV_Operational_Guidelines",
        sourceId: "S6",
        title: "PCV Operational Guidelines",
        publisher: "MoHFW",
        documentDate: "2021-01-01",
        sourceUrl:
          "https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/Guildelines_for_immunization/Operational_Guidelines_for_PCV_introduction.pdf",
        pageStart: 38,
        pageEnd: 38,
        section: "3.5 Schedule",
      },
    ],
  },
  {
    question: "Are vaccines safe?",
    status: "answered",
    answer:
      "WHO describes vaccines as very safe. Like any medicine, they can cause side effects, but these are usually minor and short-lived, such as a sore arm or a mild fever. More serious side effects are possible, but extremely rare. An unexpected reaction after vaccination should be discussed with a health worker. [1]\n\nBefore introduction, a vaccine is tested in clinical trials, and safety continues to be monitored after it is in use. [1]",
    citations: [
      {
        citationIndex: 1,
        source: "WHO_Vaccine_Safety_QA",
        sourceId: "S8",
        title: "WHO Vaccine Safety Q&A",
        publisher: "WHO",
        sourceUrl:
          "https://www.who.int/news-room/questions-and-answers/item/vaccines-and-immunization-vaccine-safety",
        section: "Are there side effects from vaccines?",
      },
    ],
  },
];

function normalizeQuestion(question: string) {
  return question.trim().replace(/\s+/g, " ").toLowerCase();
}

export function findDemoConversation(question: string) {
  const normalized = normalizeQuestion(question);
  return DEMO_CONVERSATIONS.find(
    (conversation) => normalizeQuestion(conversation.question) === normalized,
  );
}
