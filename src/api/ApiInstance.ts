import axios from "axios";

class ApiInstance {
  public getApi(baseURL: string) {
    const instance = axios.create({
      baseURL: baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.response.use();

    return instance;
  }
}

export default new ApiInstance();
