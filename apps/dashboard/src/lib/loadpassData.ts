export interface ChainStep {
  id: string;
  role: "Shipper" | "Broker A" | "Broker B" | "Carrier" | "Authorised broker" | "Current broker";
  name: string;
  sublabel: string;
  status?: string;
  creatorId?: string;
  connector?: {
    type: string;
    ref?: string;
    details: Array<{ label: string; value: string }>;
  };
}

export interface VerificationCheck {
  id: string;
  text: string;
  passed: boolean;
}

export interface TimelineEntry {
  time: string;
  event: string;
  status: "completed" | "active" | "upcoming";
}

export interface LoadDetails {
  id: string;
  offeredBy: string;
  route: {
    origin: string;
    destination: string;
  };
  pickup: string;
  status: "VERIFIED" | "NOT_VERIFIED" | "EXPIRED";
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
  timeline: TimelineEntry[];
  nextSteps: {
    title: string;
    items: string[];
  };
  arkivEntities: {
    mandate: {
      type: string;
      loadRef: string;
      brokerRef: string;
      scope: string;
      delegationAllowed: boolean;
      validFrom: string;
      validUntil: string;
      status: string;
      creator: string;
      creatorAddress: string;
      owner: string;
      lifecycle: string;
    };
    delegation?: {
      type: string;
      loadRef: string;
      parentMandateRef: string;
      delegateRef: string;
      scope: string;
      validUntil: string;
      status: string;
      creator: string;
      creatorAddress: string;
      parent: string;
    };
    receipt: {
      type: string;
      loadRef: string;
      mandateRef: string;
      outcome: string;
      closedAt: string;
      explanation: string;
    };
  };
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
        creatorId: "0xabc4...77fa",
        connector: {
          type: "LOAD_MANDATE",
          ref: "LP-M842",
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
        creatorId: "0xnor9...11b2",
        connector: {
          type: "DELEGATION",
          ref: "LP-D119",
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
      { id: "c1", text: "Original mandate found", passed: true },
      { id: "c2", text: "Mandate creator matches recognised shipper", passed: true },
      { id: "c3", text: "Mandate is currently live", passed: true },
      { id: "c4", text: "Broker A is named in the mandate", passed: true },
      { id: "c5", text: "Delegation is permitted", passed: true },
      { id: "c6", text: "Broker B has a linked delegation", passed: true },
      { id: "c7", text: "Delegation remains inside parent scope & lifetime", passed: true },
    ],
    timeline: [
      { time: "09:00 UTC", event: "LOAD_MANDATE created by ABC Foods", status: "completed" },
      { time: "10:15 UTC", event: "DELEGATION issued by Northstar Freight to QuickHaul", status: "completed" },
      { time: "NOW", event: "Authority active and queryable on Arkiv", status: "active" },
      { time: "17:30 UTC", event: "Delegation LP-D119 expires", status: "upcoming" },
      { time: "18:00 UTC", event: "Parent Mandate LP-M842 expires", status: "upcoming" },
    ],
    nextSteps: {
      title: "Recommended Action",
      items: [
        "Authority verified. Safe to accept tender offer.",
        "Check expiry time (17:30 UTC) to ensure pickup occurs while authority is live.",
        "LOADPASS receipt will auto-generate upon tender closure.",
      ],
    },
    arkivEntities: {
      mandate: {
        type: "load_mandate",
        loadRef: "LP-4821",
        brokerRef: "NORTHSTAR",
        scope: "tender",
        delegationAllowed: true,
        validFrom: "1787126400 (19 Aug · 09:00 UTC)",
        validUntil: "1787152800 (19 Aug · 18:00 UTC)",
        status: "active",
        creator: "ABC Foods",
        creatorAddress: "0xabc491f7...8821",
        owner: "ABC Foods",
        lifecycle: "Live until mandate expiry",
      },
      delegation: {
        type: "delegation",
        loadRef: "LP-4821",
        parentMandateRef: "LP-M842",
        delegateRef: "QUICKHAUL",
        scope: "tender",
        validUntil: "1787151000 (19 Aug · 17:30 UTC)",
        status: "active",
        creator: "Northstar Freight",
        creatorAddress: "0xnor918c2...11b2",
        parent: "LP-M842",
      },
      receipt: {
        type: "mandate_receipt",
        loadRef: "LP-4821",
        mandateRef: "LP-M842",
        outcome: "closed_fulfilled",
        closedAt: "1787152805",
        explanation: "Created after live authority closes when longer-lived evidence is useful.",
      },
    },
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
    supportingText: "LOADPASS could not find a complete live authority chain for FastLine Brokerage.",
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
        role: "MISSING DELEGATION",
        name: "No live delegation to FastLine Brokerage",
        isMissing: true,
        missingText: "Authority chain incomplete at Atlantic Freight -> FastLine Brokerage step.",
      },
      {
        role: "Current broker",
        name: "FastLine Brokerage",
        sublabel: "Offered load without active delegation record",
      },
    ],
    checks: [
      { id: "c1", text: "Original shipper mandate exists", passed: true },
      { id: "c2", text: "Broker A (Atlantic Freight) is authorised", passed: true },
      { id: "c3", text: "No live delegation to FastLine Brokerage found", passed: false },
    ],
    timeline: [
      { time: "08:30 UTC", event: "LOAD_MANDATE created by Sunrise Foods for Atlantic Freight", status: "completed" },
      { time: "10:45 UTC", event: "Previous temporary delegation expired", status: "completed" },
      { time: "NOW", event: "Authority chain incomplete (missing delegation)", status: "active" },
    ],
    nextSteps: {
      title: "Before accepting this load",
      items: [
        "Ask the offering broker (FastLine Brokerage) for current authority.",
        "Confirm the handoff directly with the authorised broker (Atlantic Freight).",
        "Re-run the LOADPASS check after the authority record is updated.",
      ],
    },
    arkivEntities: {
      mandate: {
        type: "load_mandate",
        loadRef: "LP-7734",
        brokerRef: "ATLANTIC",
        scope: "tender",
        delegationAllowed: true,
        validFrom: "1787124600 (19 Aug · 08:30 UTC)",
        validUntil: "1787167800 (19 Aug · 20:30 UTC)",
        status: "active",
        creator: "Sunrise Foods",
        creatorAddress: "0xsun7712...99a1",
        owner: "Sunrise Foods",
        lifecycle: "Live",
      },
      receipt: {
        type: "mandate_receipt",
        loadRef: "LP-7734",
        mandateRef: "LP-M619",
        outcome: "incomplete_delegation",
        closedAt: "1787132700",
        explanation: "Recorded attempt without valid delegation payload on chain.",
      },
    },
  },
  "LP-5910": {
    id: "LP-5910",
    offeredBy: "MetroHaul Freight",
    route: {
      origin: "Milwaukee, WI",
      destination: "Indianapolis, IN",
    },
    pickup: "19 Aug · 08:00",
    status: "EXPIRED",
    headline: "○ AUTHORITY EXPIRED",
    supportingText: "MetroHaul Freight had authority to tender this load, but that authority is no longer live.",
    lastValid: "Expired at 12:30 UTC",
    statePill: "EXPIRED",
    chain: [
      {
        id: "step-1",
        role: "Shipper",
        name: "GreenFields Produce",
        sublabel: "Original issuer",
        creatorId: "0xgree22...44d9",
        connector: {
          type: "LOAD_MANDATE",
          ref: "LP-M304",
          details: [
            { label: "Mandate", value: "LP-M304" },
            { label: "Tender authority", value: "Expired" },
            { label: "Delegation", value: "Allowed" },
            { label: "Expired at", value: "12:30 UTC" },
          ],
        },
      },
      {
        id: "step-2",
        role: "Broker A",
        name: "MetroHaul Freight",
        sublabel: "Current broker",
        status: "Authority expired",
      },
      {
        id: "step-3",
        role: "Carrier",
        name: "Your Fleet",
        sublabel: "You are here",
      },
    ],
    checks: [
      { id: "c1", text: "Original shipper mandate exists", passed: true },
      { id: "c2", text: "Mandate creator matches recognised shipper", passed: true },
      { id: "c3", text: "Original mandate is still live", passed: false },
      { id: "c4", text: "Authority timeframe active", passed: false },
    ],
    timeline: [
      { time: "06:00 UTC", event: "LOAD_MANDATE created by GreenFields Produce", status: "completed" },
      { time: "12:30 UTC", event: "Mandate LP-M304 reached validUntil expiration", status: "completed" },
      { time: "NOW", event: "Authority expired - requires mandate renewal", status: "active" },
    ],
    nextSteps: {
      title: "Before accepting this load",
      items: [
        "Ask the shipper (GreenFields Produce) or authorised broker to renew authority if load is still available.",
        "Do not book under expired authority.",
        "Re-check LOADPASS reference after mandate renewal.",
      ],
    },
    arkivEntities: {
      mandate: {
        type: "load_mandate",
        loadRef: "LP-5910",
        brokerRef: "METROHAUL",
        scope: "tender",
        delegationAllowed: true,
        validFrom: "1787115600 (06:00 UTC)",
        validUntil: "1787139000 (12:30 UTC)",
        status: "expired",
        creator: "GreenFields Produce",
        creatorAddress: "0xgree22...44d9",
        owner: "GreenFields Produce",
        lifecycle: "Expired at 12:30 UTC",
      },
      receipt: {
        type: "mandate_receipt",
        loadRef: "LP-5910",
        mandateRef: "LP-M304",
        outcome: "expired_unfulfilled",
        closedAt: "1787139005",
        explanation: "Created automatically when parent mandate reached its validity cutoff.",
      },
    },
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
    "Bill of lading & freight manifests",
    "Shipper & consignee street addresses",
    "Rate confirmations & financial pricing",
    "Driver PII & truck license plates",
    "Payment transactions & bank accounts",
    "Private carrier contracts & rate sheets",
    "Live GPS tracking coordinates",
    "Booking execution logs",
  ],
  whyArkiv: [
    {
      model: "Broker database",
      subtitle: "The broker stores the proof.",
      problem: "Carrier must trust the party being checked.",
      icon: "database",
    },
    {
      model: "Load-board database",
      subtitle: "The marketplace stores the proof.",
      problem: "Authority becomes tied to one platform.",
      icon: "server",
    },
    {
      model: "LOADPASS on Arkiv",
      subtitle: "The party granting authority writes the record.",
      problem: "Independent carriers, brokers and marketplaces query the same live state.",
      icon: "shield",
      highlight: true,
    },
  ],
};
