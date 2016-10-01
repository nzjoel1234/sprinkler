export class User {
  username: string;
  roles: string[];
  
  hasRole(role: string): Boolean {
    return this.roles.indexOf(role) >= 0;
  }
}
