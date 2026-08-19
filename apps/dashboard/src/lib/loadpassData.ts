export interface ChainStep {
  id: string;
  role: "Shipper" | "Broker A" | "Broker B" | "Carrier";
  name: string;
  sublabel: string;
  status?: string;
  connector?: {
    type: string;
    details: Array<{ label: string; value: string }>;
  };
}

export interface VerificationCheck {
  id: string;
  text: string;
  passed: boolean;
}

export interface LoadDetails {
  id: string;
  offeredBy: string;
  route: {
    origin: string;
    destination: string;
  };
  pickup: string;
  status: "VERIFIED" | "NOT_VERIFIED";
  headline: string;
  supportingText: string;
  validUntil?: string;
  lastValid?: string;
  statePill?: string;
  reason?: string;
  chain: ChainStep[];
  missingChain?: Array<{
    role: string;
    name: string;
    sublabel?: string;
    isMissing?: boolean;
    missingText?: string;
  }>;
  checks: VerificationCheck[];
}

export const DEMO_LOADS: Record<string, LoadDetails> = {
  "LP-4821": {
    id: "LP-4821",
    offeredBy: "QuickHaul Logistics",
    route: {
      origin: "Chicago, IL",
      destination: "Dallas, TX",
    },
    pickup: "19 Aug · 14:00",
    status: "VERIFIED",
    headline: "✓ AUTHORITY VERIFIED",
    supportingText: "QuickHaul Logistics has a live authority chain back to the shipper.",
    validUntil: "17:30 UTC",
    statePill: "LIVE",
    chain: [
      {
        id: "step-1",
        role: "Shipper",
        name: "ABC Foods",
        sublabel: "Original issuer",
        connector: {
          type: "LOAD MANDATE",
          details: [
            { label: "Mandate", value: "LP-M842" },
            { label: "Tender authority", value: "Granted" },
            { label: "Delegation", value: "Allowed" },
            { label: "Valid until", value: "18:00 UTC" },
          ],
        },
      },
      {
        id: "step-2",
        role: "Broker A",
        name: "Northstar Freight",
        sublabel: "Authorised broker",
        connector: {
          type: "DELEGATION",
          details: [
            { label: "Parent mandate", value: "LP-M842" },
            { label: "Scope", value: "Tender load" },
            { label: "Valid until", value: "17:30 UTC" },
          ],
        },
      },
      {
        id: "step-3",
        role: "Broker B",
        name: "QuickHaul Logistics",
        sublabel: "Current broker",
        status: "Authorised to tender",
      },
      {
        id: "step-4",
        role: "Carrier",
        name: "Your Fleet",
        sublabel: "You are here",
      },
    ],
    checks: [
      { id: "c1", text: "Original shipper mandate exists", passed: true },
      { id: "c2", text: "Original mandate is still live", passed: true },
      { id: "c3", text: "Broker A is named in the mandate", passed: true },
      { id: "c4", text: "Delegation is permitted", passed: true },
      { id: "c5", text: "Broker B has a live delegation", passed: true },
      { id: "c6", text: "Delegation does not exceed parent authority", passed: true },
    ],
  },
  "LP-7734": {
    id: "LP-7734",
    offeredBy: "FastLine Brokerage",
    route: {
      origin: "Atlanta, GA",
      destination: "Houston, TX",
    },
    pickup: "19 Aug · 18:00",
    status: "NOT_VERIFIED",
    headline: "⚠ AUTHORITY NOT VERIFIED",
    supportingText: "FastLine Brokerage does not currently have a complete authority chain for this load.",
    reason: "No live delegation from the authorised broker was found.",
    lastValid: "Last valid authority expired at 10:45 UTC",
    chain: [],
    missingChain: [
      {
        role: "Shipper",
        name: "Sunrise Foods",
        sublabel: "Original issuer",
      },
      {
        role: "Authorised broker",
        name: "Atlantic Freight",
        sublabel: "Has parent mandate LP-M619",
      },
      {
        role: "MISSING AUTHORITY",
        name: "No live delegation to FastLine Brokerage",
        isMissing: true,
        missingText: "Authority chain broken at Broker A -> Broker B delegation step.",
      },
      {
        role: "Current broker",
        name: "FastLine Brokerage",
        sublabel: "Offered load without active mandate delegation",
      },
    ],
    checks: [
      { id: "c1", text: "Original shipper mandate exists", passed: true },
      { id: "c2", text: "Original mandate is still live", passed: true },
      { id: "c3", text: "Broker A is named in the mandate", passed: true },
      { id: "c4", text: "Delegation is permitted", passed: true },
      { id: "c5", text: "Broker B has a live delegation", passed: false },
      { id: "c6", text: "Delegation does not exceed parent authority", passed: false },
    ],
  },
};

export const ARKIV_DATA = {
  records: [
    {
      name: "LOAD_MANDATE",
      creator: "Created by the shipper",
      description: "Defines who may tender the load, scope, delegation rights and validity period.",
      fields: [
        "loadRef",
        "brokerRef",
        "scope",
        "validFrom",
        "validUntil",
        "delegationAllowed",
      ],
    },
    {
      name: "DELEGATION",
      creator: "Created by an authorised broker",
      description: "Created when the parent mandate permits delegation to downstream partners.",
      fields: [
        "loadRef",
        "parentMandateRef",
        "delegateRef",
        "scope",
        "validUntil",
      ],
    },
    {
      name: "MANDATE_RECEIPT",
      creator: "Generated automatically",
      description: "Longer-lived audit evidence after live authority period has ended.",
      fields: ["loadRef", "mandateRef", "outcome", "closedAt"],
    },
  ],
  staysOffArkiv: [
    "Shipment details & street addresses",
    "Rate confirmations & financial pricing",
    "Driver & truck PII data",
    "Payment transactions & bank accounts",
    "Live GPS tracking coordinates",
    "Carrier booking contracts",
  ],
};
