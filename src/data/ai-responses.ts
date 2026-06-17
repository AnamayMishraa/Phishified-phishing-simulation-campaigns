import { getOverviewStats, departmentRiskData, campaignPerformanceData, campaignComparisonData } from "./analytics";
import { getRecentCampaigns, getActiveCampaigns } from "./campaigns";
import { getHighRiskEmployees } from "./employees";

export const suggestedPrompts = [
  "Analyze my current campaign performance",
  "Which departments need the most training?",
  "Give me campaign recommendations",
  "Summarize this quarter's report",
  "What are our top risk indicators?",
  "Suggest improvements for click rates",
];

function getFormattedDate(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function campaignPerformanceResponse(): string {
  const stats = getOverviewStats();
  const active = getActiveCampaigns();
  const recent = getRecentCampaigns(3);
  const latestData = campaignPerformanceData.slice(-3);

  return `## Campaign Performance Analysis

### Current Overview
- **Total Campaigns:** ${stats.totalCampaigns} (${stats.activeCampaigns} active)
- **Overall Click Rate:** ${stats.overallClickRate}% across all campaigns
- **Report Rate:** ${stats.overallReportRate}%
- **Risk Score:** ${stats.riskScore} (${stats.riskScoreChange > 0 ? "increasing" : "decreasing"})

### Active Campaigns
${active.map((c) => `- **${c.name}** — ${c.status}, ${c.type} campaign targeting ${c.targetCount} employees`).join("\n")}

### Recent Trend
${latestData.map((d) => `- ${d.month}: Click rate ${d.clickRate}%, Report rate ${d.reportRate}%`).join("\n")}

### Recommendations
1. **Increase reporting incentives** — Report rates are improving but still below the 40% benchmark
2. **Target high-risk departments** with specialized training before the next campaign wave
3. **A/B test email templates** — Vary subject lines and sender names to identify the most effective phishing lures

*Analysis generated ${getFormattedDate()}*`;
}

function departmentsTrainingResponse(): string {
  const highRisk = getHighRiskEmployees().slice(0, 5);
  const topDepts = [...departmentRiskData].sort((a, b) => b.risk - a.risk).slice(0, 4);

  return `## Department Risk & Training Needs

### Highest Risk Departments
${topDepts.map((d) => `- **${d.name}** — Risk Score: ${d.risk}/100 (${d.employees} employees, ${d.change > 0 ? "+" : ""}${d.change} since last quarter)`).join("\n")}

### Recommended Training by Department

| Department | Recommended Course | Priority |
|------------|-------------------|----------|
| ${topDepts[0]?.name || "N/A"} | Phishing Foundations | High |
| ${topDepts[1]?.name || "N/A"} | Social Engineering Tactics | High |
| ${topDepts[2]?.name || "N/A"} | Credential Safety & MFA | Medium |
| ${topDepts[3]?.name || "N/A"} | Mobile Device Security | Medium |

### High-Risk Employees
${highRisk.map((e) => `- **${e.name}** (${e.department}) — ${e.riskScore} risk score, ${e.totalPhishClicked} clicks`).join("\n")}

### Training Recommendations
1. **Mandatory refresher** for departments with risk scores above 60
2. **Phishing simulations** tailored to department-specific threat vectors
3. **Monthly micro-training** modules for high-risk individuals

*Analysis generated ${getFormattedDate()}*`;
}

function campaignRecommendationsResponse(): string {
  const comparisons = campaignComparisonData;
  const stats = getOverviewStats();

  return `## Campaign Recommendations

### Performance Benchmarks
- **Best Performing:** "${comparisons.reduce((a, b) => a.reportRate > b.reportRate ? a : b).name}" — ${comparisons.reduce((a, b) => a.reportRate > b.reportRate ? a : b).reportRate}% report rate
- **Worst Performing:** "${comparisons.reduce((a, b) => a.clickRate > b.clickRate ? a : b).name}" — ${comparisons.reduce((a, b) => a.clickRate > b.clickRate ? a : b).clickRate}% click rate
- **Your Benchmark:** ${stats.overallClickRate}% click rate vs 15% industry average

### Recommended Campaigns

**1. "Tax Season W-2 Request"** — High urgency, tax-themed phishing
- Target: All employees (${stats.totalEmployees})
- Expected click rate: 18-22%
- Best for: Testing financial data handling awareness

**2. "HR Policy Update: Remote Work Agreement"** — Internal branding
- Target: ${stats.totalEmployees - 200} remote-capable employees
- Expected click rate: 12-15%
- Best for: Measuring policy compliance vigilance

**3. "Slack Workspace Migration Notice"** — Tool-specific phishing
- Target: Engineering & Ops teams (~${departmentRiskData.find((d) => d.name === "Engineering")?.employees || 80} employees)
- Expected click rate: 8-12%
- Best for: Testing SaaS platform vigilance

### Schedule Recommendation
- Run **1 campaign per week** for optimal engagement
- Avoid Monday mornings and Friday afternoons (lowest open rates)
- Send Tuesday-Thursday between 9:30-11:00 AM local time

*Analysis generated ${getFormattedDate()}*`;
}

function quarterReportResponse(): string {
  const stats = getOverviewStats();
  const recent = getRecentCampaigns(3);

  return `## Quarterly Report Summary

### Executive Overview
- **Period:** Q1 2026 (January — March)
- **Campaigns Run:** ${recent.length} (${recent.filter((c) => c.status === "completed").length} completed)
- **Total Employees Tested:** ${stats.totalEmployees}
- **Training Completion Rate:** ${stats.trainingCompletionRate}

### Key Findings

**Click Rate Trends:** Click rates have declined from ${campaignPerformanceData[0]?.clickRate || 34}% to ${campaignPerformanceData[3]?.clickRate || 25}% — a ${Math.abs((campaignPerformanceData[3]?.clickRate || 25) - (campaignPerformanceData[0]?.clickRate || 34))} percentage point improvement — indicating growing employee awareness.

**Reporting Improvements:** Employee reporting rates increased from ${campaignPerformanceData[0]?.reportRate || 12}% to ${campaignPerformanceData[3]?.reportRate || 22}%, showing that training on proper reporting procedures is working.

**Department Risk:** ${departmentRiskData.filter((d) => d.risk >= 50).length} out of ${departmentRiskData.length} departments remain above the 50-risk threshold and require targeted intervention.

### Recommendations
1. Continue monthly phishing simulations with varying themes
2. Deploy mandatory training for departments exceeding 60 risk score
3. Recognize and reward departments with highest reporting rates
4. Schedule executive briefing on overall security posture improvement

*Summary generated ${getFormattedDate()}*`;
}

function riskIndicatorsResponse(): string {
  const stats = getOverviewStats();
  const highRisk = getHighRiskEmployees().slice(0, 3);
  const topDept = [...departmentRiskData].sort((a, b) => b.risk - a.risk)[0];

  return `## Top Risk Indicators

### 1. High Click Rates in Specific Departments
- **${topDept?.name || "N/A"}** leads with a risk score of ${topDept?.risk || 0}/100
- ${topDept?.employees || 0} employees in high-risk department
- Risk trend: ${topDept && topDept.change > 0 ? "Increasing" : "Decreasing"}

### 2. Credential Submission Rate
- Current rate: ${stats.credentialSubmissionRate}
- ${parseFloat(stats.credentialSubmissionRate) > 10 ? "Above" : "Below"} the 10% acceptable threshold
- Most submissions occur within 5 minutes of email delivery

### 3. Repeat Clickers (High-Risk Individuals)
${highRisk.map((e) => `- **${e.name}** — ${e.riskScore} risk score, ${e.department}: Clicked on ${e.totalPhishClicked} simulated phishing emails`).join("\n")}

### 4. Training Completion Gaps
- Only ${stats.trainingCompletionRate} of employees have completed required training
- ${Math.round(stats.totalEmployees * (100 - parseFloat(stats.trainingCompletionRate)) / 100)} employees have not completed any training this quarter

### Recommended Actions
1. **Immediate:** Deploy targeted training for repeat clickers
2. **Short-term:** Reduce credential submission rate with MFA awareness campaign
3. **Long-term:** Implement department-level risk dashboards for managers

*Analysis generated ${getFormattedDate()}*`;
}

function improvementSuggestionsResponse(): string {
  const stats = getOverviewStats();
  const comparisons = campaignComparisonData;

  return `## Suggestions for Improving Click Rates

### Current Performance
- Overall click rate: ${stats.overallClickRate}%
- Best campaign: "${comparisons.reduce((a, b) => a.clickRate < b.clickRate ? a : b).name}" (${comparisons.reduce((a, b) => a.clickRate < b.clickRate ? a : b).clickRate}%)
- Worst campaign: "${comparisons.reduce((a, b) => a.clickRate > b.clickRate ? a : b).name}" (${comparisons.reduce((a, b) => a.clickRate > b.clickRate ? a : b).clickRate}%)

### Strategies That Work

**1. Personalize Phishing Templates**
- Use employee names, department references, and company-specific terminology
- Personalized emails see 35% higher engagement (and therefore better training value)

**2. Vary Sender Addresses**
- Rotate between known vendors, internal departments, and external services
- Avoid repeating sender names within 60-day windows

**3. Optimize Send Timing**
- Tuesday through Thursday, 9:30-11:00 AM yields highest engagement
- Avoid Monday mornings (low attention) and Friday afternoons (weekend mode)

**4. Use Multi-Channel Simulations**
- Combine email with SMS phishing (smishing) for a comprehensive test
- Mobile users click at 2x the rate of desktop users

**5. Reward Positive Behavior**
- Public recognition for departments that report phishing within 5 minutes
- Gamification increases reporting rates by 25-40%

*A good click rate for training purposes is 10-20%. Below 5% means simulations may be too easy; above 30% means employees need more training.*`;
}

function getFallbackResponse(input: string): string {
  const q = input.toLowerCase();

  if (q.includes("campaign") && (q.includes("performance") || q.includes("analyze"))) {
    return campaignPerformanceResponse();
  }
  if (q.includes("department") || (q.includes("training") && (q.includes("need") || q.includes("department")))) {
    return departmentsTrainingResponse();
  }
  if (q.includes("recommend") || q.includes("suggest")) {
    return campaignRecommendationsResponse();
  }
  if (q.includes("report") && (q.includes("summar") || q.includes("quarter"))) {
    return quarterReportResponse();
  }
  if (q.includes("risk") && (q.includes("indicator") || q.includes("top"))) {
    return riskIndicatorsResponse();
  }
  if (q.includes("improve") || q.includes("click rate")) {
    return improvementSuggestionsResponse();
  }

  return `I understand you're asking about "${input}". Here are some things I can help with:

1. **Campaign Analysis** — Try "Analyze my current campaign performance"
2. **Department Risk** — Try "Which departments need the most training?"
3. **Campaign Recommendations** — Try "Give me campaign recommendations"
4. **Report Summaries** — Try "Summarize this quarter's report"
5. **Risk Indicators** — Try "What are our top risk indicators?"
6. **Improvement Tips** — Try "Suggest improvements for click rates"

Or select one of the suggested prompts below to get started.`;
}

export function getMockResponse(input: string): string {
  const q = input.toLowerCase().trim();

  if (q.includes("campaign") && (q.includes("performance") || q.includes("analyze") || q.includes("current"))) {
    return campaignPerformanceResponse();
  }
  if ((q.includes("department") && (q.includes("risk") || q.includes("training") || q.includes("need"))) || q.includes("highest click")) {
    return departmentsTrainingResponse();
  }
  if (q.includes("recommend") || (q.includes("campaign") && q.includes("suggest"))) {
    return campaignRecommendationsResponse();
  }
  if ((q.includes("report") && (q.includes("summar") || q.includes("quarter"))) || q.includes("quarterly")) {
    return quarterReportResponse();
  }
  if ((q.includes("risk") && (q.includes("indicator") || q.includes("top") || q.includes("what"))) || q.includes("vulnerable")) {
    return riskIndicatorsResponse();
  }
  if (q.includes("improve") || q.includes("click rate") || q.includes("reduc")) {
    return improvementSuggestionsResponse();
  }

  return getFallbackResponse(input);
}
