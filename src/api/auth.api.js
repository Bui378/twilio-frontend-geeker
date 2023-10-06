/** @format */

import apiClient from "./index";
// import mixpanel from 'mixpanel-browser';
import { guestData, secretPassKey } from "../constants";

// export async function EmailLogin(data){
//     console.log()
// }
var CryptoJS = require("crypto-js");
export async function verifyEmail(data) {
  // body...
  return apiClient.post("/auth/verify-email", data).then((response) => {
    if (response) {
      return response.data;
    }
    return Promise.reject();
  });
}
export async function login(data) {
  var ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data.password),
    secretPassKey
  ).toString();
  data.password = ciphertext;

  return apiClient
    .post("/auth/login", data)

    .then((response) => {
      // console.log('Login response (auth.api) ::',response)
      if (response && response.data) {
        console.log(response, ">>response to see>");
        return response.data;
      }
      return Promise.reject();
    });
}

export async function register(data) {
  return apiClient.post("/auth/register", data).then((response) => {
    if (response) {
      return response.data;
    }
    return Promise.reject();
  });
}

export async function getCurrentUser() {
  return apiClient
    .get("/users/current")
    .then((response) => {
      const { accessToken } = response.data;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      return Promise.resolve(response.data);
    })
    .catch((err) => {
      return Promise.reject();
    });
}

export async function forgotPassword(payload) {
  return apiClient.post("auth/forgot-password", payload).then((response) => {
    if (response) {
      return response.data;
    }
    return Promise.reject();
  });
}

export async function resetPassword(payload) {
  return apiClient
    .post("auth/reset-password", payload)
    .then((response) => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    .catch((e) => {
      console.log(">>>payload", payload);
      console.log(e, ">>>>>");
    });
}

export async function loginFacebook(payload) {
  return apiClient.post("auth/facebook", payload).then((response) => {
    if (response) {
      return response.data;
    }
    return Promise.reject();
  });
}

export async function loginGoogle(payload) {
  return apiClient.post("auth/google", payload).then((response) => {
    if (response) {
      return response.data;
    }
    return Promise.reject();
  });
}

export async function checkEmail(data) {
  return apiClient.post("/auth/check-email", data).then((response) => {
    if (response) {
      return response.data;
    }
    return Promise.reject();
  });
}

export async function getGuestUser(maxRetry = 1) {
  //Write hardcode as per Chintan sir said do it fastly.
  var ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(guestData.user_password),
    secretPassKey
  ).toString();
  guestData.password = ciphertext;
  console.log("Going to login guest user ....");
  return apiClient
    .post("/auth/login", guestData)

    .then((response) => {
      console.log("getGuestUser Login response (auth.api) ::", response);
      if (response && response.data) {
        return response.data;
      }
      return Promise.reject();
    })
    .catch((err) => {
      console.log("error in getGuestUser api ::::::", err);

      setTimeout(() => {
        if (maxRetry === undefined) {
          let maxRetry = 1;
        } else {
          maxRetry += 1;
        }
        if (maxRetry <= 5) {
          console.log(
            "Error while login guest user, so going to retry " +
              maxRetry +
              " time"
          );
          getGuestUser(maxRetry);
        }
      }, 2000);
    });
}
