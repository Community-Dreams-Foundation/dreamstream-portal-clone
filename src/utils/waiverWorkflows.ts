
import type { WaiverRequest, WaiverType } from "@/types/waiver"

interface WorkflowResult {
  autoApproved: boolean
  reason?: string
  approvedDuration?: string
}

export const processWaiverWorkflow = (waiver: WaiverRequest): WorkflowResult => {
  switch (waiver.type) {
    case "referral":
      return processReferralWaiver(waiver)
    case "hardship":
      return processHardshipWaiver(waiver)
    case "competition":
      return processCompetitionWaiver(waiver)
    case "leadership":
      return processLeadershipWaiver(waiver)
    case "sweat-equity":
      return processSweatEquityWaiver(waiver)
    default:
      return { autoApproved: false }
  }
}

const processReferralWaiver = (waiver: WaiverRequest): WorkflowResult => {
  if (waiver.recruit_count && waiver.recruit_count >= 3) {
    return {
      autoApproved: true,
      reason: "Automatic approval for 3+ successful referrals",
      approvedDuration: "6 months"
    }
  }
  return { autoApproved: false }
}

const processHardshipWaiver = (waiver: WaiverRequest): WorkflowResult => {
  // Hardship waivers always require manual review
  return { autoApproved: false }
}

const processCompetitionWaiver = (waiver: WaiverRequest): WorkflowResult => {
  // Competition waivers get fast-tracked but still need manual approval
  return { autoApproved: false }
}

const processLeadershipWaiver = (waiver: WaiverRequest): WorkflowResult => {
  // Leadership track waivers require thorough review
  return { autoApproved: false }
}

const processSweatEquityWaiver = (waiver: WaiverRequest): WorkflowResult => {
  // Sweat equity waivers need manual verification
  return { autoApproved: false }
}
