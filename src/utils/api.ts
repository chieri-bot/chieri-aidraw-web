import {BaseRetData, GetCostResponse, LeftPointResponse, LoginData, UserInfo} from "./models.ts";


const apiEndpoint = import.meta.env.VITE_API_ENDPOINT


export async function fetchAPI(path: string, method: string, body?: any) {
    return await fetch(`${apiEndpoint}/${path}`, {
        method,
        credentials: "include",
        headers: {
            "Authorization": `chieribot ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined,
    })
}


export async function apiRegister(userName: string, password: string, email: string): Promise<BaseRetData> {
    const resp = await fetchAPI("ai/draw/register", "POST", {
        username: userName,
        passwd: password,
        email: email
    })
    return resp.json()
}

export async function apiLogin(userName: string, password: string): Promise<LoginData> {
    const resp = await fetchAPI("ai/draw/login", "POST", {
        username: userName,
        passwd: password
    })
    return resp.json()
}

export async function apiGetUserInfo(): Promise<UserInfo> {
    const resp = await fetchAPI("ai/draw/get_user_info", "GET")
    return resp.json()
}

export async function apiGenerate(body: any) {
    return await fetchAPI("ai/draw/generate", "POST", body)
}

export async function apiGetCost(body: any): Promise<GetCostResponse> {
    const resp = await fetchAPI("ai/draw/get_cost", "POST", body)
    return resp.json()
}

export async function apiGetLeftPoint(): Promise<LeftPointResponse> {
    const resp = await fetchAPI("ai/draw/get_left_point", "GET")
    return resp.json()
}

export async function apiLogout() {
    return await fetchAPI("ai/draw/logout", "POST")
}

export async function apiChangePassword(newPass: string): Promise<BaseRetData> {
    const resp = await fetchAPI("ai/draw/change_password", "POST", {
        new_passwd: newPass
    })
    return resp.json()
}

export async function apiBindQQ(): Promise<BaseRetData> {
    const resp = await fetchAPI("ai/draw/request_bind_qq", "POST")
    return resp.json()
}

export async function apiChangeEmail(newPass: string): Promise<BaseRetData> {
    const resp = await fetchAPI("ai/draw/change_email", "POST", {
        new_email: newPass
    })
    return resp.json()
}

