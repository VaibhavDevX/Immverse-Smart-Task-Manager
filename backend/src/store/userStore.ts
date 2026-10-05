import { User } from '../types/index.js';

class UserStore {
  private users: Map<string, User> = new Map();

  public getAll(): User[] {
    return Array.from(this.users.values());
  }

  public getById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getByEmail(email: string): User | undefined {
    const normalizedEmail = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase().trim() === normalizedEmail) {
        return user;
      }
    }
    return undefined;
  }

  public create(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  public clear(): void {
    this.users.clear();
  }

  public count(): number {
    return this.users.size;
  }
}

export const userStore = new UserStore();
