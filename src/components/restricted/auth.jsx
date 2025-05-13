import { getState } from "../../store/configure/configureStore";

class Auth {
  constructor() {
    this.authenticated = true;
  }

  isAuthenticated() {
    console.log("state is",getState())
    const token = getState().auth?.user?.id;
    if (!token ) {
      this.authenticated = false;
    } else {
      this.authenticated = true;
    }

    return this.authenticated;
  }
}

export default new Auth();