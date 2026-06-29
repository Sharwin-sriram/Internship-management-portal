import api from "../lib/axios";

export interface AdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  emailVerified?: boolean;
  approval_status?: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export interface CompanyRecord {
  _id: string;
  company_name?: string;
  legal_name?: string;
  industry?: string;
  approval_status?: "pending" | "approved" | "rejected";
  is_verified?: boolean;
  website?: string;
  description?: string;
  primary_contact?: { name?: string; email?: string; phone?: string };
  user?: { name?: string; email?: string };
  createdAt?: string;
}

export interface StudentDetail {
  _id: string;
  college: string;
  branch: string;
  cgpa: number;
  graduation_year: number;
  skills: string[];
  skillProficiencies?: Array<{ skill: string; proficiency: number }>;
  placement_eligible: boolean;
  bio: string;
  linkedin_url: string;
  github_url: string;
  projects?: Array<{ title: string; desc: string }>;
}

export interface StudentProfileForAdmin {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    approval_status: "pending" | "approved" | "rejected";
    authProvider: string;
    githubId?: string | null;
    googleId?: string | null;
  };
  student: StudentDetail;
  verification: {
    hasGitHub: boolean;
    hasLinkedIn: boolean;
    autoApproved: boolean;
  };
}

export interface AdminStudentRow extends AdminUser {
  college?: string;
  branch?: string;
  cgpa?: number;
  linkedin_url?: string;
  github_url?: string;
  hasGitHub?: boolean;
  hasLinkedIn?: boolean;
}

export async function fetchAdminUsers(role?: string) {
  const { data } = await api.get<{
    success: boolean;
    count: number;
    data: AdminUser[];
  }>("/rbac/users", { params: role ? { role } : undefined });
  return data;
}

export async function fetchAdminStudents() {
  const { data } = await api.get<{
    success: boolean;
    count: number;
    data: AdminStudentRow[];
  }>("/rbac/students");
  return data;
}

export async function fetchStudentProfile(studentId: string) {
  const { data } = await api.get<{
    success: boolean;
    data: StudentProfileForAdmin;
  }>(`/rbac/students/${studentId}`);
  return data;
}

export async function fetchCompanies() {
  const { data } = await api.get<{
    success: boolean;
    count: number;
    data: CompanyRecord[];
  }>("/companies");
  return data;
}

export async function fetchCompanyRequests(status = "pending") {
  const { data } = await api.get<{
    success: boolean;
    count: number;
    data: CompanyRecord[];
  }>("/companies/requests", { params: { status } });
  return data;
}

export async function updateCompanyApproval(
  companyId: string,
  status: "approved" | "rejected",
) {
  const { data } = await api.put<{
    success: boolean;
    data: CompanyRecord;
    message?: string;
  }>(`/companies/${companyId}/approval`, { status });
  return data;
}

export async function updateUserRole(userId: string, role: string) {
  const { data } = await api.post<{
    success: boolean;
    data: AdminUser;
    message?: string;
  }>(`/rbac/users/${userId}/role`, { role });
  return data;
}

export async function updateUserApprovalStatus(userId: string, status: "approved" | "rejected" | "pending") {
  const { data } = await api.put<{
    success: boolean;
    data: AdminUser;
    message?: string;
  }>(`/rbac/users/${userId}/approval`, { status });
  return data;
}

export async function deleteAdminUser(userId: string) {
  const { data } = await api.delete<{
    success: boolean;
    message?: string;
  }>(`/rbac/users/${userId}`);
  return data;
}

export async function deleteAdminCompany(companyId: string) {
  const { data } = await api.delete<{
    success: boolean;
    message?: string;
  }>(`/companies/${companyId}`);
  return data;
}

export interface AdminInternshipListItem {
  _id: string;
  title: string;
  description?: string;
  status: "open" | "closed" | "draft";
  stipend_min: number;
  stipend_max: number;
  duration?: string;
  location?: string;
  skills_required?: string[];
  batch_id?: string;
  deadline?: string;
  createdAt?: string;
  applicationCount: number;
  companyName: string;
  company?: CompanyRecord;
}

export interface AdminApplicationRow {
  source: string;
  id: string;
  studentName: string;
  email: string;
  status: string;
  cgpa?: number;
  department?: string;
  stream?: string;
  appliedAt?: string;
  studentUserId?: string | null;
  studentId?: string | null;
}

export interface AdminInternshipDetail {
  internship: AdminInternshipListItem;
  company: CompanyRecord;
  stats: {
    total: number;
    applied: number;
    shortlisted: number;
    interview: number;
    selected: number;
    rejected: number;
    offer: number;
  };
  applications: AdminApplicationRow[];
  eligibility: {
    batch: string;
    skills: string[];
    location: string;
    deadline: string;
  };
}

export async function fetchAdminInternships() {
  const { data } = await api.get<{
    success: boolean;
    count: number;
    data: AdminInternshipListItem[];
  }>("/admin/internships");
  return data;
}

export async function fetchAdminInternshipDetail(id: string) {
  const { data } = await api.get<{
    success: boolean;
    data: AdminInternshipDetail;
  }>(`/admin/internships/${id}`);
  return data;
}

export async function fetchAdminCompanyProfile(id: string) {
  const { data } = await api.get<{
    success: boolean;
    data: {
      company: CompanyRecord;
      owner: { name: string; email: string; role: string; createdAt?: string } | null;
      internships: AdminInternshipListItem[];
      stats: {
        totalInternships: number;
        openInternships: number;
        totalApplications: number;
      };
    };
  }>(`/admin/companies/${id}`);
  return data;
}
