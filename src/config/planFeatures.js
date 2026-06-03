export const PLAN_FEATURES = {
  website: {
    menu: true,
    enquiries: true,
    basicSettings: true,
  },

  starter: {
    menu: true,
    enquiries: true,
    basicSettings: true,
    dashboard: true,
    kitchen: true,
    qrTables: true,
    customerOrdering: true,
  },

  pro: {
    menu: true,
    enquiries: true,
    basicSettings: true,
    dashboard: true,
    kitchen: true,
    qrTables: true,
    customerOrdering: true,
    currentTables: true,
    history: true,
    analytics: true,
    coupons: true,
    feedback: true,
    staff: true,
    settings: true,
    printBill: true,
  },
};

export const hasFeature = (plan, feature) => {
  const cleanPlan = String(plan || "website").toLowerCase();
  if (cleanPlan === "pro") return true;
  return Boolean(PLAN_FEATURES[cleanPlan]?.[feature]);
};
