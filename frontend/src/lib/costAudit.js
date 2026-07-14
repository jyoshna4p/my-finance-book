// Pure helpers extracted from CostAudit page to reduce component complexity.

export function computeEligibility({ sector, overall, product, sez }) {
  const recordsReq = overall >= 35 && !sez;
  const auditReq = sez
    ? false
    : sector === "Regulated"
    ? overall >= 50 && product >= 25
    : overall >= 100 && product >= 35;
  return { recordsReq, auditReq };
}

export function computeVariances({ pl, gstr, cra }) {
  return { varAB: pl - gstr, varAC: pl - cra, varBC: gstr - cra };
}

export function computeCapacity({ installed, planned, actual }) {
  const achievable = installed - planned;
  const abnormalIdle = Math.max(0, achievable - actual);
  const utilisation = installed ? (actual / installed) * 100 : 0;
  const idlePct = installed ? (abnormalIdle / installed) * 100 : 0;
  return { achievable, abnormalIdle, utilisation, idlePct };
}

export function computeReconciledProfit({ profitCost, incNotCA, expNotCA }) {
  return profitCost + incNotCA - expNotCA;
}

export function buildXbrl({ cin, sector, product, installed, achievable, actual, abnormalIdle, profitCost, incNotCA, expNotCA, reconciledProfit }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xbrl xmlns="http://www.xbrl.org/2003/instance"
      xmlns:in-cca="http://www.mca.gov.in/xbrl/cost-audit/2020">
  <in-cca:CorporateIdentityNumber>${cin}</in-cca:CorporateIdentityNumber>
  <in-cca:SectorClassification>${sector}</in-cca:SectorClassification>
  <in-cca:ProductServiceDetailsTable>
    <in-cca:AggregateTurnover>${(product * 10000000).toLocaleString("en-IN")}</in-cca:AggregateTurnover>
  </in-cca:ProductServiceDetailsTable>
  <in-cca:QuantitativeInformationProduction>
    <in-cca:InstalledCapacityHours>${installed}</in-cca:InstalledCapacityHours>
    <in-cca:AchievableCapacityHours>${achievable}</in-cca:AchievableCapacityHours>
    <in-cca:ActualProductionHours>${actual}</in-cca:ActualProductionHours>
    <in-cca:AbnormalIdleCapacityHours>${abnormalIdle}</in-cca:AbnormalIdleCapacityHours>
  </in-cca:QuantitativeInformationProduction>
  <in-cca:CostReconciliationStatementTable>
    <in-cca:ProfitAsPerCostRecords>${profitCost.toLocaleString("en-IN")}</in-cca:ProfitAsPerCostRecords>
    <in-cca:IncomeNotConsideredInCost>${incNotCA.toLocaleString("en-IN")}</in-cca:IncomeNotConsideredInCost>
    <in-cca:ExpenseNotConsideredInCost>${expNotCA.toLocaleString("en-IN")}</in-cca:ExpenseNotConsideredInCost>
    <in-cca:ReconciledFinancialProfit>${reconciledProfit.toLocaleString("en-IN")}</in-cca:ReconciledFinancialProfit>
  </in-cca:CostReconciliationStatementTable>
</xbrl>`;
}
