import formData from "./formData";

export function get<T>(url: string, data: StringMap): Promise<T> {
  return jhr((xhr: XMLHttpRequest) => {
    xhr.open("GET", `${url}?${formData(data)}`.replace(/\?$/, ''));
    xhr.send();
  });
}

export function post<T>(url: string, data: StringMap): Promise<T> {
  return jhr((xhr: XMLHttpRequest) => {
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(formData(data));
  });
}

function jhr<T>(sender: (xhr: XMLHttpRequest) => void): Promise<T> {
  return new Promise((
    fulfill: (data?: T) => any,
    reject: (errors: KeratinError[]) => any
  ) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true; // enable authentication server cookies
    xhr.onreadystatechange = () => {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        const data: {result?: T, errors?: KeratinError[]} = (xhr.responseText.length > 1) ? JSON.parse(xhr.responseText) : {};

        if (data.result) {
          fulfill(data.result);
        } else if (data.errors) {
          reject(data.errors);
        } else if (xhr.status >= 200 && xhr.status < 400) {
          fulfill()
        } else {
          reject([{message: xhr.statusText}]);
        }
      }
    };
    sender(xhr);
  });
}
