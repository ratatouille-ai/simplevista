export interface AdminUser {
  id: number;
  uuid: string;
  key: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

class CurrentAdminUserService {
  static getAdminUser(): AdminUser {
    return JSON.parse(localStorage.getItem("adminUser") as string) as AdminUser;
  }
}

export default CurrentAdminUserService;
