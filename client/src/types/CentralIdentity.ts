export type CentralIdentitySystem = {
  id: number;
  logo: string | null;
  name: string;
};

export type CentralIdentityOrg = {
  id: number;
  logo: string | null;
  name: string;
  system?: CentralIdentitySystem;
};

export type CentralIdentityService = {
  service_Id: string;
  name: string;
  body: string;
  evaluation_Order: number;
  evaluation_Priority: number;
};

export type CentralIdentityApp = {
  id: number;
  name: string;
  app_type: "standalone" | "library";
  main_url: string;
  cas_service_url: string;
  default_access: "all" | "instructors" | "none";
  icon: string;
  description: string;
  primary_color: string;
  hide_from_apps: boolean;
  hide_from_user_apps: boolean;
  is_default_library: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CentralIdentityUser = {
  active: boolean;
  avatar: string | null;
  bio_url?: string | null;
  createdAt: string;
  disabled: boolean | null;
  email: string;
  enabled: boolean;
  expired: boolean | null;
  external_idp: string | null;
  external_subject_id: string | null;
  first_name: string;
  last_name: string;
  last_password_change: string | null;
  last_access?: string | null;
  legacy: boolean;
  organizations: CentralIdentityOrg[];
  registration_complete: boolean | null;
  updatedAt: string | null;
  user_type: "student" | "instructor";
  student_id?: string;
  uuid: string;
  verify_status:
    | "not_attempted"
    | "pending"
    | "needs_review"
    | "denied"
    | "verified";
};

export type CentralIdentityAccessRequest = {
  id: number;
  user_id: string;
  verification_request_id: string | number;
  applications: CentralIdentityApp[];
  status: CentralIdentityAccessRequestStatus;
  created_at: Date;
  updated_at: Date;
};

export type CentralIdentityAccessRequestStatus =
  | "open"
  | "denied"
  | "approved"
  | "partially_approved";

export type CentralIdentityAccessRequestChangeEffect =
  | "approve"
  | "deny"
  | "request_change";

export type CentralIdentityVerificationRequest = {
  id: number;
  user_id: string;
  status: CentralIdentityVerificationRequestStatus;
  bio_url?: string;
  addtl_info?: string;
  decision_reason?: string;
  created_at: Date;
  updated_at: Date;
  user: Pick<CentralIdentityUser, "first_name" | "last_name" | "email" | "uuid">;
  access_request: CentralIdentityAccessRequest;
};

export type CentralIdentityVerificationRequestStatus =
  | "approved"
  | "denied"
  | "needs_change"
  | "open";

export type CentralIdentityLicense = {
  name: string;
  versions?: string[];
  url?: string;
  created_at: Date;
  updated_at: Date;
};
