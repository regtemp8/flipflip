import { NavigateFunction } from "react-router-dom";
import { INewRecord, IRecord } from "./types/record";
import { ICredentials } from "./types/credentials";
import store from "./store/store";
import { setAuthenticated } from "./store/auth/slice";

function handleError(response: Response, navigate: NavigateFunction, strategy: 'log' | 'throw') {
  if (response.ok) {
    return true
  }

  if (response.status === 401) {
    store.dispatch(setAuthenticated(false))
  } else if (response.status === 404) {
    console.warn(`${response.url} status: ${response.status}`);
    navigate("/");
  } else if (strategy == 'log') {
    const message = `An error occurred: ${response.statusText}`;
    console.error(message);
  } else {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return false
}

export async function passwordLogin(credentials: ICredentials, navigate: NavigateFunction) {
  const response = await fetch("http://localhost:5050/login/password", {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const isOk = handleError(response, navigate, 'throw')
  store.dispatch(setAuthenticated(isOk))
  if(isOk) {
    navigate("/")
  }
}

export async function tokenLogin(token: string, navigate: NavigateFunction) {
  const response = await fetch("http://localhost:5050/login/token?token=" + token, {
    method: "GET",
    credentials: 'include'
  });

  const isOk = handleError(response, navigate, 'throw')
  store.dispatch(setAuthenticated(isOk))
  if(isOk) {
    navigate("/")
  }
}

export async function logout(navigate: NavigateFunction) {
  const response = await fetch("http://localhost:5050/logout", {
    method: "POST",
    credentials: 'include'
  });

  handleError(response, navigate, 'throw')
  store.dispatch(setAuthenticated(false))
}

export async function connect(navigate: NavigateFunction) {
  const response = await fetch("http://localhost:5050/connect", {
    credentials: 'include'
  });

  const isOk = handleError(response, navigate, 'throw')
  return isOk ? await response.json() : undefined
}

export async function isAuthenticated(navigate: NavigateFunction) {
  const response = await fetch("http://localhost:5050/authenticated", {
    credentials: 'include'
  });

  handleError(response, navigate, 'throw')
  store.dispatch(setAuthenticated(response.ok))
}

export async function getRecords(navigate: NavigateFunction): Promise<IRecord[]> {
  const response = await fetch(`http://localhost:5050/record/`, {    
    credentials: 'include'
  });
  const isOk = handleError(response, navigate, 'log')
  return isOk ? await response.json() : [];
}

export async function getRecord(id: number, navigate: NavigateFunction): Promise<IRecord | undefined> {
  const response = await fetch(`http://localhost:5050/record/${id}`, {
    credentials: 'include'
  });
  const isOk = handleError(response, navigate, 'log')
  return isOk ? await response.json() : undefined;
}

export async function createRecord(person: INewRecord, navigate: NavigateFunction): Promise<void> {
  const response = await fetch("http://localhost:5050/record", {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(person),
  });

  handleError(response, navigate, 'throw')
}

export async function updateRecord(person: IRecord, navigate: NavigateFunction): Promise<void> {
  const response = await fetch(`http://localhost:5050/record/${person.id}`, {
    method: "PATCH",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(person),
  });

  handleError(response, navigate, 'throw')
}

export async function deleteRecord(id: number, navigate: NavigateFunction): Promise<void> {
  const response = await fetch(`http://localhost:5050/record/${id}`, {
    method: "DELETE",
    credentials: 'include'
  });

  handleError(response, navigate, 'throw')
}