
export interface BaseRetData {
    success: boolean,
    msg: string
}

export interface LoginData extends BaseRetData{
    token?: string,
    expiration?: number
}

export interface UserDataResponse {
    bind_qq: string | null,
    email: string,
    left_point: number | string,
    monthly_expiration: number,
    uid: number,
    user_name: string
}

export interface UserInfo extends BaseRetData {
    data?: UserDataResponse
}

export interface UserData extends UserDataResponse {
    left_point: number
}

export interface LeftPointResponse extends BaseRetData{
    left_point: number | string
    qq: string
}

export interface GetCostResponse extends BaseRetData {
    cost: number
}

export interface BasePrompts {
    prompt: string[],
    model: string,
    action: string,
    eco_chieri: boolean,
    parameters: {
        width: number,
        height: number,
        steps: number,
        scale: number,
        seed: number | string,
        ucPreset: number,
        sampler: string,
        sm: boolean,
        sm_dyn: boolean,
        dynamic_thresholding: boolean,
        negative_prompt: string[],
    },
    img2imgPara: {
        image: string,
        strength: number,
        noise: number,
        // extra_noise_seed: number
    },
    advanced: {
        "uncond_scale": number,
        "cfg_rescale": number,
        "noise_schedule": string,
    },
    otherSets: {
        addQualityTags: boolean
        ucPresetType: string
        resolutionSelect: string | null
    }
}

export interface Rect {
    width: number
    height: number
}

export interface SaveImageBlob {
    data: Blob,
    url: string,
    seed: number
}
