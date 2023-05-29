import { BaseDocument } from "./BaseDocument";
import { TimeZoneOption } from "./Misc";
import {
  CustomFormHeading,
  CustomFormTextBlock,
  CustomFormPrompt,
} from "./CustomForm";
import { User } from "./User";

export type OrgEventParticipantFormResponse = {
  promptNum: number;
  responseVal?: string;
};

export type OrgEventParticipant = BaseDocument & {
  user: User;
  orgID: string;
  eventID: string;
  paymentStatus: "na" | "unpaid" | "paid";
  formResponses: OrgEventParticipantFormResponse[];
};

export type OrgEvent = BaseDocument & {
  _id: string;
  orgID: string;
  eventID: string;
  title: string;
  description?: string;
  regFee?: number;
  regOpenDate: Date;
  regCloseDate: Date;
  startDate: Date;
  endDate: Date;
  timeZone: TimeZoneOption;
  headings: CustomFormHeading[];
  textBlocks: CustomFormTextBlock[];
  prompts: CustomFormPrompt[];
  participants: OrgEventParticipant[];
  createdBy: string;
  canceled: boolean;
};
